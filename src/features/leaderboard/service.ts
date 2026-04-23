import { supabase } from "./supabase";
import type { LeaderboardEntry, SubmitRunPayload } from "./types";

function formatElapsedTime(ms: number): string {
  const clampedMs = Math.max(0, ms);
  const totalSeconds = Math.floor(clampedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((clampedMs % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export async function submitRun(payload: SubmitRunPayload): Promise<string> {
  try {
    console.log("Submitting run to Supabase:", payload);

    const { data, error } = await supabase
      .from("leaderboard")
      .insert([
        {
          player_name: payload.playerName,
          elapsed_ms: payload.elapsedMs,
          wumpus_killed: payload.wumpusKilled,
          treasure_collected: payload.treasureCollected,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    const docId = data?.[0]?.id?.toString();
    console.log("Run submitted successfully with ID:", docId);
    return docId || "unknown";
  } catch (error) {
    console.error("Error submitting run:", error);
    throw error;
  }
}

export async function fetchLeaderboard(topCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("elapsed_ms", { ascending: true })
      .limit(topCount);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return (
      data?.map((row) => ({
        id: row.id.toString(),
        playerName: row.player_name || "Anonymous",
        elapsedMs: row.elapsed_ms || 0,
        wumpusKilled: row.wumpus_killed || false,
        treasureCollected: row.treasure_collected || false,
        timestamp: new Date(row.created_at).getTime(),
        formattedTime: formatElapsedTime(row.elapsed_ms || 0),
      })) || []
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}
}

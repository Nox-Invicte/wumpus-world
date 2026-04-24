import { supabase } from "./supabase";
import { saveRunLocally, getLeaderboardLocally } from "./localStorage";
import type { LeaderboardEntry, SubmitRunPayload, SupabaseLeaderboardRow } from "./types";

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

    const docData = {
      player_name: payload.playerName,
      elapsed_ms: payload.elapsedMs,
      wumpus_killed: payload.wumpusKilled,
      treasure_collected: payload.treasureCollected,
      timestamp: new Date().toISOString(),
    };
    console.log("About to insert data:", docData);

    const { data, error } = await supabase
      .from("leaderboard")
      .insert([docData])
      .select();

    if (error) {
      throw new Error(`Failed to submit run: ${error.message}`);
    }

    const insertedRecord = data?.[0];
    if (!insertedRecord) {
      throw new Error("No data returned after insert");
    }

    console.log("Run submitted successfully to Supabase with ID:", insertedRecord.id);
    return insertedRecord.id;
  } catch (error) {
    console.error("Error submitting run to Supabase:", error);
    console.warn("Falling back to localStorage");

    // Fallback to localStorage
    try {
      const localId = saveRunLocally(payload);
      console.log("Run saved to localStorage instead (ID:", localId + ")");
      return localId;
    } catch (localError) {
      console.error("Both Supabase and localStorage failed:", localError);
      throw new Error("Failed to submit run: Supabase unavailable and could not save locally");
    }
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
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    const entries: LeaderboardEntry[] = (data || []).map((row: SupabaseLeaderboardRow) => ({
      id: String(row.id),
      playerName: row.player_name || "Anonymous",
      elapsedMs: row.elapsed_ms || 0,
      wumpusKilled: row.wumpus_killed || false,
      treasureCollected: row.treasure_collected || false,
      timestamp: new Date(row.timestamp).getTime(),
      formattedTime: formatElapsedTime(row.elapsed_ms || 0),
    }));

    return entries;
  } catch (error) {
    console.error("Error fetching leaderboard from Supabase:", error);
    console.warn("Falling back to localStorage");

    // Fallback to localStorage
    try {
      const localEntries = getLeaderboardLocally(topCount);
      console.log(`Loaded ${localEntries.length} entries from localStorage`);
      return localEntries;
    } catch (localError) {
      console.error("Both Supabase and localStorage failed:", localError);
      // Return empty array instead of throwing, so the UI doesn't break
      return [];
    }
  }
}

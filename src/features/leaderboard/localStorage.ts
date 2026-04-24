import type { LeaderboardEntry, SubmitRunPayload } from "./types";

const LEADERBOARD_KEY = "wumpus_leaderboard";

export interface LocalLeaderboardEntry extends Omit<LeaderboardEntry, "id"> {
  id: string;
}

/**
 * Save a run to localStorage
 */
export function saveRunLocally(payload: SubmitRunPayload): string {
  const entries = getLeaderboardLocally();

  // Generate a unique ID
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newEntry: LocalLeaderboardEntry = {
    id,
    playerName: payload.playerName,
    elapsedMs: payload.elapsedMs,
    wumpusKilled: payload.wumpusKilled,
    treasureCollected: payload.treasureCollected,
    timestamp: Date.now(),
    formattedTime: formatElapsedTime(payload.elapsedMs),
  };

  // Add to entries and sort by time
  entries.push(newEntry);
  entries.sort((a, b) => a.elapsedMs - b.elapsedMs);

  // Keep only top 100 to avoid bloating localStorage
  const limitedEntries = entries.slice(0, 100);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(limitedEntries));
    console.log("Run saved to localStorage with ID:", id);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    throw new Error("Failed to save run locally");
  }

  return id;
}

/**
 * Get all leaderboard entries from localStorage
 */
export function getLeaderboardLocally(topCount: number = 10): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) {
      return [];
    }

    const entries: LocalLeaderboardEntry[] = JSON.parse(data);
    return entries.slice(0, topCount) as LeaderboardEntry[];
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return [];
  }
}

/**
 * Clear all leaderboard data from localStorage
 */
export function clearLeaderboardLocally(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    console.log("Leaderboard cleared from localStorage");
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

function formatElapsedTime(ms: number): string {
  const clampedMs = Math.max(0, ms);
  const totalSeconds = Math.floor(clampedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((clampedMs % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

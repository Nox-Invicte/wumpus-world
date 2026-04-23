"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../service";
import type { LeaderboardEntry } from "../types";

type LeaderboardProps = {
  topCount?: number;
};

export function Leaderboard({ topCount = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLeaderboard(topCount);
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [topCount]);

  if (loading) {
    return (
      <div className="text-center text-zinc-300 py-4">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-4">
        Error: {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center text-zinc-300 py-4">
        No entries yet. Be the first to complete a run!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-zinc-300 pb-2 border-b border-[#001f3f]/45">
        <div>Rank</div>
        <div>Player</div>
        <div>Time</div>
        <div>Status</div>
      </div>
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className="grid grid-cols-4 gap-2 text-sm text-zinc-100 py-2 border-b border-[#001f3f]/20"
        >
          <div className="font-semibold">#{index + 1}</div>
          <div className="truncate">{entry.playerName}</div>
          <div className="font-mono">{entry.formattedTime}</div>
          <div className="text-xs">
            {entry.treasureCollected ? (
              <span className="text-green-400">Won</span>
            ) : (
              <span className="text-red-400">Lost</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

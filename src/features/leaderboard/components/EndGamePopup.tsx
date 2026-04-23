"use client";

import { useState } from "react";
import { Leaderboard } from "./Leaderboard";
import { submitRun } from "../service";
import type { SubmitRunPayload } from "../types";

type EndGamePopupProps = {
  isOpen: boolean;
  won: boolean;
  elapsedMs: number;
  wumpusKilled: boolean;
  onRestart: () => void;
  onClose: () => void;
};

export function EndGamePopup({
  isOpen,
  won,
  elapsedMs,
  wumpusKilled,
  onRestart,
  onClose,
}: EndGamePopupProps) {
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatElapsedTime(ms: number): string {
    const clampedMs = Math.max(0, ms);
    const totalSeconds = Math.floor(clampedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((clampedMs % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }

  const handleSubmitRun = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload: SubmitRunPayload = {
        playerName: playerName.trim(),
        elapsedMs,
        wumpusKilled,
        treasureCollected: won,
      };
      await submitRun(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit run");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setPlayerName("");
    setSubmitted(false);
    setError(null);
    onRestart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#001f3f] border-2 border-[#003366] rounded-2xl p-6 max-w-2xl w-11/12 max-h-96 overflow-y-auto shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-100 hover:text-red-400 transition-colors"
          aria-label="Close popup"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-zinc-100 mb-4">
          {won ? "🎉 You Win!" : "💀 Game Over"}
        </h1>

        <div className="mb-6 text-lg text-zinc-100 space-y-2">
          <div>Time: <span className="font-mono font-semibold">{formatElapsedTime(elapsedMs)}</span></div>
          <div>Wumpus: <span className={wumpusKilled ? "text-green-400" : "text-red-400"}>{wumpusKilled ? "Killed ✓" : "Alive"}</span></div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Leaderboard</h2>
          <div className="bg-[#000f1f]/60 rounded-lg p-4 border border-[#001f3f]/45">
            <Leaderboard topCount={8} />
          </div>
        </div>

        {won && !submitted && (
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-zinc-100 mb-2">
                Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmitRun();
                  }
                }}
                placeholder="Enter your name"
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg bg-[#003366] border border-[#001f3f]/45 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#0066cc]"
                autoFocus
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
        )}

        {submitted && (
          <div className="mb-6 text-green-400 text-center font-semibold">
            Run submitted! ✓
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {won && !submitted && (
            <button
              onClick={handleSubmitRun}
              disabled={submitting || !playerName.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-lg transition"
            >
              {submitting ? "Submitting..." : "Submit Run"}
            </button>
          )}
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-lg transition"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

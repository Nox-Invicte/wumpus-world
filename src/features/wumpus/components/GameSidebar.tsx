import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import type { GameState } from "@/features/wumpus/types";

type Props = {
  game: GameState;
  percepts: string[];
  ended: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onShootArrow: () => void;
  onGrabGold: () => void;
  onResetGame: () => void;
  upButtonRef: RefObject<HTMLButtonElement | null>;
  downButtonRef: RefObject<HTMLButtonElement | null>;
  leftButtonRef: RefObject<HTMLButtonElement | null>;
  rightButtonRef: RefObject<HTMLButtonElement | null>;
  grabButtonRef: RefObject<HTMLButtonElement | null>;
  shootButtonRef: RefObject<HTMLButtonElement | null>;
  resetButtonRef: RefObject<HTMLButtonElement | null>;
};

export function GameSidebar({
  game,
  percepts,
  ended,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onShootArrow,
  onGrabGold,
  onResetGame,
  upButtonRef,
  downButtonRef,
  leftButtonRef,
  rightButtonRef,
  grabButtonRef,
  shootButtonRef,
  resetButtonRef,
}: Props) {
  const actionButtonClass = cn(
    "rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white",
    "hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
  );

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[#000080]/30 bg-[#000080]/20 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Status</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-200">
          <div>Position: ({game.agent.x},{game.agent.y})</div>
          <div>Direction: {game.direction}</div>
          <div>Score: {game.score}</div>
          <div>Arrows: {game.arrows}</div>
          <div>Gold: {game.hasGold ? "Yes" : "No"}</div>
          <div>Wumpus: {game.wumpusAlive ? "Alive" : "Dead"}</div>
        </div>

        <div className="mt-3 rounded-md bg-black/30 p-2 text-sm text-zinc-200">
          Percepts: {percepts.join(", ")}
        </div>

        <div className="mt-2 rounded-md bg-black/30 p-2 text-sm text-zinc-100">{game.message}</div>

        {!game.alive && <p className="mt-2 text-sm font-semibold text-red-400">Game over.</p>}
        {game.escaped && <p className="mt-2 text-sm font-semibold text-emerald-400">Run complete.</p>}
      </section>

      <section className="rounded-xl border border-[#000080]/30 bg-[#000080]/20 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            ref={upButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onMoveUp}
          >
            Move Up
          </button>
          <button
            ref={downButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onMoveDown}
          >
            Move Down
          </button>
          <button
            ref={leftButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onMoveLeft}
          >
            Move Left
          </button>
          <button
            ref={rightButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onMoveRight}
          >
            Move Right
          </button>
          <button
            ref={grabButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onGrabGold}
          >
            Pick Up
          </button>
          <button
            ref={shootButtonRef}
            className={actionButtonClass}
            disabled={ended}
            onClick={onShootArrow}
          >
            Shoot Arrow
          </button>
        </div>

        <button
          ref={resetButtonRef}
          className="mt-3 w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
          onClick={onResetGame}
        >
          New Game
        </button>
      </section>

      <section className="rounded-xl border border-[#000080]/30 bg-[#000080]/20 p-4 text-sm text-zinc-200 shadow-sm backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">How To Win</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Use percepts to infer danger: Breeze near pits, Stench near Wumpus.</li>
          <li>Find and pick up the treasure.</li>
          <li>Return to the entrance gate and move through it to exit.</li>
        </ol>
        <div className="mt-3 text-xs text-zinc-300">
          <div>Keys:</div>
          <div className="mt-1 space-y-0.5 pl-2">
            <div><kbd className="rounded border border-white/20 bg-white/10 px-1 font-mono text-white">Arrow Keys</kbd> / <kbd className="rounded border border-white/20 bg-white/10 px-1 font-mono text-white">WASD</kbd> move</div>
            <div><kbd className="rounded border border-white/20 bg-white/10 px-1 font-mono text-white">Z</kbd> pick up treasure</div>
            <div><kbd className="rounded border border-white/20 bg-white/10 px-1 font-mono text-white">X</kbd> shoot</div>
            <div><kbd className="rounded border border-white/20 bg-white/10 px-1 font-mono text-white">N</kbd> new game</div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BOARD_SIZE, PIT_COUNT, START } from "@/features/wumpus/constants";
import { GameBoard } from "@/features/wumpus/components/GameBoard";
import { initialGameState, stepForward } from "@/features/wumpus/logic/game";
import { createWorld, inBounds, keyAt, neighbors, samePos } from "@/features/wumpus/logic/world";
import type { Direction, GameState, TurnDirection } from "@/features/wumpus/types";
import { EndGamePopup } from "@/features/leaderboard/components/EndGamePopup";

function formatElapsedTime(ms: number): string {
  const clampedMs = Math.max(0, ms);
  const totalSeconds = Math.floor(clampedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((clampedMs % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function WumpusGame() {
  const [world, setWorld] = useState(() => createWorld(BOARD_SIZE, PIT_COUNT));
  const [game, setGame] = useState<GameState>(() => initialGameState());
  const [tileSeed, setTileSeed] = useState(() => crypto.randomUUID());
  const [tick, setTick] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [lastMoveTick, setLastMoveTick] = useState(-100);
  const lastTurnTick = -100;
  const lastTurnDirection: TurnDirection = "L";

  const ended = !game.alive || game.escaped;
  const nowMs = game.finishedAtMs ?? currentTimeMs;
  const elapsedMs = game.startedAtMs
    ? Math.max(0, nowMs - game.startedAtMs + game.timeAdjustmentMs)
    : 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((prev) => prev + 1);
      setCurrentTimeMs(Date.now());
    }, 130);

    return () => window.clearInterval(timer);
  }, []);

  const percepts = useMemo(() => {
    const senses: string[] = [];
    const adjacent = neighbors(game.agent, world.size);

    const nearPit = adjacent.some((p) => world.pits.has(keyAt(p)));
    if (nearPit) senses.push("Breeze");

    if (game.wumpusAlive && adjacent.some((p) => samePos(p, world.wumpus))) {
      senses.push("Stench");
    }

    if (!game.hasGold && samePos(game.agent, world.gold)) {
      senses.push("Glitter");
    }

    if (game.bump) senses.push("Bump");
    if (game.scream) senses.push("Scream");

    return senses.length > 0 ? senses : ["Quiet"];
  }, [game, world]);

  const applyAction = useCallback((updater: (prev: GameState) => GameState) => {
    setGame((prev) => {
      if (!prev.alive || prev.escaped) {
        return { ...prev, bump: false, scream: false };
      }
      const updated = updater({ ...prev, bump: false, scream: false });
      if (prev.startedAtMs === null && updated.startedAtMs === null) {
        updated.startedAtMs = Date.now();
      }
      return updated;
    });
  }, []);

  const moveInDirection = useCallback((direction: Direction) => {
    setLastMoveTick(tick);
    applyAction((prev) => {
      const nextPos = stepForward(prev.agent, direction);
      if (!inBounds(nextPos, world.size)) {
        const atGate = samePos(prev.agent, START) && direction === "N";
        if (atGate) {
          if (!prev.hasGold) {
            return {
              ...prev,
              direction,
              message: "This gate is the exit. Collect the treasure before leaving.",
            };
          }

          return {
            ...prev,
            direction,
            escaped: true,
            finishedAtMs: Date.now(),
            popupShown: true,
            message: "You exit through the gate with the treasure. You win!",
          };
        }

        return {
          ...prev,
          direction,
          bump: true,
          message: "Bump! A wall blocks your path.",
        };
      }

      const nextVisited = new Set(prev.visited);
      nextVisited.add(keyAt(nextPos));

      if (world.pits.has(keyAt(nextPos))) {
        return {
          ...prev,
          direction,
          agent: nextPos,
          visited: nextVisited,
          alive: false,
          finishedAtMs: Date.now(),
          popupShown: true,
          message: "You fell into a pit.",
        };
      }

      if (prev.wumpusAlive && samePos(nextPos, world.wumpus)) {
        return {
          ...prev,
          direction,
          agent: nextPos,
          visited: nextVisited,
          alive: false,
          finishedAtMs: Date.now(),
          popupShown: true,
          message: "The Wumpus got you.",
        };
      }

      return {
        ...prev,
        direction,
        agent: nextPos,
        visited: nextVisited,
        message: "You move forward.",
      };
    });
  }, [applyAction, tick, world]);

  const grabGold = useCallback(() => {
    applyAction((prev) => {
      if (prev.hasGold) {
        return {
          ...prev,
          message: "You are already carrying the gold.",
        };
      }

      if (samePos(prev.agent, world.gold)) {
        return {
          ...prev,
          hasGold: true,
          message: "You picked up the gold.",
        };
      }

      return {
        ...prev,
        message: "Nothing to grab here.",
      };
    });
  }, [applyAction, world.gold]);

  const shootArrow = useCallback(() => {
    applyAction((prev) => {
      if (prev.arrows < 1) {
        return {
          ...prev,
          message: "No arrows left.",
        };
      }

      let probe = stepForward(prev.agent, prev.direction);
      let hitWumpus = false;

      while (inBounds(probe, world.size)) {
        if (prev.wumpusAlive && samePos(probe, world.wumpus)) {
          hitWumpus = true;
          break;
        }
        probe = stepForward(probe, prev.direction);
      }

      return {
        ...prev,
        arrows: prev.arrows - 1,
        wumpusAlive: hitWumpus ? false : prev.wumpusAlive,
        timeAdjustmentMs:
          hitWumpus && prev.wumpusAlive ? prev.timeAdjustmentMs - 5000 : prev.timeAdjustmentMs,
        scream: hitWumpus,
        message: hitWumpus
          ? "Your arrow hit the Wumpus. You hear a scream. -5.00s time bonus!"
          : "Your arrow misses everything.",
      };
    });
  }, [applyAction, world.size, world.wumpus]);

  const resetGame = useCallback(() => {
    setWorld(createWorld(BOARD_SIZE, PIT_COUNT));
    setGame(initialGameState());
    setTileSeed(crypto.randomUUID());
  }, []);

  const closePopup = useCallback(() => {
    setGame((prev) => ({ ...prev, popupShown: false }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "n") {
        event.preventDefault();
        resetGame();
        return;
      }

      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        moveInDirection("N");
        return;
      }

      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        moveInDirection("S");
        return;
      }

      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        moveInDirection("W");
        return;
      }

      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        moveInDirection("E");
        return;
      }

      if (key === "z") {
        event.preventDefault();
        grabGold();
        return;
      }

      if (key === "x") {
        event.preventDefault();
        shootArrow();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [grabGold, moveInDirection, resetGame, shootArrow]);

  return (
    <>
      <EndGamePopup
        isOpen={game.popupShown && ended}
        won={game.escaped}
        elapsedMs={elapsedMs}
        wumpusKilled={!game.wumpusAlive}
        onRestart={resetGame}
        onClose={closePopup}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 p-2 md:p-8">
      <section className="grid w-full gap-3 md:gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-3 md:gap-4 order-2 lg:order-1">
          <div className="rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-3 md:p-4 shadow-sm backdrop-blur-md">
            <h2 className="text-lg md:text-xl font-semibold text-zinc-100">Scoreboard</h2>
            <div className="mt-3 space-y-1 text-base md:text-lg text-zinc-100">
              <div>Time: {formatElapsedTime(elapsedMs)}</div>
              <div>Arrows: {game.arrows}</div>
              <div>Treasure: {game.hasGold ? "Collected" : "Missing"}</div>
              <div>Wumpus: {game.wumpusAlive ? "Alive" : "Dead"}</div>
            </div>

            <div className="mt-4 rounded-md border border-[#001f3f]/45 bg-[#001f3f]/35 p-2 text-xs md:text-sm text-zinc-100 backdrop-blur-sm">
              {game.message}
            </div>
          </div>

          <div className="rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-3 md:p-4 shadow-sm backdrop-blur-md">
            <h2 className="text-lg md:text-2xl font-semibold text-zinc-100">Percepts</h2>
            <div className="mt-3 text-base md:text-lg text-zinc-100 font-medium">
              {percepts.join(", ")}
            </div>
          </div>

          <div className="rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-3 md:p-4 shadow-sm backdrop-blur-md hidden md:block">
            <h2 className="text-xl font-semibold text-zinc-100">Controls</h2>
            <div className="mt-2 space-y-1 text-base text-zinc-100">
              <div>Move: Arrow Keys or WASD</div>
              <div>Pick Up: Z</div>
              <div>Shoot: X</div>
              <div>New Game: N</div>
            </div>
          </div>

          {ended && (
            <div className="rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-3 md:p-4 shadow-sm backdrop-blur-md">
              <div className="text-base md:text-lg font-semibold text-zinc-100">
                {game.escaped
                  ? `Game Won in ${formatElapsedTime(elapsedMs)}`
                  : `Game Over at ${formatElapsedTime(elapsedMs)}`}
              </div>
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-col gap-3 order-1 lg:order-2">
          <GameBoard
            world={world}
            game={game}
            tileSeed={tileSeed}
            tick={tick}
            lastMoveTick={lastMoveTick}
            lastTurnTick={lastTurnTick}
            lastTurnDirection={lastTurnDirection}
            ended={ended}
          />
          
          {/* Mobile Controls */}
          <div className="md:hidden rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-4 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-3">
              {/* Direction Controls */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => moveInDirection("N")}
                  className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xl transition-colors"
                  aria-label="Move North"
                >
                  ↑
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveInDirection("W")}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xl transition-colors"
                    aria-label="Move West"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => moveInDirection("S")}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xl transition-colors"
                    aria-label="Move South"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => moveInDirection("E")}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xl transition-colors"
                    aria-label="Move East"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Action Controls */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={grabGold}
                  className="bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                  aria-label="Grab Gold"
                >
                  Grab (Z)
                </button>
                <button
                  onClick={shootArrow}
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                  aria-label="Shoot Arrow"
                >
                  Shoot (X)
                </button>
                <button
                  onClick={resetGame}
                  className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                  aria-label="New Game"
                >
                  New (N)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

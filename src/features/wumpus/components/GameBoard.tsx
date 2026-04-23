import Image from "next/image";
import {
  GOLD_SRC,
  PIT_SRC,
  PLAYER_IDLE_SPRITE_SRC,
  PLAYER_RUN_PULSE_TICKS,
  PLAYER_RUN_SPRITE_SRC,
  PLAYER_SPRITE_COLS,
  PLAYER_SPRITE_ROWS,
  START,
  WUMPUS_SPRITE_SRC,
  ZOMBIE_SPRITE_COLS,
  ZOMBIE_SPRITE_ROWS,
} from "@/features/wumpus/constants";
import { directionToSpriteRow, floorTileSource, paddingWallSource, spriteFrameStyle, tileImageStyle } from "@/features/wumpus/logic/render";
import { keyAt, samePos } from "@/features/wumpus/logic/world";
import type { GameState, TurnDirection, World } from "@/features/wumpus/types";

type Props = {
  world: World;
  game: GameState;
  tileSeed: string;
  tick: number;
  lastMoveTick: number;
  lastTurnTick: number;
  lastTurnDirection: TurnDirection;
  ended: boolean;
};

export function GameBoard({
  world,
  game,
  tileSeed,
  tick,
  lastMoveTick,
  lastTurnTick,
  lastTurnDirection,
  ended,
}: Props) {
  const paddedSize = world.size + 2;
  const playerRunning = !ended && tick - lastMoveTick <= PLAYER_RUN_PULSE_TICKS;
  const playerFrame = tick % PLAYER_SPRITE_COLS;
  const zombieFrame = tick % ZOMBIE_SPRITE_COLS;
  const turnPulseActive = !ended && tick - lastTurnTick <= 1;
  const turnNudgePx = turnPulseActive ? (lastTurnDirection === "L" ? -5 : 5) : 0;

  return (
    <div className="rounded-xl border border-[#001f3f]/45 bg-[#001f3f]/35 p-4 shadow-sm backdrop-blur-md">
      <div className="relative">
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${paddedSize}, minmax(0, 1fr))` }}>
          {Array.from({ length: paddedSize * paddedSize }).map((_, index) => {
            const vx = index % paddedSize;
            const vy = Math.floor(index / paddedSize);
            const isPlayable = vx > 0 && vy > 0 && vx <= world.size && vy <= world.size;

            const x = vx - 1;
            const y = vy - 1;
            const pos = { x, y };
            const k = keyAt(pos);

            const isVisited = isPlayable && game.visited.has(k);
            const isKnown = isPlayable && (ended || isVisited || samePos(pos, game.agent));

            const hasPit = isPlayable && world.pits.has(k);
            const hasWumpus = isPlayable && samePos(pos, world.wumpus);
            const hasGold = isPlayable && !game.hasGold && samePos(pos, world.gold);
            const isStart = isPlayable && samePos(pos, START);

            const showPit = isKnown && hasPit;
            const showWumpus = isKnown && hasWumpus && game.wumpusAlive;
            const showGold = isKnown && hasGold;
            const showDeadWumpus = isKnown && hasWumpus && !game.wumpusAlive;

            const tileSrc = isPlayable
              ? showPit
                ? PIT_SRC
                : floorTileSource(x, y, tileSeed)
              : paddingWallSource(vx, vy, world.size);

            return (
              <div key={`${vx},${vy}`} className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0" style={tileImageStyle(tileSrc)} />

                {isPlayable && !isKnown && <div className="absolute inset-0 bg-zinc-900/18" />}

                {showGold && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src={GOLD_SRC}
                      alt="Gold"
                      width={28}
                      height={28}
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                )}

                {showWumpus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      style={spriteFrameStyle(
                        WUMPUS_SPRITE_SRC,
                        ZOMBIE_SPRITE_COLS,
                        ZOMBIE_SPRITE_ROWS,
                        zombieFrame,
                        0,
                        16,
                        16,
                        4,
                      )}
                    />
                  </div>
                )}

                {showDeadWumpus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded bg-zinc-900/80 px-1 py-0.5 text-[10px] font-semibold text-zinc-100">
                      DEAD
                    </div>
                  </div>
                )}

                {isPlayable && (
                  <>
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {isStart && (
                        <span className="rounded bg-emerald-900/70 px-1 py-0.5 text-[10px] text-emerald-100">
                          S
                        </span>
                      )}
                      {!isKnown && (
                        <span className="rounded bg-zinc-900/70 px-1 py-0.5 text-[10px] text-zinc-100">
                          ?
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!game.escaped && (
          <div
            className="pointer-events-none absolute z-20 flex items-center justify-center transition-[left,top,transform] duration-300 ease-out"
            style={{
              width: `calc(100% / ${paddedSize})`,
              height: `calc(100% / ${paddedSize})`,
              left: `calc(${game.agent.x + 1} * (100% / ${paddedSize}))`,
              top: `calc(${game.agent.y + 1} * (100% / ${paddedSize}))`,
              transform: `translateX(${turnNudgePx}px)`,
            }}
          >
            <div
              style={spriteFrameStyle(
                playerRunning ? PLAYER_RUN_SPRITE_SRC : PLAYER_IDLE_SPRITE_SRC,
                PLAYER_SPRITE_COLS,
                PLAYER_SPRITE_ROWS,
                playerFrame,
                directionToSpriteRow(game.direction),
                16,
                playerRunning ? 17 : 16,
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { z } from "zod";
import type { Position } from "./types";

const gameConfigSchema = z
  .object({
    boardSize: z.number().int().min(4).max(12),
    pitCount: z.number().int().min(1),
    maxWorldGenerationAttempts: z.number().int().min(1),
  })
  .refine((cfg) => cfg.pitCount < cfg.boardSize * cfg.boardSize - 2, {
    message: "pitCount is too high for the configured board size",
  });

const gameConfig = gameConfigSchema.parse({
  boardSize: 8,
  pitCount: 8,
  maxWorldGenerationAttempts: 5000,
});

export const BOARD_SIZE = gameConfig.boardSize;
export const PIT_COUNT = gameConfig.pitCount;
export const MAX_WORLD_GENERATION_ATTEMPTS = gameConfig.maxWorldGenerationAttempts;
export const START: Position = { x: 0, y: 0 };

export const PLAYER_IDLE_SPRITE_SRC = "/Blue%20Knight%20idle%20Sprite-sheet%2016x16.png";
export const PLAYER_RUN_SPRITE_SRC = "/Blue%20Knight%20run%20Sprite-sheet%2016x17.png";
export const WUMPUS_SPRITE_SRC = "/1Zombie-Idle.png";
export const GOLD_SRC = "/Coin%20Gif.gif";
export const PIT_SRC = "/pit.png";
export const GATE_SRC = "/gate.png";

export const FLOOR_TILE_SOURCES = [
  "/tile1.png",
  "/tile2.png",
  "/tile4.png",
  "/tile5.png",
  "/tile6.png",
];

export const WALL_TOP_SOURCES = ["/wall1.png", "/wall2.png", "/wall3.png"];
export const WALL_BOTTOM_SRC = "/wall-top.png";
export const WALL_LEFT_SRC = "/wall-left.png";
export const WALL_RIGHT_SRC = "/wall-right.png";
export const WALL_BOTTOM_LEFT_SRC = "/wall-bottomleft.png";
export const WALL_BOTTOM_RIGHT_SRC = "/wall-bottomright.png";
export const WALL_TOP_LEFT_SRC = "/wall-topleft.png";
export const WALL_TOP_RIGHT_SRC = "/wall-topright.png";

export const PLAYER_SPRITE_COLS = 8;
export const PLAYER_SPRITE_ROWS = 4;
export const ZOMBIE_SPRITE_COLS = 8;
export const ZOMBIE_SPRITE_ROWS = 4;
export const PLAYER_RUN_PULSE_TICKS = 4;

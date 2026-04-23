import {
  WALL_BOTTOM_SRC,
  WALL_BOTTOM_LEFT_SRC,
  WALL_BOTTOM_RIGHT_SRC,
  FLOOR_TILE_SOURCES,
  GATE_SRC,
  WALL_LEFT_SRC,
  WALL_RIGHT_SRC,
  WALL_TOP_SOURCES,
  WALL_TOP_LEFT_SRC,
  WALL_TOP_RIGHT_SRC,
} from "@/features/wumpus/constants";
import type { Direction } from "@/features/wumpus/types";

export function tileImageStyle(source: string) {
  return {
    backgroundImage: `url("${source}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    imageRendering: "pixelated" as const,
  };
}

function hash2d(x: number, y: number): number {
  const n = x * 374761393 + y * 668265263;
  return Math.abs((n ^ (n >>> 13)) * 1274126177);
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function floorTileSource(x: number, y: number, tileSeed: string): string {
  const seedHash = hashString(tileSeed);
  const idx = (hash2d(x + seedHash, y - seedHash) + seedHash) % FLOOR_TILE_SOURCES.length;
  return FLOOR_TILE_SOURCES[idx];
}

function wallTopSource(x: number): string {
  const idx = Math.abs(x) % WALL_TOP_SOURCES.length;
  return WALL_TOP_SOURCES[idx];
}

export function paddingWallSource(px: number, py: number, playableSize: number): string {
  const total = playableSize + 2;
  const max = total - 1;

  if (px === 1 && py === 0) {
    return GATE_SRC;
  }
  if (px === 0 && py === 0) {
    return WALL_TOP_LEFT_SRC;
  }
  if (px === max && py === 0) {
    return WALL_TOP_RIGHT_SRC;
  }
  if (py === 0) {
    if (px === 1) {
      return GATE_SRC;
    }
    return wallTopSource(px);
  }
  if (px === 0 && py === max) {
    return WALL_BOTTOM_LEFT_SRC;
  }
  if (px === max && py === max) {
    return WALL_BOTTOM_RIGHT_SRC;
  }
  if (py === max) {
    return WALL_BOTTOM_SRC;
  }
  if (px === 0) {
    return WALL_LEFT_SRC;
  }
  if (px === max) {
    return WALL_RIGHT_SRC;
  }

  return wallTopSource(px + py);
}

export function spriteFrameStyle(
  source: string,
  sheetCols: number,
  sheetRows: number,
  frameCol: number,
  frameRow: number,
  frameWidth = 16,
  frameHeight = 16,
  scale = 1.65,
) {
  return {
    width: `${frameWidth * scale}px`,
    height: `${frameHeight * scale}px`,
    backgroundImage: `url("${source}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${sheetCols * frameWidth * scale}px ${sheetRows * frameHeight * scale}px`,
    backgroundPosition: `-${frameCol * frameWidth * scale}px -${frameRow * frameHeight * scale}px`,
    imageRendering: "pixelated" as const,
  };
}

export function directionToSpriteRow(direction: Direction): number {
  if (direction === "S") return 0;
  if (direction === "E") return 1;
  if (direction === "N") return 2;
  return 3;
}

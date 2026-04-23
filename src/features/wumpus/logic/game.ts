import { START } from "@/features/wumpus/constants";
import type { Direction, GameState, Position } from "@/features/wumpus/types";

export function initialGameState(): GameState {
  return {
    agent: { ...START },
    direction: "E",
    visited: new Set([`${START.x},${START.y}`]),
    startedAtMs: null,
    finishedAtMs: null,
    timeAdjustmentMs: 0,
    hasGold: false,
    arrows: 1,
    alive: true,
    escaped: false,
    wumpusAlive: true,
    bump: false,
    scream: false,
    score: 0,
    message: "Explore carefully. Find the gold and climb out from (0,0).",
    popupShown: false,
  };
}

export function turnLeft(direction: Direction): Direction {
  const leftMap: Record<Direction, Direction> = {
    N: "W",
    W: "S",
    S: "E",
    E: "N",
  };
  return leftMap[direction];
}

export function turnRight(direction: Direction): Direction {
  const rightMap: Record<Direction, Direction> = {
    N: "E",
    E: "S",
    S: "W",
    W: "N",
  };
  return rightMap[direction];
}

export function stepForward(pos: Position, direction: Direction): Position {
  if (direction === "N") return { x: pos.x, y: pos.y - 1 };
  if (direction === "S") return { x: pos.x, y: pos.y + 1 };
  if (direction === "E") return { x: pos.x + 1, y: pos.y };
  return { x: pos.x - 1, y: pos.y };
}

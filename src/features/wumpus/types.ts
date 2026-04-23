export type Direction = "N" | "E" | "S" | "W";

export type Position = {
  x: number;
  y: number;
};

export type World = {
  size: number;
  pits: Set<string>;
  wumpus: Position;
  gold: Position;
};

export type GameState = {
  agent: Position;
  direction: Direction;
  visited: Set<string>;
  startedAtMs: number | null;
  finishedAtMs: number | null;
  timeAdjustmentMs: number;
  hasGold: boolean;
  arrows: number;
  alive: boolean;
  escaped: boolean;
  wumpusAlive: boolean;
  bump: boolean;
  scream: boolean;
  score: number;
  message: string;
  popupShown: boolean;
};

export type TurnDirection = "L" | "R";

export type LeaderboardEntry = {
  id: string;
  playerName: string;
  elapsedMs: number;
  wumpusKilled: boolean;
  treasureCollected: boolean;
  timestamp: number;
  formattedTime: string;
};

export type SubmitRunPayload = {
  playerName: string;
  elapsedMs: number;
  wumpusKilled: boolean;
  treasureCollected: boolean;
};

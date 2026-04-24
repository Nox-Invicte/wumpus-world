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

export type SupabaseLeaderboardRow = {
  id: number;
  player_name: string;
  elapsed_ms: number;
  wumpus_killed: boolean;
  treasure_collected: boolean;
  timestamp: string;
};

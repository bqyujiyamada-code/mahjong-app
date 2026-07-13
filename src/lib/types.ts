export type ScoreItem = {
  userId: string;
  gameId: string;
  point: number;
  matchDate: string;
  season: string;
  playerIndex?: number;
  importedAt?: string;
  createdAt?: string;
};

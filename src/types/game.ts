export enum GamePhaseEnum {
  PRE_GAME = "PRE_GAME",
  IN_GAME = "IN_GAME",
  POST_GAME = "POST_GAME",
}

export type GamePhase = GamePhaseEnum.PRE_GAME | GamePhaseEnum.IN_GAME | GamePhaseEnum.POST_GAME;

export type Rank = number;
export type Similarity = number;

export interface PlayerState {
  name: string;
  rank: Rank;
  bestSimilarity: Similarity;
}

export interface GameState {
  startAt: Date | null;
  endAt: Date | null;
  players: PlayerState[];
}

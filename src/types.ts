export type Rank = number | '1000위 이상' | '정답';

export interface GuessEntry {
  /** 유사도 (0-100 범위) */
  similarity: number;
  word: string;
  rank: Rank;
  guessNumber: number;
}

export interface GameStats {
  firstPlay: number;
  lastEnd: number;
  lastPlay: number;
  winStreak: number;
  playStreak: number;
  totalGuesses: number;
  wins: number;
  abandons: number;
  totalPlays: number;
}

export interface Settings {
  darkMode: boolean;
}

export interface User {
  id: string;
  username: string;
}

export interface GuessApiResponse {
  guess: string;
  sim: number;
  rank: Rank;
  error?: string;
}

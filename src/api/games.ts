import { gamesApi } from "./client";
import type { AuthState, GameState } from "../types/game";


function toDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}


export async function fetchGameState(): Promise<GameState> {
  const data = await gamesApi.gamePollingApiV1GamesPollingGet();

  return {
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    players: [...data.users]
      .map((u) => ({
        name: u.name,
        rank: u.rank,
        bestSimilarity: u.bestSimilarity,
      }))
      .sort((a, b) => a.rank - b.rank),
  };
}


export async function joinGame(name: string): Promise<AuthState> {
  const response = await gamesApi.joinGameApiV1GamesJoinPost({ nickname: name });
  return {
    username: response.nickname,
    sessionId: response.sessionId,
  };
}

import { authApi, gamesApi } from "./client";
import type { AuthState, GameState, GuessResult } from "../types/game";


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

export async function validateSession(sessionId: string): Promise<boolean> {
  const response = await authApi.validateTokenAuthValidateGet(sessionId);

  if (typeof response === "boolean") {
    return response;
  }

  throw new Error("Unexpected session validation response");
}

export async function submitGuess(
  sessionId: string,
  username: string,
  word: string,
): Promise<GuessResult> {
  const response = await gamesApi.guessWordApiV1GamesGuessPost(sessionId, {
    username,
    word,
  });

  return {
    isAnswer: response.isAnswer,
    label: response.label,
    rank: response.rank,
    similarity: response.similarity,
  };
}

export async function fetchGuessHistory(
  sessionId: string,
  username: string,
): Promise<GuessResult[]> {
  const response = await gamesApi.getGuessHistoryApiV1GamesGuessesGet(
    username,
    sessionId,
  );

  return response.map((item) => ({
    isAnswer: item.isAnswer,
    label: item.label,
    rank: item.rank,
    similarity: item.similarity,
  }));
}

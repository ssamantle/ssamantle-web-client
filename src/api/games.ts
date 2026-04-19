import { authApi, gamesApi } from "./client";
import type { AuthState, GameState, GuessResult } from "../types/game";
import {
  normalizeInput,
  validateGuessWord,
  validateUsername,
} from "../utils/inputValidation";


function toDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function toApiError(error: unknown, fallbackMessage: string): Promise<Error> {
  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  if (error instanceof Response) {
    try {
      const data = (await error.json()) as { detail?: unknown };
      if (typeof data.detail === "string" && data.detail.trim()) {
        return new Error(data.detail);
      }
    } catch {
      return new Error(fallbackMessage);
    }
  }

  return new Error(fallbackMessage);
}


export async function fetchGameState(): Promise<GameState> {
  const data = await gamesApi.gamePollingApiV1GamesPollingDbGet();

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
  const usernameValidation = validateUsername(name);
  if (!usernameValidation.isValid) {
    throw new Error(usernameValidation.error ?? "사용자명을 확인해 주세요.");
  }

  try {
    const response = await gamesApi.joinGameApiV1GamesJoinPost({
      nickname: usernameValidation.value,
    });
    return {
      username: response.nickname,
      sessionId: response.sessionId,
    };
  } catch (error) {
    throw await toApiError(
      error,
      "게임 참가에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
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
  const guessValidation = validateGuessWord(word);
  if (!guessValidation.isValid) {
    throw new Error(guessValidation.error ?? "추측할 단어를 확인해 주세요.");
  }

  const response = await gamesApi.guessWordApiV1GamesGuessPost(sessionId, {
    username: normalizeInput(username, { collapseWhitespace: true }),
    word: guessValidation.value,
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

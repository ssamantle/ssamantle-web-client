import { gamesApi } from "../api/client";
import {
  fetchGameState,
  fetchGuessHistory,
  joinGame,
  submitGuess,
} from "./gameService";

jest.mock("../api/client", () => ({
  gamesApi: {
    gamePollingApiV1GamesPollingDbGet: jest.fn(),
    getGuessHistoryApiV1GamesGuessesGet: jest.fn(),
    joinGameApiV1GamesJoinPost: jest.fn(),
    guessWordApiV1GamesGuessPost: jest.fn(),
  },
}));

const mockedGamesApi = gamesApi as jest.Mocked<typeof gamesApi>;

beforeEach(() => {
  mockedGamesApi.gamePollingApiV1GamesPollingDbGet.mockReset();
  mockedGamesApi.getGuessHistoryApiV1GamesGuessesGet.mockReset();
  mockedGamesApi.joinGameApiV1GamesJoinPost.mockReset();
  mockedGamesApi.guessWordApiV1GamesGuessPost.mockReset();
});

test("fetchGameState maps best and latest submissions from polling data", async () => {
  mockedGamesApi.gamePollingApiV1GamesPollingDbGet.mockResolvedValue({
    startAt: "2026-04-20T09:00:00+09:00",
    endAt: "2026-04-20T10:00:00+09:00",
    users: [
      {
        name: "runner",
        rank: 1,
        bestSimilarity: 98.1,
        bestSubmission: {
          label: "best-word",
          similarity: 98.1,
          wordRank: 4,
          submittedAt: "2026-04-20T09:30:00+09:00",
        },
        latestSubmission: {
          label: "latest-word",
          similarity: 91.4,
          wordRank: 52,
          submittedAt: "2026-04-20T09:42:00+09:00",
        },
      },
    ],
  });

  await expect(fetchGameState()).resolves.toEqual({
    startAt: new Date("2026-04-20T09:00:00+09:00"),
    endAt: new Date("2026-04-20T10:00:00+09:00"),
    players: [
      {
        name: "runner",
        rank: 1,
        bestSimilarity: 98.1,
        bestSubmission: {
          label: "best-word",
          similarity: 98.1,
          wordRank: 4,
          submittedAt: new Date("2026-04-20T09:30:00+09:00"),
        },
        latestSubmission: {
          label: "latest-word",
          similarity: 91.4,
          wordRank: 52,
          submittedAt: new Date("2026-04-20T09:42:00+09:00"),
        },
      },
    ],
  });
});

test("joinGame validates username before API request", async () => {
  await expect(joinGame("a")).rejects.toThrow("사용자명은 2자 이상이어야 합니다.");
  expect(mockedGamesApi.joinGameApiV1GamesJoinPost).not.toHaveBeenCalled();
});

test("joinGame maps server detail to error message", async () => {
  mockedGamesApi.joinGameApiV1GamesJoinPost.mockRejectedValue(
    new Response(JSON.stringify({ detail: "이미 종료된 게임입니다." }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }),
  );

  await expect(joinGame("tester")).rejects.toThrow("이미 종료된 게임입니다.");
});

test("submitGuess validates word before API request", async () => {
  await expect(submitGuess("session-1", "tester", "bad guess")).rejects.toThrow(
    "단어에는 공백을 포함할 수 없습니다.",
  );

  expect(mockedGamesApi.guessWordApiV1GamesGuessPost).not.toHaveBeenCalled();
});

test("submitGuess maps word rank from API response", async () => {
  mockedGamesApi.guessWordApiV1GamesGuessPost.mockResolvedValue({
    isAnswer: false,
    label: "banana",
    rank: 11,
    similarity: 32.1,
    wordRank: 154,
  });

  await expect(submitGuess("session-1", "tester", "banana")).resolves.toEqual({
    isAnswer: false,
    label: "banana",
    rank: 11,
    similarity: 32.1,
    wordRank: 154,
  });
});

test("fetchGuessHistory maps word rank from API response", async () => {
  mockedGamesApi.getGuessHistoryApiV1GamesGuessesGet.mockResolvedValue([
    {
      isAnswer: false,
      label: "alpha",
      rank: 7,
      similarity: 44.4,
      wordRank: 73,
    },
  ]);

  await expect(fetchGuessHistory("session-1", "tester")).resolves.toEqual([
    {
      isAnswer: false,
      label: "alpha",
      rank: 7,
      similarity: 44.4,
      wordRank: 73,
    },
  ]);
});

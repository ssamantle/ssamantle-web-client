import { gamesApi } from "../api/client";
import { joinGame, submitGuess } from "./gameService";

jest.mock("../api/client", () => ({
  gamesApi: {
    joinGameApiV1GamesJoinPost: jest.fn(),
    guessWordApiV1GamesGuessPost: jest.fn(),
  },
}));

const mockedGamesApi = gamesApi as jest.Mocked<typeof gamesApi>;

beforeEach(() => {
  mockedGamesApi.joinGameApiV1GamesJoinPost.mockReset();
  mockedGamesApi.guessWordApiV1GamesGuessPost.mockReset();
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

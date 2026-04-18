import { authApi, gamesApi } from "./client";
import { joinGame, validateSession } from "./games";

jest.mock("./client", () => ({
  gamesApi: {
    joinGameApiV1GamesJoinPost: jest.fn(),
  },
  authApi: {
    validateTokenAuthValidateGet: jest.fn(),
  },
}));

const mockedGamesApi = gamesApi as jest.Mocked<typeof gamesApi>;
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

beforeEach(() => {
  mockedGamesApi.joinGameApiV1GamesJoinPost.mockReset();
  mockedAuthApi.validateTokenAuthValidateGet.mockReset();
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

test("validateSession returns boolean response body", async () => {
  mockedAuthApi.validateTokenAuthValidateGet.mockResolvedValue(false);

  await expect(validateSession("expired-session")).resolves.toBe(false);
});

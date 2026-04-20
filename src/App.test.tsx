import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { joinGame, validateSession } from "./api/games";

jest.mock("./api/games", () => ({
  joinGame: jest.fn(),
  validateSession: jest.fn(),
}));

jest.mock("./pages/LoginPage", () => ({
  LoginPage: ({ onLogin }: { onLogin: (username: string) => Promise<void> }) => (
    <div>
      <h1>게임에 입장하기 전에 사용자명을 입력해 주세요.</h1>
      <button type="button" onClick={() => void onLogin("tester")}>
        로그인
      </button>
    </div>
  ),
}));

jest.mock("./pages/GamePage", () => ({
  __esModule: true,
  default: ({
    username,
    sessionId,
    onLogout,
  }: {
    username: string;
    sessionId: string;
    onLogout: () => void;
  }) => (
    <div>
      <p>{username}</p>
      <p>{sessionId}</p>
      <button type="button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  ),
}));

const mockedJoinGame = joinGame as jest.MockedFunction<typeof joinGame>;
const mockedValidateSession = validateSession as jest.MockedFunction<
  typeof validateSession
>;

beforeEach(() => {
  window.localStorage.clear();
  mockedJoinGame.mockReset();
  mockedValidateSession.mockReset();
  mockedValidateSession.mockResolvedValue(true);
});

test("renders login page heading", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
    }),
  ).toBeInTheDocument();
});

test("logs out to the login page when auth exists", async () => {
  window.localStorage.setItem(
    "ssamantle.auth",
    JSON.stringify({
      username: "tester",
      sessionId: "session-1",
    }),
  );

  render(<App />);

  expect(mockedValidateSession).toHaveBeenCalledWith("session-1");
  await userEvent.click(
    await screen.findByRole("button", { name: "로그아웃" }),
  );

  expect(
    screen.getByRole("heading", {
      name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
    }),
  ).toBeInTheDocument();
  expect(window.localStorage.getItem("ssamantle.auth")).toBeNull();
});

test("clears stored auth and returns to login when session is invalid", async () => {
  mockedValidateSession.mockResolvedValue(false);

  window.localStorage.setItem(
    "ssamantle.auth",
    JSON.stringify({
      username: "tester",
      sessionId: "expired-session",
    }),
  );

  render(<App />);

  await waitFor(() => {
    expect(
      screen.getByRole("heading", {
        name: /게임에 입장하기 전에 사용자명을 입력해 주세요\./i,
      }),
    ).toBeInTheDocument();
  });

  expect(mockedValidateSession).toHaveBeenCalledWith("expired-session");
  expect(window.localStorage.getItem("ssamantle.auth")).toBeNull();
});

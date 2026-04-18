import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GamePage from "./GamePage";
import { GamePhaseEnum } from "../types/game";
import { fetchGuessHistory } from "../api/games";
import { useGamePolling } from "../hooks/useGamePolling";
import { useGameClock } from "../hooks/useGameClock";
import { useGamePhase } from "../hooks/useGamePhase";

jest.mock("../api/games", () => ({
  fetchGuessHistory: jest.fn(),
}));

jest.mock("../hooks/useGamePolling", () => ({
  useGamePolling: jest.fn(),
}));

jest.mock("../hooks/useGameClock", () => ({
  useGameClock: jest.fn(),
}));

jest.mock("../hooks/useGamePhase", () => ({
  useGamePhase: jest.fn(),
}));

const mockedFetchGuessHistory = fetchGuessHistory as jest.MockedFunction<
  typeof fetchGuessHistory
>;
const mockedUseGamePolling = useGamePolling as jest.MockedFunction<
  typeof useGamePolling
>;
const mockedUseGameClock = useGameClock as jest.MockedFunction<
  typeof useGameClock
>;
const mockedUseGamePhase = useGamePhase as jest.MockedFunction<
  typeof useGamePhase
>;

beforeEach(() => {
  mockedFetchGuessHistory.mockImplementation(
    () => new Promise(() => undefined),
  );
  mockedUseGameClock.mockReturnValue(new Date("2026-04-17T12:00:00+09:00"));
  mockedUseGamePhase.mockReturnValue({
    phase: GamePhaseEnum.PRE_GAME,
    remainingMs: 0,
    label: "게임 시작까지",
  });
  mockedUseGamePolling.mockReturnValue({
    gameState: {
      startAt: null,
      endAt: null,
      players: [],
    },
    isLoading: false,
    error: null,
    lastSyncedAt: new Date("2026-04-17T12:34:56+09:00"),
    refetch: jest.fn().mockResolvedValue(undefined),
  });
});

test("renders last synced time next to logout", () => {
  render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={jest.fn()}
    />,
  );

  expect(screen.getByText("마지막 동기화")).toBeInTheDocument();
  expect(screen.getByText("오후 12:34:56")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
  expect(
    screen.getByText("실시간 게임 상태를 참가자 현황과 함께 확인할 수 있습니다."),
  ).toBeInTheDocument();
});

test("shows waiting text before first successful sync", () => {
  mockedUseGamePolling.mockReturnValue({
    gameState: {
      startAt: null,
      endAt: null,
      players: [],
    },
    isLoading: false,
    error: null,
    lastSyncedAt: null,
    refetch: jest.fn().mockResolvedValue(undefined),
  });

  render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={jest.fn()}
    />,
  );

  expect(screen.getByText("동기화 대기 중")).toBeInTheDocument();
});

test("calls logout when the logout button is clicked", async () => {
  const onLogout = jest.fn();

  render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={onLogout}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: "로그아웃" }));

  expect(onLogout).toHaveBeenCalledTimes(1);
});

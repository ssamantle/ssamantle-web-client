import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GamePage from "./GamePage";
import { GamePhaseEnum } from "../types/game";
import { fetchGuessHistory } from "../services/gameService";
import { useGamePolling } from "../hooks/useGamePolling";
import { useGameClock } from "../hooks/useGameClock";
import { useGamePhase } from "../hooks/useGamePhase";
import { getGuessResultKey } from "../utils/guessHistory";

jest.mock("../services/gameService", () => ({
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

jest.mock("../components/game/WordGuessComposer", () => ({
  WordGuessComposer: ({
    onSubmitted,
  }: {
    onSubmitted: (result: {
      isAnswer: boolean;
      label: string;
      rank: number;
      similarity: number;
    }) => Promise<void>;
  }) => (
    <button
      type="button"
      onClick={() =>
        void onSubmitted({
          isAnswer: false,
          label: "latest-word",
          rank: 77,
          similarity: 14.55,
        })
      }
    >
      submit-latest-word
    </button>
  ),
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

test("renders top info bar with synced time, username, and logout", () => {
  render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={jest.fn()}
    />,
  );

  expect(screen.getByText("마지막 동기화")).toBeInTheDocument();
  expect(screen.getByText("오후 12:34:56")).toBeInTheDocument();
  const logoutButton = screen.getByRole("button", { name: "로그아웃" });
  const topInfoBar = logoutButton.closest("div");
  expect(topInfoBar).not.toBeNull();
  expect(within(topInfoBar as HTMLElement).getByText("tester")).toBeInTheDocument();
  expect(logoutButton).toBeInTheDocument();
  expect(screen.getByText("싸맨틀 :: 단어 추측 게임")).toBeInTheDocument();
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

test("shows the latest submitted word at the top of the guess history", async () => {
  mockedFetchGuessHistory.mockResolvedValue([
    {
      isAnswer: false,
      label: "top-word",
      rank: 4,
      similarity: 95.12,
    },
    {
      isAnswer: false,
      label: "mid-word",
      rank: 18,
      similarity: 84.22,
    },
  ]);

  render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={jest.fn()}
    />,
  );

  await screen.findByText("top-word");
  await userEvent.click(screen.getByRole("button", { name: "submit-latest-word" }));

  const rows = screen.getAllByRole("row").slice(1);
  expect(rows).toHaveLength(3);
  expect(within(rows[0]).getByText("latest-word")).toBeInTheDocument();
  expect(rows[0]).toHaveAttribute("data-highlighted", "true");
  expect(rows[0]).toHaveClass("bg-[#f4eadb]");
  expect(getGuessResultKey({
    isAnswer: false,
    label: "latest-word",
    rank: 77,
    similarity: 14.55,
  })).toBe("latest-word::77::14.550000::guess");
});

test("renders both best and latest submission bubbles on the race map", () => {
  mockedUseGamePolling.mockReturnValue({
    gameState: {
      startAt: null,
      endAt: null,
      players: [
        {
          name: "alpha",
          rank: 1,
          bestSimilarity: 97.3,
          bestSubmission: {
            label: "best-alpha",
            similarity: 97.3,
            submittedAt: new Date("2026-04-20T09:31:00+09:00"),
          },
          latestSubmission: {
            label: "latest-alpha",
            similarity: 88.4,
            submittedAt: new Date("2026-04-20T09:35:00+09:00"),
          },
        },
      ],
    },
    isLoading: false,
    error: null,
    lastSyncedAt: new Date("2026-04-17T12:34:56+09:00"),
    refetch: jest.fn().mockResolvedValue(undefined),
  });

  const { container } = render(
    <GamePage
      username="tester"
      sessionId="session-1"
      onLogout={jest.fn()}
    />,
  );

  const bestBubble = container.querySelector(
    '[data-bubble-type="best"][data-player-name="alpha"]',
  );
  const latestBubble = container.querySelector(
    '[data-bubble-type="latest"][data-player-name="alpha"]',
  );

  expect(bestBubble).toHaveTextContent("best-alpha");
  expect(bestBubble).toHaveClass("bg-white");
  expect(latestBubble).toHaveTextContent("latest-alpha");
  expect(latestBubble).toHaveClass("bg-white/75");
});

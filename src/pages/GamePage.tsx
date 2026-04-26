import { useEffect, useMemo, useState } from "react";
import { fetchGuessHistory } from "../services/gameService";
import { GameLayout } from "../components/game/GameLayout";
import { GameCountdownCard } from "../components/game/GameCountdownCard";
import { GuessHistoryTable } from "../components/game/GuessHistoryTable";
import { WordGuessComposer } from "../components/game/WordGuessComposer";
import { PlayerList } from "../components/game/PlayerList";
import { GameTopInfoBar } from "../components/game/GameTopInfoBar";
import { RaceMapLeaderboard } from "../components/game/RaceMapLeaderboard";
import { CelebrationConfetti } from "../components/game/CelebrationConfetti";
import { useGameClock } from "../hooks/useGameClock";
import { useGamePhase } from "../hooks/useGamePhase";
import { useGamePolling } from "../hooks/useGamePolling";
import type {
  GuessResult,
  PlayerState,
  RaceMapSimilarityMarker,
} from "../types/game";
import { normalizeInput } from "../utils/inputValidation";
import { toRaceRunners } from "../utils/raceMap";

interface GamePageProps {
  username: string;
  sessionId: string;
  onLogout: () => void;
}

const RACE_MAP_TOGGLE_STORAGE_KEY = "ssamantle.raceMap.visible";

function readRaceMapVisiblePreference(): boolean {
  const raw = window.localStorage.getItem(RACE_MAP_TOGGLE_STORAGE_KEY);
  if (raw === "hidden") return false;
  if (raw === "visible") return true;
  return true;
}

function sortGuessHistory(items: GuessResult[]): GuessResult[] {
  const normalizedLabels = new Set<string>();

  return [...items]
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item) => {
      const normalizedLabel = normalizeInput(item.label);
      if (normalizedLabels.has(normalizedLabel)) {
        return false;
      }

      normalizedLabels.add(normalizedLabel);
      return true;
    });
}

function toRaceMapMarkers(
  players: PlayerState[],
): RaceMapSimilarityMarker[] {
  return players.flatMap((player) => {
    const markers: RaceMapSimilarityMarker[] = [];

    if (player.bestSubmission) {
      markers.push({
        id: `${player.name}::best`,
        playerName: player.name,
        similarity: player.bestSubmission.similarity,
        wordRank: player.bestSubmission.wordRank,
        type: "best",
      });
    }

    if (player.latestSubmission) {
      markers.push({
        id: `${player.name}::latest`,
        playerName: player.name,
        similarity: player.latestSubmission.similarity,
        wordRank: player.latestSubmission.wordRank,
        type: "latest",
      });
    }

    return markers;
  });
}

export default function GamePage({
  username,
  sessionId,
  onLogout,
}: GamePageProps) {
  const [guessHistory, setGuessHistory] = useState<GuessResult[]>([]);
  const [celebrationBurstId, setCelebrationBurstId] = useState(0);
  const [latestSubmittedGuessLabel, setLatestSubmittedGuessLabel] = useState<string | null>(null);
  const [isGuessHistoryLoading, setIsGuessHistoryLoading] = useState(true);
  const [guessHistoryError, setGuessHistoryError] = useState<Error | null>(null);
  const [isRaceMapVisible, setIsRaceMapVisible] = useState(
    () => readRaceMapVisiblePreference(),
  );
  const { gameState, isLoading, error, lastSyncedAt, refetch } = useGamePolling(3000);
  const now = useGameClock();

  const raceRunners = useMemo(
    () => toRaceRunners(gameState?.players ?? []),
    [gameState?.players],
  );
  const raceMapMarkers = useMemo(
    () => toRaceMapMarkers(gameState?.players ?? []),
    [gameState?.players],
  );

  const { phase, remainingMs, label } = useGamePhase({
    now,
    startAt: gameState?.startAt ?? null,
    endAt: gameState?.endAt ?? null,
  });

  useEffect(() => {
    let alive = true;

    const loadGuessHistory = async () => {
      try {
        const nextHistory = await fetchGuessHistory(sessionId, username);
        if (!alive) return;
        setGuessHistory(sortGuessHistory(nextHistory));
        setGuessHistoryError(null);
      } catch (loadError) {
        if (!alive) return;
        setGuessHistoryError(
          loadError instanceof Error
            ? loadError
            : new Error("Failed to fetch guess history"),
        );
      } finally {
        if (alive) setIsGuessHistoryLoading(false);
      }
    };

    setIsGuessHistoryLoading(true);
    void loadGuessHistory();

    return () => {
      alive = false;
    };
  }, [sessionId, username]);

  useEffect(() => {
    window.localStorage.setItem(
      RACE_MAP_TOGGLE_STORAGE_KEY,
      isRaceMapVisible ? "visible" : "hidden",
    );
  }, [isRaceMapVisible]);

  const handleGuessSubmitted = async (result: GuessResult) => {
    setGuessHistory((current) => sortGuessHistory([...current, result]));
    setLatestSubmittedGuessLabel(normalizeInput(result.label));
    setGuessHistoryError(null);

    if (result.isAnswer) {
      setCelebrationBurstId((current) => current + 1);
    }

    await refetch();

    try {
      const nextHistory = await fetchGuessHistory(sessionId, username);
      setGuessHistory(sortGuessHistory(nextHistory));
      setGuessHistoryError(null);
    } catch (loadError) {
      setGuessHistoryError(
        loadError instanceof Error
          ? loadError
          : new Error("Failed to fetch guess history"),
      );
    }
  };

  return (
    <>
      <CelebrationConfetti burstId={celebrationBurstId} />

      <GameLayout>
        <GameTopInfoBar
          username={username}
          lastSyncedAt={lastSyncedAt}
          onLogout={onLogout}
        />

        <GameCountdownCard
          phase={phase}
          label={label}
          remainingMs={remainingMs}
          isLoading={isLoading}
        />

        <WordGuessComposer
          username={username}
          sessionId={sessionId}
          phase={phase}
          onSubmitted={handleGuessSubmitted}
        />

        <GuessHistoryTable
          items={guessHistory}
          latestSubmittedGuessLabel={latestSubmittedGuessLabel}
          isLoading={isGuessHistoryLoading}
          error={guessHistoryError}
        />

        <PlayerList
          players={gameState?.players ?? []}
          isLoading={isLoading}
          error={error}
        />
      </GameLayout>

      <RaceMapLeaderboard
        runners={raceRunners}
        currentUsername={username}
        isVisible={isRaceMapVisible}
        onToggle={() => setIsRaceMapVisible((current) => !current)}
        markers={raceMapMarkers}
      />
    </>
  );
}

import { GameLayout } from "../components/game/GameLayout";
import { GameHeader } from "../components/game/GameHeader";
import { GameCountdownCard } from "../components/game/GameCountdownCard";
import { PlayerList } from "../components/game/PlayerList";
import { useGameClock } from "../hooks/useGameClock";
import { useGamePhase } from "../hooks/useGamePhase";
import { useGamePolling } from "../hooks/useGamePolling";

interface GamePageProps {
  username: string;
}

export default function GamePage({ username }: GamePageProps) {
  const { gameState, isLoading, error, lastSyncedAt } = useGamePolling(3000);
  const now = useGameClock();

  const { phase, remainingMs, label } = useGamePhase({
    now,
    startAt: gameState?.startAt ?? null,
    endAt: gameState?.endAt ?? null,
  });

  return (
    <GameLayout>
      <GameHeader
        phase={phase}
        playerCount={gameState?.players.length ?? 0}
        lastSyncedAt={lastSyncedAt}
        username={username}
      />

      <GameCountdownCard
        phase={phase}
        label={label}
        remainingMs={remainingMs}
        isLoading={isLoading}
      />

      <PlayerList
        players={gameState?.players ?? []}
        isLoading={isLoading}
        error={error}
      />
    </GameLayout>
  );
}

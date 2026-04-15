import { GameLayout } from "../components/game/GameLayout";
import { GameHeader } from "../components/game/GameHeader";
import { GameCountdownCard } from "../components/game/GameCountdownCard";
import { PlayerList } from "../components/game/PlayerList";
import { useGameClock } from "../hooks/useGameClock";
import { useGamePhase } from "../hooks/useGamePhase";
import { useGamePolling } from "../hooks/useGamePolling";

interface GamePageProps {
  username: string;
  onLogout: () => void;
}

export default function GamePage({ username, onLogout }: GamePageProps) {
  const { gameState, isLoading, error, lastSyncedAt } = useGamePolling(3000);
  const now = useGameClock();

  const { phase, remainingMs, label } = useGamePhase({
    now,
    startAt: gameState?.startAt ?? null,
    endAt: gameState?.endAt ?? null,
  });

  return (
    <GameLayout>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-medium text-[#6c8491] underline-offset-2 transition hover:text-[#202938] hover:underline focus:outline-none focus-visible:underline"
        >
          로그아웃
        </button>
      </div>

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

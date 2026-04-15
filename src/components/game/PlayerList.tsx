import type { PlayerState } from "../../types/game";

interface PlayerListProps {
  players: PlayerState[];
  isLoading?: boolean;
  error?: Error | null;
}

function formatSimilarity(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-yellow-100 text-yellow-800";
  if (rank === 2) return "bg-slate-200 text-slate-800";
  if (rank === 3) return "bg-orange-100 text-orange-800";
  return "bg-slate-100 text-slate-700";
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      아직 참가 중인 플레이어가 없습니다.
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
      참가자 정보를 불러오는 중 문제가 발생했습니다.
      <div className="mt-1 text-xs text-red-600">{message}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-4 w-16 rounded bg-slate-200" />
          </div>
          <div className="mt-3 h-3 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function PlayerRow({ player }: { player: PlayerState }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={[
            "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold",
            rankBadgeClass(player.rank),
          ].join(" ")}
        >
          {player.rank}
        </span>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {player.name}
          </div>
          <div className="text-xs text-slate-500">최고 유사도 제출 기록</div>
        </div>
      </div>

      <div className="ml-4 text-right">
        <div className="text-sm font-bold text-slate-900">
          {formatSimilarity(player.bestSimilarity)}
        </div>
        <div className="text-xs text-slate-500">similarity</div>
      </div>
    </li>
  );
}

export function PlayerList({
  players,
  isLoading = false,
  error = null,
}: PlayerListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">참가 플레이어</h2>
          <p className="text-sm text-slate-500">
            현재 게임에 참여 중인 사용자 목록입니다.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          총 {players.length}명
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : players.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {players.map((player) => (
            <PlayerRow key={`${player.name}-${player.rank}`} player={player} />
          ))}
        </ul>
      )}
    </section>
  );
}

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
  if (rank === 1) return "bg-[#fff3cf] text-[#8a5a00]";
  if (rank === 2) return "bg-[#eef3f7] text-[#536273]";
  if (rank === 3) return "bg-[#ffe3d6] text-[#a4551d]";
  return "bg-[#f3f6f9] text-[#60727f]";
}

function medalForRank(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function EmptyState() {
  return (
    <div className="rounded-[3px] border border-dashed border-[#c7d3df] bg-[#f8fbfe] px-4 py-8 text-center text-sm text-[#60727f]">
      아직 참가 중인 플레이어가 없습니다.
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[3px] border border-[#efc4c4] bg-[#fff4f4] px-4 py-8 text-center text-sm text-[#9a4545]">
      참가자 정보를 불러오는 중 문제가 발생했습니다.
      <div className="mt-1 text-xs text-[#c46262]">{message}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="rounded-[3px] border border-[#d7e0ea] bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-[#e8eef4]" />
            <div className="h-4 w-16 bg-[#e8eef4]" />
          </div>
          <div className="mt-3 h-3 w-24 bg-[#e8eef4]" />
        </div>
      ))}
    </div>
  );
}

function PlayerRow({ player }: { player: PlayerState }) {
  const medal = medalForRank(player.rank);

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-[#e8f0f4] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span
        className={[
          "inline-flex min-w-[2.4rem] items-center justify-center text-sm font-medium tabular-nums",
          rankBadgeClass(player.rank),
        ].join(" ")}
      >
        #{player.rank}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-1 text-sm font-medium text-[#202938]">
          {medal ? <span aria-hidden="true">{medal}</span> : null}
          <span className="truncate">{player.name}</span>
        </div>
        <div className="text-xs text-[#6c8491]">최고 유사도 제출 기록</div>
      </div>

      <div className="text-right">
        <div className="text-sm font-semibold text-[#0c6887]">
          {formatSimilarity(player.bestSimilarity)}
        </div>
        <div className="text-xs text-[#6c8491]">similarity</div>
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
    <section className="rounded-[3px] border border-[#b4bfd6] bg-[#edf1f8] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#202938]">
            참가 플레이어
          </h2>
          <p className="text-sm text-[#5b7380]">
            현재 게임에 참여 중인 사용자 목록입니다.
          </p>
        </div>

        <div className="rounded-full border border-[#d7e0ea] bg-white px-3 py-1 text-sm font-medium text-[#60727f]">
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
        <ul>
          {players.map((player) => (
            <PlayerRow key={`${player.name}-${player.rank}`} player={player} />
          ))}
        </ul>
      )}
    </section>
  );
}

import { GamePhaseEnum, type GamePhase } from "../../types/game";
import { phaseToText } from "../../utils/game";

interface GameHeaderProps {
  phase: GamePhase;
  playerCount: number;
  lastSyncedAt: Date | null;
}

function formatSyncedAt(date: Date | null): string {
  if (!date) return "동기화 전";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function phaseBadgeClass(phase: GamePhase): string {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "bg-amber-100 text-amber-800 border-amber-200";
    case GamePhaseEnum.IN_GAME:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case GamePhaseEnum.POST_GAME:
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function GameHeader({
  phase,
  playerCount,
  lastSyncedAt,
}: GameHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              싸맨틀
            </h1>

            <span
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                phaseBadgeClass(phase),
              ].join(" ")}
            >
              {phaseToText(phase)}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            실시간 게임 상태와 참가자 현황을 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">참가자 수</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {playerCount}명
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-500">
              마지막 동기화
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {formatSyncedAt(lastSyncedAt)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

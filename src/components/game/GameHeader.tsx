import { GamePhaseEnum, type GamePhase } from "../../types/game";
import { phaseToText } from "../../utils/game";

interface GameHeaderProps {
  phase: GamePhase;
  playerCount: number;
  lastSyncedAt: Date | null;
  username: string;
}

function formatSyncedAt(date: Date | null): string {
  if (!date) return "동기화 대기 중";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function phaseBadgeClass(phase: GamePhase): string {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "border-[#f1d5a4] bg-[#fff2d8] text-[#8a5a00]";
    case GamePhaseEnum.IN_GAME:
      return "border-[#b9e6c7] bg-[#ebfbf0] text-[#23734b]";
    case GamePhaseEnum.POST_GAME:
      return "border-[#cfd8e3] bg-[#f3f6f9] text-[#536273]";
    default:
      return "border-[#cfd8e3] bg-[#f3f6f9] text-[#536273]";
  }
}

export function GameHeader({
  phase,
  playerCount,
  lastSyncedAt,
  username,
}: GameHeaderProps) {
  return (
    <header className="rounded-[3px] border border-[#d7e0ea] bg-white px-5 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[1.45rem] font-semibold tracking-[-0.02em] text-[#202938]">
              싸맨틀
            </h1>

            <span
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.08em]",
                phaseBadgeClass(phase),
              ].join(" ")}
            >
              {phaseToText(phase)}
            </span>
          </div>

          <p className="text-sm text-[#5b7380]">
            실시간 게임 상태를 참가자 현황과 함께 확인할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:min-w-[420px] md:grid-cols-3">
          <div className="rounded-[3px] border border-[#d7e0ea] bg-[#f8fbfe] px-3 py-2.5">
            <div className="text-xs font-medium text-[#6c8491]">사용자명</div>
            <div className="mt-1 truncate text-lg font-semibold text-[#202938]">
              {username}
            </div>
          </div>

          <div className="rounded-[3px] border border-[#d7e0ea] bg-[#f8fbfe] px-3 py-2.5">
            <div className="text-xs font-medium text-[#6c8491]">참가자 수</div>
            <div className="mt-1 text-lg font-semibold text-[#202938]">
              {playerCount}명
            </div>
          </div>

          <div className="rounded-[3px] border border-[#d7e0ea] bg-[#f8fbfe] px-3 py-2.5">
            <div className="text-xs font-medium text-[#6c8491]">
              마지막 동기화
            </div>
            <div className="mt-1 text-lg font-semibold text-[#202938]">
              {formatSyncedAt(lastSyncedAt)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

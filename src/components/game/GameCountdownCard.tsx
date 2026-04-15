import { GamePhaseEnum, type GamePhase } from "../../types/game";
import { formatRemainingMs } from "../../utils/date";

interface GameCountdownCardProps {
  phase: GamePhase;
  label: string;
  remainingMs: number;
  isLoading?: boolean;
}

function descriptionByPhase(phase: GamePhase): string {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "게임이 곧 시작됩니다. 시작 시각까지 대기해주세요.";
    case GamePhaseEnum.IN_GAME:
      return "게임이 진행 중입니다. 종료 전까지 제출을 완료하세요.";
    case GamePhaseEnum.POST_GAME:
      return "게임이 종료되었습니다.";
    default:
      return "";
  }
}

function accentClassByPhase(phase: GamePhase): string {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "from-amber-50 to-orange-50 border-amber-200";
    case GamePhaseEnum.IN_GAME:
      return "from-emerald-50 to-cyan-50 border-emerald-200";
    case GamePhaseEnum.POST_GAME:
      return "from-slate-50 to-slate-100 border-slate-200";
    default:
      return "from-slate-50 to-slate-100 border-slate-200";
  }
}

export function GameCountdownCard({
  phase,
  label,
  remainingMs,
  isLoading = false,
}: GameCountdownCardProps) {
  const formatted =
    phase === GamePhaseEnum.POST_GAME
      ? "00:00:00"
      : formatRemainingMs(remainingMs);

  return (
    <section
      className={[
        "rounded-2xl border bg-gradient-to-br p-6 shadow-sm",
        accentClassByPhase(phase),
      ].join(" ")}
    >
      <div className="space-y-3">
        <div className="text-sm font-medium text-slate-600">
          {isLoading ? "게임 정보를 불러오는 중..." : label}
        </div>

        <div className="font-mono text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {isLoading ? "--:--:--" : formatted}
        </div>

        <p className="text-sm text-slate-600">{descriptionByPhase(phase)}</p>
      </div>
    </section>
  );
}

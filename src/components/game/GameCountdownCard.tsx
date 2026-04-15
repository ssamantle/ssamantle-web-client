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
      return "게임이 곧 시작됩니다. 시작 시각까지 잠시만 기다려 주세요.";
    case GamePhaseEnum.IN_GAME:
      return "게임이 진행 중입니다. 종료 전까지 제출 결과를 계속 확인할 수 있습니다.";
    case GamePhaseEnum.POST_GAME:
      return "게임이 종료되었습니다.";
    default:
      return "";
  }
}

function accentClassByPhase(phase: GamePhase): string {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "border-[#ead8b5] bg-[#fff8ea]";
    case GamePhaseEnum.IN_GAME:
      return "border-[#cde7d7] bg-[#f2fcf5]";
    case GamePhaseEnum.POST_GAME:
      return "border-[#d7e0ea] bg-[#f4f7fb]";
    default:
      return "border-[#d7e0ea] bg-[#f4f7fb]";
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
      className={["rounded-[3px] border p-6", accentClassByPhase(phase)].join(
        " ",
      )}
    >
      <div className="space-y-3">
        <div className="text-sm font-medium text-[#5b7380]">
          {isLoading ? "게임 정보를 불러오는 중..." : label}
        </div>

        <div className="border-y border-[#d7e0ea] py-3 font-mono text-4xl font-semibold tracking-[0.08em] text-[#202938] md:text-5xl">
          {isLoading ? "--:--:--" : formatted}
        </div>

        <p className="text-sm leading-6 text-[#5b7380]">
          {descriptionByPhase(phase)}
        </p>
      </div>
    </section>
  );
}

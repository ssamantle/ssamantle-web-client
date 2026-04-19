import { useMemo } from "react";
import { GamePhaseEnum, type GamePhase } from "../types/game";

interface Args {
  now: Date;
  startAt: Date | null;
  endAt: Date | null;
}

interface Result {
  phase: GamePhase;
  remainingMs: number;
  label: string;
}

export function useGamePhase({ now, startAt, endAt }: Args): Result {
  return useMemo(() => {
    const nowMs = now.getTime();
    const startMs = startAt?.getTime() ?? null;
    const endMs = endAt?.getTime() ?? null;

    if (startMs && nowMs < startMs) {
      return {
        phase: GamePhaseEnum.PRE_GAME,
        remainingMs: Math.max(0, startMs - nowMs),
        label: "게임 시작까지",
      };
    }

    if (endMs && nowMs < endMs) {
      return {
        phase: GamePhaseEnum.IN_GAME,
        remainingMs: Math.max(0, endMs - nowMs),
        label: "게임 종료까지",
      };
    }

    return {
      phase: GamePhaseEnum.POST_GAME,
      remainingMs: 0,
      label: "게임 종료",
    };
  }, [now, startAt, endAt]);
}

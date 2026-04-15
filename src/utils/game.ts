import { GamePhaseEnum, type GamePhase } from "../types/game";

export function phaseToText(phase: GamePhase) {
  switch (phase) {
    case GamePhaseEnum.PRE_GAME:
      return "시작 전";
    case GamePhaseEnum.IN_GAME:
      return "진행 중";
    case GamePhaseEnum.POST_GAME:
      return "종료";
  }
}

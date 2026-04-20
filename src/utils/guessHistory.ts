import type { GuessResult } from "../types/game";

export function getGuessResultKey(result: GuessResult): string {
  return [
    result.label,
    result.rank,
    result.similarity.toFixed(6),
    result.isAnswer ? "answer" : "guess",
  ].join("::");
}

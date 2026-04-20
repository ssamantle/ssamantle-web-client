import type {
  PlayerState,
  RaceMapTick,
  RaceRunner,
  Similarity,
} from "../types/game";

export const RACE_MAP_TICKS: RaceMapTick[] = [
  { label: "GOAL", ratio: 1 },
  { label: "MID", ratio: 0.5 },
  { label: "START", ratio: 0 },
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizeSimilarity(similarity: Similarity): number {
  if (!Number.isFinite(similarity)) return 0;

  if (similarity <= 1) {
    return clamp01(similarity);
  }

  return clamp01(similarity / 100);
}

export function mapSimilarityToTrackY(similarity: Similarity): number {
  const normalized = normalizeSimilarity(similarity);
  return 1 - normalized;
}

export function toRaceRunners(players: PlayerState[]): RaceRunner[] {
  return players
    .map((player) => ({
      name: player.name,
      rank: player.rank,
      bestSimilarity: player.bestSimilarity,
    }))
    .sort((a, b) => {
      if (b.bestSimilarity !== a.bestSimilarity) {
        return b.bestSimilarity - a.bestSimilarity;
      }
      return a.rank - b.rank;
    });
}

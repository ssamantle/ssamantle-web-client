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

export const WORD_RANK_VOCAB_SIZE = 10000;

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

export function normalizeWordRankRatio(rank: number | null | undefined): number {
  if (typeof rank !== "number" || !Number.isFinite(rank)) {
    return 1;
  }

  return clamp01(Math.max(rank / WORD_RANK_VOCAB_SIZE, 0));
}

export function mapRankProgressToTrackY(rank: number | null | undefined): number {
  return normalizeWordRankRatio(rank);
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

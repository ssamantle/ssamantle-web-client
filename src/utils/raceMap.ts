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

const TOP_RANK = 1;
const THOUSANDTH_RANK = 1000;
const TOP_RANK_PROGRESS_PERCENT = 100;

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

function progressPercentForRank(rank: number): number {
  const normalizedRank = Math.max(TOP_RANK, Math.trunc(rank));

  if (normalizedRank >= THOUSANDTH_RANK) {
    return 0;
  }

  const ratio = (normalizedRank - TOP_RANK) / (THOUSANDTH_RANK - TOP_RANK);
  return TOP_RANK_PROGRESS_PERCENT - ratio * TOP_RANK_PROGRESS_PERCENT;
}

export function mapRankProgressToTrackY(rank: number | null | undefined): number {
  if (typeof rank !== "number" || !Number.isFinite(rank) || rank <= 0) {
    return 1;
  }

  return 1 - progressPercentForRank(rank) / 100;
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

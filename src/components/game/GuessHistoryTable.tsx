import type { GuessResult } from "../../types/game";
import { normalizeInput } from "../../utils/inputValidation";
import {
  WORD_RANK_VOCAB_SIZE,
  normalizeWordRankRatio,
} from "../../utils/raceMap";

interface GuessHistoryTableProps {
  items: GuessResult[];
  latestSubmittedGuessLabel?: string | null;
  isLoading?: boolean;
  error?: Error | null;
}

const MAX_SIMILARITY = 100;
const MIN_EMPHASIS_OPACITY = 0.6;
const MAX_EMPHASIS_OPACITY = 1;

function formatSimilarity(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
}

function formatWordRank(rank: number): string {
  if (!Number.isFinite(rank) || rank < 0) return "-";

  const normalizedRank = Math.round(rank);
  if (normalizedRank < WORD_RANK_VOCAB_SIZE) {
    return `${normalizedRank}위`;
  }

  return `${WORD_RANK_VOCAB_SIZE.toLocaleString()}위 이상`;
}

function progressWidth(wordRank: number): number {
  return (1 - normalizeWordRankRatio(wordRank)) * 100;
}

function normalizeSimilarity(similarity: number): number {
  if (!Number.isFinite(similarity)) return 0;
  const clampedSimilarity = Math.max(0, Math.min(similarity, MAX_SIMILARITY));
  return clampedSimilarity / MAX_SIMILARITY;
}

function emphasisOpacity(similarity: number, wordRank: number): number {
  const similarityScore = normalizeSimilarity(similarity);
  const wordRankScore = progressWidth(wordRank) / 100;
  const combinedScore = (similarityScore + wordRankScore) / 2;
  const opacity = MIN_EMPHASIS_OPACITY +
    (MAX_EMPHASIS_OPACITY - MIN_EMPHASIS_OPACITY) * combinedScore;

  return Number(opacity.toFixed(3));
}

function EmptyState() {
  return (
    <div className="rounded-[3px] border border-dashed border-[#c7d3df] bg-[#f8fbfe] px-4 py-8 text-center text-sm text-[#60727f]">
      아직 제출한 단어가 없습니다.
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[3px] border border-[#efc4c4] bg-[#fff4f4] px-4 py-8 text-center text-sm text-[#9a4545]">
      제출 기록을 불러오는 중 문제가 발생했습니다.
      <div className="mt-1 text-xs text-[#c46262]">{message}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[minmax(160px,1.6fr)_100px_100px_minmax(160px,1fr)] gap-3 rounded-[3px] border border-[#d7e0ea] bg-white px-5 py-3"
        >
          <div className="h-4 bg-[#e8eef4]" />
          <div className="h-4 bg-[#e8eef4]" />
          <div className="h-4 bg-[#e8eef4]" />
          <div className="h-4 bg-[#e8eef4]" />
        </div>
      ))}
    </div>
  );
}

export function GuessHistoryTable({
  items,
  latestSubmittedGuessLabel = null,
  isLoading = false,
  error = null,
}: GuessHistoryTableProps) {
  const sortedItems = latestSubmittedGuessLabel
    ? [...items].sort((a, b) => {
        const aHighlighted = normalizeInput(a.label) === latestSubmittedGuessLabel;
        const bHighlighted = normalizeInput(b.label) === latestSubmittedGuessLabel;

        if (aHighlighted === bHighlighted) return 0;
        return aHighlighted ? -1 : 1;
      })
    : items;

  return (
    <section className="rounded-[3px] border border-[#d7e0ea] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#202938]">제출 기록</h2>
          <p className="text-sm text-[#5b7380]">
            제출한 단어를 유사도와 단어 순위 기준으로 함께 확인할 수 있습니다.
          </p>
        </div>

        <div className="rounded-full border border-[#d7e0ea] bg-[#f8fbfe] px-3 py-1 text-sm font-medium text-[#60727f]">
          총 {items.length}개
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm text-[#202938]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.06em] text-[#6c8491]">
                <th className="border-b border-[#d7e0ea] pb-3 pl-3 pr-4 font-medium">단어</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">유사도</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">단어 순위</th>
                <th className="border-b border-[#d7e0ea] pb-3 pl-4 pr-3 font-medium">
                  <div>랭킹 기준</div>
                  <div className="mt-1 text-[10px] normal-case tracking-normal text-[#8a9ca7]">
                    0위 = 100% / {WORD_RANK_VOCAB_SIZE.toLocaleString()}위 = 0%
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => {
                const isLatestSubmitted =
                  normalizeInput(item.label) === latestSubmittedGuessLabel;
                const borderColorClassName = isLatestSubmitted
                  ? "border-[#eadfce]"
                  : "border-[#eef3f7]";
                const opacity = emphasisOpacity(item.similarity, item.wordRank);
                const similarityColor = isLatestSubmitted
                  ? `rgba(125, 91, 43, ${opacity})`
                  : `rgba(12, 104, 135, ${opacity})`;
                const wordRankColor = isLatestSubmitted
                  ? `rgba(122, 102, 80, ${opacity})`
                  : `rgba(53, 84, 105, ${opacity})`;
                const progressColor = isLatestSubmitted
                  ? `rgba(214, 181, 140, ${opacity})`
                  : `rgba(17, 164, 211, ${opacity})`;
                const progressLabelColor = isLatestSubmitted
                  ? `rgba(141, 120, 94, ${opacity})`
                  : `rgba(108, 132, 145, ${opacity})`;

                return (
                  <tr
                    key={`${item.label}-${item.rank}-${index}`}
                    className={isLatestSubmitted ? "bg-[#f4eadb]" : undefined}
                    data-highlighted={isLatestSubmitted ? "true" : "false"}
                  >
                    <td className={`border-b ${borderColorClassName} py-3 pl-3 pr-4 font-medium`}>
                      {item.label}
                    </td>
                    <td
                      className={`border-b ${borderColorClassName} py-3 pr-4 font-semibold`}
                      style={{ color: similarityColor }}
                    >
                      {formatSimilarity(item.similarity)}
                    </td>
                    <td
                      className={`border-b ${borderColorClassName} py-3 pr-4 font-medium`}
                      style={{ color: wordRankColor }}
                    >
                      {formatWordRank(item.wordRank)}
                    </td>
                    <td className={`border-b ${borderColorClassName} py-3 pl-4 pr-3`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-full min-w-[140px] overflow-hidden rounded-full ${
                            isLatestSubmitted ? "bg-[#eadfce]" : "bg-[#e5edf3]"
                          }`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progressWidth(item.wordRank)}%`,
                              backgroundColor: progressColor,
                            }}
                          />
                        </div>
                        <span
                          className="w-10 text-xs"
                          style={{ color: progressLabelColor }}
                        >
                          {Math.round(progressWidth(item.wordRank))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

import type { GuessResult } from "../../types/game";
import { getGuessResultKey } from "../../utils/guessHistory";

interface GuessHistoryTableProps {
  items: GuessResult[];
  latestSubmittedGuessKey?: string | null;
  isLoading?: boolean;
  error?: Error | null;
}

const MAX_WORD_RANK = 1000;

function formatSimilarity(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(2);
}

function formatWordRank(rank: number): string {
  if (!Number.isFinite(rank) || rank <= 0) return "-";
  return `#${Math.round(rank)}`;
}

function progressWidth(wordRank: number): number {
  if (!Number.isFinite(wordRank) || wordRank <= 0) return 0;
  const clampedRank = Math.min(wordRank, MAX_WORD_RANK);
  const width = ((MAX_WORD_RANK - clampedRank) / (MAX_WORD_RANK - 1)) * 100;
  return Math.max(0, Math.min(width, 100));
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
          className="grid grid-cols-[minmax(140px,1.4fr)_90px_90px_90px_minmax(140px,1fr)_50px] gap-3 rounded-[3px] border border-[#d7e0ea] bg-white px-4 py-3"
        >
          <div className="h-4 bg-[#e8eef4]" />
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
  latestSubmittedGuessKey = null,
  isLoading = false,
  error = null,
}: GuessHistoryTableProps) {
  const sortedItems = latestSubmittedGuessKey
    ? [...items].sort((a, b) => {
        const aHighlighted = getGuessResultKey(a) === latestSubmittedGuessKey;
        const bHighlighted = getGuessResultKey(b) === latestSubmittedGuessKey;

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
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">단어</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">유사도</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">제출 순위</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">단어 순위</th>
                <th className="border-b border-[#d7e0ea] pb-3 pr-4 font-medium">
                  <div>랭킹 기준</div>
                  <div className="mt-1 text-[10px] normal-case tracking-normal text-[#8a9ca7]">
                    1위 = 100% / 1000위 = 0%
                  </div>
                </th>
                <th className="border-b border-[#d7e0ea] pb-3 font-medium">정답</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, index) => {
                const isLatestSubmitted = getGuessResultKey(item) === latestSubmittedGuessKey;
                const borderColorClassName = isLatestSubmitted
                  ? "border-[#eadfce]"
                  : "border-[#eef3f7]";

                return (
                  <tr
                    key={`${item.label}-${item.rank}-${index}`}
                    className={isLatestSubmitted ? "bg-[#f4eadb]" : undefined}
                    data-highlighted={isLatestSubmitted ? "true" : "false"}
                  >
                    <td className={`border-b ${borderColorClassName} py-3 pr-4 font-medium`}>
                      {item.label}
                    </td>
                    <td
                      className={`border-b ${borderColorClassName} py-3 pr-4 font-semibold ${
                        isLatestSubmitted ? "text-[#7d5b2b]" : "text-[#0c6887]"
                      }`}
                    >
                      {formatSimilarity(item.similarity)}
                    </td>
                    <td
                      className={`border-b ${borderColorClassName} py-3 pr-4 ${
                        isLatestSubmitted ? "text-[#7a6650]" : "text-[#536273]"
                      }`}
                    >
                      #{item.rank}
                    </td>
                    <td
                      className={`border-b ${borderColorClassName} py-3 pr-4 font-medium ${
                        isLatestSubmitted ? "text-[#7a6650]" : "text-[#355469]"
                      }`}
                    >
                      {formatWordRank(item.wordRank)}
                    </td>
                    <td className={`border-b ${borderColorClassName} py-3 pr-4`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-full min-w-[140px] overflow-hidden rounded-full ${
                            isLatestSubmitted ? "bg-[#eadfce]" : "bg-[#e5edf3]"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full ${
                              isLatestSubmitted ? "bg-[#d6b58c]" : "bg-[#11a4d3]"
                            }`}
                            style={{ width: `${progressWidth(item.wordRank)}%` }}
                          />
                        </div>
                        <span
                          className={`w-10 text-xs ${
                            isLatestSubmitted ? "text-[#8d785e]" : "text-[#6c8491]"
                          }`}
                        >
                          {Math.round(progressWidth(item.wordRank))}%
                        </span>
                      </div>
                    </td>
                    <td className={`border-b ${borderColorClassName} py-3 text-center text-base`}>
                      <span
                        aria-label={item.isAnswer ? "정답" : "오답"}
                        title={item.isAnswer ? "정답" : "오답"}
                        className={item.isAnswer ? "text-[#23734b]" : "text-[#93a4af]"}
                      >
                        {item.isAnswer ? "●" : "○"}
                      </span>
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

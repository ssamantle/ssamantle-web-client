import { useMemo } from "react";
import type { RaceMapSubmissionBubble, RaceRunner } from "../../types/game";
import { RACE_MAP_TICKS, mapSimilarityToTrackY } from "../../utils/raceMap";

interface RaceMapLeaderboardProps {
  runners: RaceRunner[];
  currentUsername: string;
  isVisible: boolean;
  onToggle: () => void;
  bubbles?: RaceMapSubmissionBubble[];
}

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function medalForRank(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function runnerOffset(name: string): number {
  const seed = Array.from(name).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

  return (seed % 3) * 4;
}

export function RaceMapLeaderboard({
  runners,
  currentUsername,
  isVisible,
  onToggle,
  bubbles = [],
}: RaceMapLeaderboardProps) {
  const normalizedCurrentUsername = normalizeUsername(currentUsername);

  const bubblesByPlayer = useMemo(() => {
    const map = new Map<string, RaceMapSubmissionBubble[]>();

    bubbles.forEach((bubble) => {
      const key = normalizeUsername(bubble.playerName);
      const current = map.get(key) ?? [];
      current.push(bubble);
      map.set(key, current);
    });

    map.forEach((playerBubbles) => {
      playerBubbles.sort((left, right) => {
        if (left.type === right.type) return 0;
        return left.type === "best" ? -1 : 1;
      });
    });

    return map;
  }, [bubbles]);

  const displayedRunners = useMemo(() => {
    return [...runners].sort((left, right) => {
      const leftIsCurrentUser =
        normalizeUsername(left.name) === normalizedCurrentUsername;
      const rightIsCurrentUser =
        normalizeUsername(right.name) === normalizedCurrentUsername;

      if (leftIsCurrentUser === rightIsCurrentUser) return 0;
      return leftIsCurrentUser ? 1 : -1;
    });
  }, [normalizedCurrentUsername, runners]);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed right-4 top-20 z-40 hidden rounded-full border border-[#c5d5e0] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#355469] shadow-sm backdrop-blur lg:inline-flex"
      >
        {isVisible ? "레이스맵 숨기기" : "레이스맵 보기"}
      </button>

      {isVisible ? (
        <aside className="fixed right-0 top-32 z-30 hidden h-[calc(100vh-9.5rem)] min-h-[380px] w-[210px] bg-transparent p-3 lg:block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-[0.06em] text-[#486679]">
              RACE MAP
            </h3>
            <span className="text-[11px] text-[#6f8798]">{runners.length}명</span>
          </div>

          <div className="relative h-[calc(100%-1.75rem)] rounded-[4px] bg-transparent pl-2 pr-0">
            <div className="absolute bottom-2 right-3 top-2 w-[2px] bg-[#7ea6be]" />

            {RACE_MAP_TICKS.map((tick) => {
              const y = `${(1 - tick.ratio) * 100}%`;
              return (
                <div
                  key={tick.label}
                  className="absolute left-0 right-0"
                  style={{ top: y }}
                >
                  <div className="relative -translate-y-1/2">
                    <div className="absolute right-2 h-[1px] w-6 bg-[#7094a9]" />
                    <span className="absolute left-1 text-[10px] font-semibold text-[#4f6f82]">
                      {tick.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {displayedRunners.map((runner, index) => {
              const markerY = `${mapSimilarityToTrackY(runner.bestSimilarity) * 100}%`;
              const overlapOffset = runnerOffset(runner.name);
              const medal = medalForRank(runner.rank);
              const isCurrentUser =
                normalizeUsername(runner.name) === normalizedCurrentUsername;
              const markerOpacity = isCurrentUser ? 1 : 0.8;
              const runnerBubbles =
                bubblesByPlayer.get(normalizeUsername(runner.name)) ?? [];

              return (
                <div key={runner.name}>
                  <div
                    className="absolute left-0 right-0 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:transition-[top,transform]"
                    style={{
                      top: markerY,
                      transform: `translateY(calc(-50% + ${overlapOffset}px))`,
                      zIndex: isCurrentUser
                        ? displayedRunners.length + 3
                        : displayedRunners.length - index + 2,
                    }}
                  >
                    <div
                      className="relative flex items-center justify-center"
                      style={{ opacity: markerOpacity }}
                    >
                      <div
                        className={`absolute rounded-full shadow ${
                          isCurrentUser
                            ? "right-[7px] h-3.5 w-3.5 border-2 border-white bg-[#0f6f93] ring-2 ring-[#d7edf6]"
                            : "right-[8px] h-2.5 w-2.5 border border-white bg-[#1c87b0]"
                        }`}
                      />

                      <span
                        className={`absolute right-[28px] flex max-w-[144px] items-center gap-1 truncate rounded-full bg-white px-2 py-0.5 text-[10px] font-medium shadow-sm ${
                          isCurrentUser
                            ? "border border-[#6fa6bc] text-[#123f55]"
                            : "border border-[#b9d0df] text-[#25475a]"
                        }`}
                      >
                        {medal ? <span aria-hidden="true">{medal}</span> : null}
                        <span className="truncate">{runner.name}</span>
                      </span>
                    </div>
                  </div>

                  {runnerBubbles.map((bubble) => {
                    const bubbleY = `${mapSimilarityToTrackY(bubble.similarity) * 100}%`;
                    const bubbleOffset =
                      overlapOffset + (bubble.type === "best" ? -14 : 10);
                    const bubbleOpacity =
                      bubble.type === "best"
                        ? markerOpacity
                        : Math.max(0.42, markerOpacity * 0.58);
                    const bubbleClasses =
                      bubble.type === "best"
                        ? "border-[#d6dee6] bg-white text-[#3e5b6e]"
                        : "border-[#d5dfe7] bg-white/75 text-[#587283]";

                    return (
                      <div
                        key={bubble.id}
                        className="pointer-events-none absolute left-0 right-0 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:transition-[top,transform,opacity]"
                        style={{
                          top: bubbleY,
                          transform: `translateY(calc(-50% + ${bubbleOffset}px))`,
                          zIndex: isCurrentUser
                            ? displayedRunners.length + (bubble.type === "best" ? 2 : 1)
                            : displayedRunners.length -
                              index +
                              (bubble.type === "best" ? 1 : 0),
                          opacity: bubbleOpacity,
                        }}
                      >
                        <span
                          data-bubble-type={bubble.type}
                          data-player-name={bubble.playerName}
                          className={`absolute right-[28px] max-w-[144px] truncate rounded-[4px] border px-2 py-0.5 text-[10px] shadow ${bubbleClasses}`}
                          title={bubble.word}
                        >
                          {bubble.word}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>
      ) : null}
    </>
  );
}

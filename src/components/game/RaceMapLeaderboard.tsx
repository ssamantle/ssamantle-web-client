import { useEffect, useMemo, useState } from "react";
import type { RaceMapSubmissionBubble, RaceRunner } from "../../types/game";
import { RACE_MAP_TICKS, mapSimilarityToTrackY } from "../../utils/raceMap";

interface RaceMapLeaderboardProps {
  runners: RaceRunner[];
  isVisible: boolean;
  onToggle: () => void;
  bubbles?: RaceMapSubmissionBubble[];
}

function bubbleOpacity(now: number, bubble: RaceMapSubmissionBubble): number {
  const lifespan = bubble.expiresAt - bubble.createdAt;
  if (lifespan <= 0) return 0;

  const elapsed = now - bubble.createdAt;
  const progress = Math.max(0, Math.min(1, elapsed / lifespan));

  if (progress < 0.1) {
    return progress / 0.1;
  }

  if (progress > 0.75) {
    return Math.max(0, (1 - progress) / 0.25);
  }

  return 1;
}

function useAnimationNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(id);
  }, [active]);

  return now;
}

export function RaceMapLeaderboard({
  runners,
  isVisible,
  onToggle,
  bubbles = [],
}: RaceMapLeaderboardProps) {
  const now = useAnimationNow(isVisible && bubbles.length > 0);

  const latestBubbleByPlayer = useMemo(() => {
    const map = new Map<string, RaceMapSubmissionBubble>();

    bubbles.forEach((bubble) => {
      if (bubble.expiresAt <= now) return;

      const current = map.get(bubble.playerName);
      if (!current || current.createdAt < bubble.createdAt) {
        map.set(bubble.playerName, bubble);
      }
    });

    return map;
  }, [bubbles, now]);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="fixed right-4 top-20 z-40 hidden rounded-full border border-[#c5d5e0] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#355469] shadow-sm backdrop-blur xl:inline-flex"
      >
        {isVisible ? "레이스맵 숨기기" : "레이스맵 보기"}
      </button>

      {isVisible ? (
        <aside className="fixed right-0 top-32 z-30 hidden h-[calc(100vh-9.5rem)] min-h-[380px] w-[210px] rounded-l-[10px] border border-r-0 border-[#c8d4e2] bg-white/88 p-3 shadow-[-12px_16px_34px_rgba(116,140,161,0.24)] backdrop-blur xl:block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-[0.06em] text-[#486679]">
              RACE MAP
            </h3>
            <span className="text-[11px] text-[#6f8798]">{runners.length}명</span>
          </div>

          <div className="relative h-[calc(100%-1.75rem)] rounded-[4px] bg-[linear-gradient(180deg,#edf5fb_0%,#f8fcff_100%)] pl-2 pr-0">
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

            {runners.map((runner, index) => {
              const ratio = mapSimilarityToTrackY(runner.bestSimilarity);
              const y = `${ratio * 100}%`;
              const overlapOffset = (index % 3) * 4;
              const bubble = latestBubbleByPlayer.get(runner.name);
              const opacity = bubble ? bubbleOpacity(now, bubble) : 0;

              return (
                <div
                  key={`${runner.name}-${runner.rank}`}
                  className="absolute left-0 right-0"
                  style={{ top: y, transform: `translateY(calc(-50% + ${overlapOffset}px))` }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute right-[11px] h-2.5 w-2.5 rounded-full border border-white bg-[#1c87b0] shadow" />

                    <span className="absolute right-[28px] max-w-[144px] truncate rounded-full border border-[#b9d0df] bg-white px-2 py-0.5 text-[10px] font-medium text-[#25475a] shadow-sm">
                      {runner.name}
                    </span>

                    {bubble ? (
                      <span
                        className="pointer-events-none absolute right-[28px] top-[-1.55rem] max-w-[144px] truncate rounded-[4px] border border-[#d6dee6] bg-white px-2 py-0.5 text-[10px] text-[#3e5b6e] shadow transition-opacity"
                        style={{ opacity }}
                        title={bubble.word}
                      >
                        {bubble.word}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      ) : null}
    </>
  );
}

import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  RaceMapSimilarityMarker,
  RaceMapTick,
  RaceRunner,
} from "../../types/game";
import { RACE_MAP_TICKS, mapRankProgressToTrackY } from "../../utils/raceMap";

interface RaceMapLeaderboardProps {
  runners: RaceRunner[];
  currentUsername: string;
  isVisible: boolean;
  onToggle: () => void;
  markers?: RaceMapSimilarityMarker[];
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

function compareMarkerType(
  left: RaceMapSimilarityMarker,
  right: RaceMapSimilarityMarker,
): number {
  if (left.type === right.type) return 0;
  return left.type === "best" ? -1 : 1;
}

function markerForType(
  markers: RaceMapSimilarityMarker[],
  type: "best" | "latest",
): RaceMapSimilarityMarker | null {
  return markers.find((marker) => marker.type === type) ?? null;
}

interface RaceMapTrackProps {
  ticks: RaceMapTick[];
  runnerCount: number;
  children: ReactNode;
}

function tickTop(tick: RaceMapTick): string {
  return `${(1 - tick.ratio) * 100}%`;
}

function RaceMapTrack({ ticks, runnerCount, children }: RaceMapTrackProps) {
  return (
    <div className="relative h-[calc(100%-1.75rem)] rounded-[4px] bg-transparent pl-2 pr-0">
      <div className="absolute bottom-2 right-3 top-2 w-[2px] bg-[#7ea6be]" />

      {ticks.map((tick) => (
        <div
          key={tick.label}
          className="absolute left-0 right-0"
          style={{ top: tickTop(tick) }}
        >
          <div className="relative -translate-y-1/2">
            <div className="absolute right-2 h-[1px] w-6 bg-[#7094a9]" />
            <span className="absolute left-1 text-[10px] font-semibold text-[#4f6f82]">
              {tick.label}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-0 right-0 top-0 h-full">{children}</div>
      <span className="sr-only">레이스맵에 {runnerCount}명의 참가자가 표시됩니다.</span>
    </div>
  );
}

interface RaceMapRunnerMarkerProps {
  name: string;
  medal: string | null;
  isCurrentUser: boolean;
  style: CSSProperties;
}

function RaceMapRunnerMarker({
  name,
  medal,
  isCurrentUser,
  style,
}: RaceMapRunnerMarkerProps) {
  return (
    <div
      className="absolute left-0 right-0 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:transition-[top,transform]"
      style={style}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ opacity: isCurrentUser ? 1 : 0.8 }}
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
          <span className="truncate">{name}</span>
        </span>
      </div>
    </div>
  );
}

interface RaceMapSimilarityDotProps {
  marker: RaceMapSimilarityMarker;
  isCurrentUser: boolean;
  style: CSSProperties;
}

function RaceMapSimilarityDot({
  marker,
  isCurrentUser,
  style,
}: RaceMapSimilarityDotProps) {
  const showLatestLabel = marker.type === "latest";
  const markerClasses =
    marker.type === "best"
      ? isCurrentUser
        ? "h-4 w-4 border-2 border-white bg-[#0f6f93] ring-2 ring-[#d7edf6]"
        : "h-3 w-3 border border-white bg-[#1c87b0]"
      : isCurrentUser
        ? "h-3.5 w-3.5 border-2 border-white bg-[#85b7cf]"
        : "h-2.5 w-2.5 border border-white bg-[#aacada]";

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:transition-[top,transform,opacity]"
      style={style}
    >
      <div
        data-similarity-marker-type={marker.type}
        data-player-name={marker.playerName}
        className={`absolute right-[8px] rounded-full shadow ${markerClasses}`}
        aria-label={`${marker.playerName} ${marker.type}`}
      />

      {showLatestLabel ? (
        <span
          data-similarity-marker-label-type={marker.type}
          data-player-name={marker.playerName}
          className={`absolute right-[28px] max-w-[144px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] shadow-sm ${
            isCurrentUser
              ? "border border-[#a7c8d8] text-[#2f5f75]"
              : "border border-[#c8dbe6] text-[#587283]"
          }`}
        >
          {marker.playerName}
        </span>
      ) : null}
    </div>
  );
}

export function RaceMapLeaderboard({
  runners,
  currentUsername,
  isVisible,
  onToggle,
  markers = [],
}: RaceMapLeaderboardProps) {
  const normalizedCurrentUsername = normalizeUsername(currentUsername);

  const markersByPlayer = useMemo(() => {
    const map = new Map<string, RaceMapSimilarityMarker[]>();

    markers.forEach((marker) => {
      const key = normalizeUsername(marker.playerName);
      const current = map.get(key) ?? [];
      current.push(marker);
      map.set(key, current);
    });

    map.forEach((playerBubbles) => {
      playerBubbles.sort(compareMarkerType);
    });

    return map;
  }, [markers]);

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

          <RaceMapTrack ticks={RACE_MAP_TICKS} runnerCount={runners.length}>
            {displayedRunners.map((runner, index) => {
              const overlapOffset = runnerOffset(runner.name);
              const medal = medalForRank(runner.rank);
              const isCurrentUser =
                normalizeUsername(runner.name) === normalizedCurrentUsername;
              const runnerMarkers =
                markersByPlayer.get(normalizeUsername(runner.name)) ?? [];
              const bestMarker = markerForType(runnerMarkers, "best");
              const latestMarker = markerForType(runnerMarkers, "latest");
              const labelWordRank = bestMarker?.wordRank ?? latestMarker?.wordRank ?? runner.rank;
              const labelY = `${mapRankProgressToTrackY(labelWordRank) * 100}%`;
              const labelZIndex = isCurrentUser
                ? displayedRunners.length + 4
                : displayedRunners.length - index + 2;

              return (
                <div key={runner.name}>
                  <RaceMapRunnerMarker
                    name={runner.name}
                    medal={medal}
                    isCurrentUser={isCurrentUser}
                    style={{
                      top: labelY,
                      transform: `translateY(calc(-50% + ${overlapOffset}px))`,
                      zIndex: labelZIndex,
                    }}
                  />

                  {bestMarker ? (
                    <RaceMapSimilarityDot
                      marker={bestMarker}
                      isCurrentUser={isCurrentUser}
                      style={{
                        top: `${mapRankProgressToTrackY(bestMarker.wordRank ?? runner.rank) * 100}%`,
                        transform: `translateY(calc(-50% + ${overlapOffset - 6}px))`,
                        zIndex: labelZIndex - 1,
                        opacity: isCurrentUser ? 1 : 0.82,
                      }}
                    />
                  ) : null}

                  {latestMarker ? (
                    <RaceMapSimilarityDot
                      marker={latestMarker}
                      isCurrentUser={isCurrentUser}
                      style={{
                        top: `${mapRankProgressToTrackY(latestMarker.wordRank ?? runner.rank) * 100}%`,
                        transform: `translateY(calc(-50% + ${overlapOffset + 8}px))`,
                        zIndex: labelZIndex - 2,
                        opacity: isCurrentUser ? 0.9 : 0.62,
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </RaceMapTrack>
        </aside>
      ) : null}
    </>
  );
}

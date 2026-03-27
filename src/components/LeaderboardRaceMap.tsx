import React, { useRef, useState } from 'react';
import { LeaderboardEntry } from '../types';

interface Props {
  leaderboard: LeaderboardEntry[];
  currentUsername: string;
}

function clampSimilarity(similarity: number) {
  return Math.max(0, Math.min(100, similarity));
}

function hashUsername(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i += 1)
    hash = (hash * 31 + username.charCodeAt(i)) | 0;
  return hash;
}

function usernameToColor(username: string) {
  const hue = Math.abs(hashUsername(username)) % 360;
  return `hsl(${hue}, 80%, 65%)`;
}

export function LeaderboardRaceMap({ leaderboard, currentUsername }: Props) {
  const mapRef = useRef<HTMLElement | null>(null);
  const tooltipRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [tooltipShiftById, setTooltipShiftById] = useState<Record<string, number>>({});

  if (leaderboard.length === 0) {
    return null;
  }

  const sorted = [...leaderboard].sort((a, b) => b.similarity - a.similarity);

  function adjustTooltipPosition(id: string) {
    const mapEl = mapRef.current;
    const tooltipEl = tooltipRefs.current[id];
    if (!mapEl || !tooltipEl) return;

    const mapRect = mapEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const edgePadding = 8;

    let shift = 0;
    if (tooltipRect.left < mapRect.left + edgePadding) {
      shift = mapRect.left + edgePadding - tooltipRect.left;
    } else if (tooltipRect.right > mapRect.right - edgePadding) {
      shift = mapRect.right - edgePadding - tooltipRect.right;
    }

    setTooltipShiftById(prev => {
      if (prev[id] === shift) return prev;
      return { ...prev, [id]: shift };
    });
  }

  return (
    <div className="leaderboard-race-box">
      <section className="leaderboard-race-map" aria-label="Leaderboard race map" ref={mapRef}>
        <div className="leaderboard-race-track" aria-hidden="true"></div>
        <ol className="leaderboard-race-markers">
          {sorted.map((entry, index) => {
            const markerId = `${entry.username}-${index}`;
            const markerColor = usernameToColor(entry.username);
            const position = clampSimilarity(entry.similarity);
            const isMe = entry.username === currentUsername;
            return (
              (
                <li
                  key={markerId}
                  className={`leaderboard-race-marker${isMe ? ' leaderboard-race-marker-me' : ''}`}
                  style={{
                    left: `${position}%`,
                    // zIndex: isMe ? 30 : 20 - Math.min(index, 19),
                    ['--marker-color' as string]: markerColor,
                    ['--tooltip-shift' as string]: `${tooltipShiftById[markerId] ?? 0}px`,
                  }}
                >
                  <button
                    type="button"
                    className="leaderboard-race-marker-button"
                    aria-label={`${entry.username} best similarity ${entry.similarity.toFixed(2)}`}
                    onMouseEnter={() => adjustTooltipPosition(markerId)}
                    onFocus={() => adjustTooltipPosition(markerId)}
                  >
                    <svg
                      className="leaderboard-race-bookmark"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M4 12L4 4L12 4L12 12L8 16z" />
                    </svg>
                  </button>
                  <span
                    className="leaderboard-race-tooltip"
                    role="tooltip"
                    ref={(el) => {
                      tooltipRefs.current[markerId] = el;
                    }}
                  >
                    <strong>{entry.username}</strong>
                    <span>Best similarity {entry.similarity.toFixed(2)}</span>
                  </span>
                </li>
              )
            );
          })}
        </ol>
      </section>
    </div>
  );
}

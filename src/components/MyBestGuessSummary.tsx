import React from 'react';
import { GuessEntry } from '../types';

interface Props {
  bestGuess: GuessEntry | null;
}

export function MyBestGuessSummary({ bestGuess }: Props) {
  const bestRank = bestGuess ? bestGuess.rank : null;

  return (
    <div className="game-timer-stats">
      {bestGuess ? (
        <>
          <span className="game-timer-stat">
            <span className="game-timer-stat-name">내 순위</span>
            <strong className="game-timer-stat-value">
              {typeof bestRank === 'number' ? `#${bestRank}` : bestRank}
            </strong>
          </span>
          <span className="game-timer-stat">
            <span className="game-timer-stat-name">최고 유사도</span>
            <strong className="game-timer-stat-value">{bestGuess.similarity.toFixed(2)}</strong>
          </span>
          <span className="game-timer-stat">
            <span className="game-timer-stat-name">단어</span>
            <strong className="game-timer-stat-value game-timer-stat-spoiler">{bestGuess.word}</strong>
          </span>
        </>
      ) : (
        <span className="game-timer-stat">아직 제출한 단어가 없습니다.</span>
      )}
    </div>
  );
}

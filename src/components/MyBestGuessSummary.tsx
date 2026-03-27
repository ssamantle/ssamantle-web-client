import React from 'react';
import { GuessEntry } from '../types';

interface Props {
  bestGuess: GuessEntry | null;
  username: string;
}

export function MyBestGuessSummary({ bestGuess, username }: Props) {
  const bestRank = bestGuess ? bestGuess.rank : null;

  return (
    <div className="game-timer-stats">
      {bestGuess ? (
        <>
          <span className="game-timer-stat">
            <span className="game-timer-stat-name">사용자명</span>
            <strong className="game-timer-stat-value">{username}</strong>
          </span>
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
        </>
      ) : (
        <span className="game-timer-stat">아직 제출한 단어가 없습니다.</span>
      )}
    </div>
  );
}

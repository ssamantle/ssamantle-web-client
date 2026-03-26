import React from 'react';
import { GameResult } from '../components/GameResult';
import { GuessForm } from '../components/GuessForm';
import { GuessTable } from '../components/GuessTable';
import { GuessEntry, GameStats, LeaderboardEntry } from '../types';

interface Props {
  guesses: GuessEntry[];
  leaderboard: LeaderboardEntry[];
  gameOver: boolean;
  stats: GameStats | null;
  currentGuess: string;
  isLoading: boolean;
  startTime: number | null;
  endTime: number | null;
  gameEndTime: number | null;
  now: number;
  submitGuess: (guess: string) => Promise<void>;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function InGamePage({
  guesses,
  leaderboard,
  gameOver,
  stats,
  currentGuess,
  isLoading,
  startTime,
  endTime,
  gameEndTime,
  now,
  submitGuess,
}: Props) {
  const remainingText = gameEndTime === null ? null : formatCountdown(gameEndTime - now);
  const bestGuess = guesses[0] || null;
  const bestRank = bestGuess ? bestGuess.rank : null;

  return (
    <>
      {remainingText && (
        <div className="game-timer">
          <div className="game-timer-main">
            <span className="game-timer-label">게임 종료까지</span>
            <strong className="game-timer-value">{remainingText}</strong>
          </div>
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
                  <span className="game-timer-stat-name">최대 유사도</span>
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
        </div>
      )}

      <GuessForm
        onSubmit={submitGuess}
        gameOver={gameOver}
        isLoading={isLoading}
      />

      {gameOver && stats && (
        <GameResult
          guessCount={guesses.length}
          stats={stats}
          storedGuesses={guesses}
          startTime={startTime}
          endTime={endTime}
        />
      )}

      <div className="game-panels">
        <div className="game-panel-main">
          <GuessTable
            guesses={guesses}
            currentGuess={currentGuess}
          />
        </div>
        <aside className="leaderboard-panel" aria-label="실시간 리더보드">
          <div className="leaderboard-card">
            <h3>실시간 리더보드</h3>
            {leaderboard.length > 0 ? (
              <ol className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <li className="leaderboard-row" key={`${entry.username}-${index}`}>
                    <span className="leaderboard-rank">#{index + 1}</span>
                    <span className={`leaderboard-name${index === 0 ? ' leaderboard-name-top' : ''}`}>
                      {entry.username}
                    </span>
                    <span className="leaderboard-score">{entry.similarity.toFixed(2)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="leaderboard-empty">표시할 참가자 기록이 없습니다.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

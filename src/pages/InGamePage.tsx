import React from 'react';
import { GameResult } from '../components/GameResult';
import { GuessForm } from '../components/GuessForm';
import { InGameDashboard } from '../components/InGameDashboard';
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
  username: string;
  submitGuess: (guess: string) => Promise<void>;
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
  username,
  submitGuess,
}: Props) {
  const bestGuess = guesses[0] || null;
  const upperLeaderboard = leaderboard.slice(0, 3);
  const lowerLeaderboard = leaderboard.slice(3);

  return (
    <>
      <InGameDashboard
        gameEndTime={gameEndTime}
        username={username}
        bestGuess={bestGuess}
      />

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
          {leaderboard.length > 0 ? (
            <>
              <div className="leaderboard-card">
                <h3>실시간 리더보드</h3>
                <ol className="leaderboard-list leaderboard-list-upper">
                  {upperLeaderboard.map((entry, index) => (
                    <li className="leaderboard-row leaderboard-row-upper" key={`${entry.username}-${index}`}>
                      <span className="leaderboard-rank">#{index + 1}</span>
                      <span className={`leaderboard-name${index === 0 ? ' leaderboard-name-top' : ''}`}>
                        {entry.username}
                      </span>
                      <span className="leaderboard-score">{entry.similarity.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {lowerLeaderboard.length > 0 && (
                <ol className="leaderboard-list leaderboard-list-lower" start={4}>
                  {lowerLeaderboard.map((entry, index) => (
                    <li className="leaderboard-row leaderboard-row-lower" key={`${entry.username}-${index + 3}`}>
                      <span className="leaderboard-rank">#{index + 4}</span>
                      <span className="leaderboard-name">{entry.username}</span>
                      <span className="leaderboard-score">{entry.similarity.toFixed(2)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <div className="leaderboard-card">
              <h3>실시간 리더보드</h3>
              <p className="leaderboard-empty">아직 참여 기록이 없습니다.</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

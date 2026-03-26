import React from 'react';
import { GameResult } from '../components/GameResult';
import { GuessForm } from '../components/GuessForm';
import { GuessTable } from '../components/GuessTable';
import { GuessEntry, GameStats } from '../types';

interface Props {
  guesses: GuessEntry[];
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

  return (
    <>
      {remainingText && (
        <div className="game-timer">
          <span className="game-timer-label">게임 종료까지</span>
          <strong className="game-timer-value">{remainingText}</strong>
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

      <GuessTable
        guesses={guesses}
        currentGuess={currentGuess}
      />
    </>
  );
}

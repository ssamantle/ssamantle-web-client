import React from 'react';
import { GuessEntry } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { MyBestGuessSummary } from './MyBestGuessSummary';

interface Props {
  gameEndTime: number | null;
  username: string;
  bestGuess: GuessEntry | null;
}

export function InGameDashboard({ gameEndTime, username, bestGuess }: Props) {
  if (gameEndTime === null) {
    return null;
  }

  return (
    <div className="game-timer">
      <CountdownTimer label="게임 종료까지" targetTime={gameEndTime} />
      <MyBestGuessSummary bestGuess={bestGuess} username={username} />
    </div>
  );
}

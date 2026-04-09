import React from 'react';
import { GuessEntry } from '../types';
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
    <div className="game-summary">
      <MyBestGuessSummary bestGuess={bestGuess} username={username} />
    </div>
  );
}

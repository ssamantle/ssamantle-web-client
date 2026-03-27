import React from 'react';
import { CountdownTimer } from './CountdownTimer';

interface Props {
  isLoading: boolean;
  gameStartTime: number | null;
}

export function LobbyGameStatus({ isLoading, gameStartTime }: Props) {
  if (isLoading) {
    return <p className="lobby-status">게임 시작 시간을 확인하는 중입니다.</p>;
  }

  if (gameStartTime === null) {
    return null;
  }

  return (
    <div className="lobby-status-block">
      <div className="game-timer">
        <CountdownTimer
          label="게임 시작까지"
          targetTime={gameStartTime}
          completedMessage="게임이 시작되었습니다!"
        />
        <p className="lobby-status">
          시작 예정 시각: {new Date(gameStartTime).toLocaleTimeString('ko-KR')}
        </p>
      </div>
    </div>
  );
}

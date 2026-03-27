import React from 'react';

interface Props {
  isLoading: boolean;
  gameStartTime: number | null;
  now: number;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function LobbyGameStatus({ isLoading, gameStartTime, now }: Props) {
  if (isLoading) {
    return <p className="lobby-status">게임 시작 시간을 확인하는 중입니다.</p>;
  }

  if (gameStartTime === null) {
    return null;
  }

  const gameStarted = now >= gameStartTime;
  const countdown = gameStarted ? '게임이 시작되었습니다!' : formatCountdown(gameStartTime - now);

  return (
    <div className="lobby-status-block">
      <p className="lobby-status">
        시작 예정 시각: {new Date(gameStartTime).toLocaleTimeString('ko-KR')}
      </p>
      <p className="lobby-countdown">{countdown}</p>
    </div>
  );
}

import React, { useState } from 'react';

interface Props {
  initialUsername: string;
  initialHost: string;
  onStartGame: (username: string, host: string) => Promise<void>;
  gameStartTime: number | null;
  now: number;
  isLoadingGameStartTime: boolean;
  errorMessage: string;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function LobbyPage({
  initialUsername,
  initialHost,
  onStartGame,
  gameStartTime,
  now,
  isLoadingGameStartTime,
  errorMessage,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [host, setHost] = useState(initialHost);
  const countdown = gameStartTime === null ? null : formatCountdown(gameStartTime - now);
  const hasSubmittedUsername = Boolean(initialUsername.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    const trimmedHost = host.trim();
    if (!trimmed || !trimmedHost) return;
    await onStartGame(trimmed, trimmedHost);
  }

  return (
    <section className="lobby-page">
      <div className="lobby-card">
        <p className="lobby-eyebrow">Lobby</p>
        <h2>게임 시작 대기 중</h2>
        <p className="lobby-copy">
          사용자 이름을 입력한 뒤 서버가 전달한 시작 시각까지 대기합니다. 시작 시각이 되면 자동으로 플레이 화면으로 이동합니다.
        </p>
        <form className="lobby-form" onSubmit={handleSubmit}>
          <label className="lobby-label" htmlFor="lobby-username">
            사용자 명
          </label>
          <div className="lobby-field-group">
            <input
              id="lobby-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="사용자 명을 입력하세요"
              autoComplete="nickname"
              autoFocus
            />
            {errorMessage && (
              <p className="lobby-error">{errorMessage}</p>
            )}
          </div>
          <label className="lobby-label" htmlFor="lobby-host">
            서버 호스트
          </label>
          <input
            id="lobby-host"
            type="text"
            value={host}
            onChange={e => setHost(e.target.value)}
            placeholder="127.0.0.1:8080 또는 game.example.com"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            type="submit"
            value={hasSubmittedUsername ? '대기 정보 갱신' : '대기 시작'}
            disabled={!username.trim() || !host.trim()}
          />
        </form>
        {isLoadingGameStartTime && (
          <p className="lobby-status">게임 시작 시간을 확인하는 중입니다.</p>
        )}
        {!isLoadingGameStartTime && gameStartTime !== null && (
          <div className="lobby-status-block">
            <p className="lobby-status">
              시작 예정 시각: {new Date(gameStartTime).toLocaleTimeString('ko-KR')}
            </p>
            <p className="lobby-countdown">{countdown}</p>
          </div>
        )}
      </div>
    </section>
  );
}

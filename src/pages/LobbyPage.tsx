import React, { useEffect, useRef, useState } from 'react';

interface Props {
  initialUsername: string;
  initialHost: string;
  onEnterHost: (host: string) => Promise<void>;
  onStartGame: (username: string, host: string) => Promise<boolean>;
  onBeginUsernameEdit: () => void;
  gameStartTime: number | null;
  now: number;
  isLoadingGameStartTime: boolean;
  hostErrorMessage: string;
  usernameErrorMessage: string;
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
  onEnterHost,
  onStartGame,
  onBeginUsernameEdit,
  gameStartTime,
  now,
  isLoadingGameStartTime,
  hostErrorMessage,
  usernameErrorMessage,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [host, setHost] = useState(initialHost);
  const [step, setStep] = useState(initialHost.trim() ? 1 : 0);
  const previousHostRef = useRef(initialHost);
  const countdown = gameStartTime === null ? null : formatCountdown(gameStartTime - now);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const hasSubmittedUsername = Boolean(initialUsername.trim()) && !isEditingUsername;

  useEffect(() => {
    if (initialUsername.trim()) {
      setUsername(initialUsername);
      setIsEditingUsername(false);
    }
  }, [initialUsername]);

  useEffect(() => {
    if (previousHostRef.current === initialHost) return;
    previousHostRef.current = initialHost;
    setHost(initialHost);
    setUsername('');
    setIsEditingUsername(false);
  }, [initialHost]);

  async function handleEnterHost(e: React.FormEvent) {
    e.preventDefault();
    const trimmedHost = host.trim();
    if (!trimmedHost) return;
    try {
      await onEnterHost(trimmedHost);
      setStep(1);
    } catch {
      // Host connection errors are surfaced in the UI.
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasSubmittedUsername) {
      onBeginUsernameEdit();
      setIsEditingUsername(true);
      return;
    }
    const trimmed = username.trim();
    const trimmedHost = host.trim();
    if (!trimmed || !trimmedHost) return;
    try {
      const didStartWaiting = await onStartGame(trimmed, trimmedHost);
      if (didStartWaiting) {
        setIsEditingUsername(false);
      }
    } catch {
      // Username errors are surfaced in the UI.
    }
  }

  return (
    <section className="lobby-page">
      <div className="lobby-card">
        <p className="lobby-eyebrow">Lobby</p>
        <h2>게임 시작 대기 중</h2>
        <p className="lobby-copy">
          먼저 서버에 입장한 뒤 사용자 이름을 정하고 게임 시작 시각까지 대기합니다. 시작 시각이 되면 자동으로 플레이 화면으로 이동합니다.
        </p>

        <div className="lobby-drawer">
          <div
            className="lobby-drawer-track"
            style={{ transform: `translateX(-${step * 50}%)` }}
          >
            <form className="lobby-step" onSubmit={handleEnterHost}>
              <p className="lobby-step-eyebrow">1 / 2</p>
              <h3>서버 입장</h3>
              <p className="lobby-step-copy">
                접속할 게임 서버 호스트를 입력한 뒤 다음 단계로 이동합니다.
              </p>

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
                autoFocus
              />
              {hostErrorMessage && (
                <p className="lobby-error">{hostErrorMessage}</p>
              )}
              <button
                className="lobby-step-submit lobby-step-submit-secondary"
                type="submit"
                disabled={!host.trim()}
              >
                입장
              </button>
            </form>

            <form className="lobby-step" onSubmit={handleSubmit}>
              <p className="lobby-step-eyebrow">2 / 2</p>
              <h3>참가 대기</h3>
              <p className="lobby-step-copy">
                사용할 사용자명을 입력하고 참가 대기를 시작합니다.
              </p>

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
                  autoFocus={step === 1}
                  readOnly={hasSubmittedUsername}
                />
                {usernameErrorMessage && (
                  <p className="lobby-error">{usernameErrorMessage}</p>
                )}
              </div>

              <div className="lobby-step-actions">
                <button
                  className="lobby-step-back"
                  type="button"
                  onClick={() => setStep(0)}
                >
                  이전
                </button>
                <input
                  className="lobby-submit"
                  type="submit"
                  value={hasSubmittedUsername ? '대기 정보 갱신' : '참가 대기'}
                  disabled={!username.trim() || !host.trim()}
                />
              </div>
            </form>
          </div>
        </div>

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

import React, { useEffect, useRef, useState } from 'react';
import { LobbyField } from '../components/LobbyField';
import { LobbyGameStatus } from '../components/LobbyGameStatus';
import { SpinnerButton } from '../components/SpinnerButton';
import { StepCarousel } from '../components/StepCarousel';

interface Props {
  initialUsername: string;
  initialHost: string;
  onEnterHost: (host: string) => Promise<void>;
  onStartGame: (username: string, host: string) => Promise<boolean>;
  onBeginUsernameEdit: () => void;
  onLeaveHost: () => void;
  gameStartTime: number | null;
  now: number;
  isLoadingGameStartTime: boolean;
  hostErrorMessage: string;
  usernameErrorMessage: string;
}

export function LobbyPage({
  initialUsername,
  initialHost,
  onEnterHost,
  onStartGame,
  onBeginUsernameEdit,
  onLeaveHost,
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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isConnectingHost, setIsConnectingHost] = useState(false);
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
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
    setIsConnectingHost(true);
    try {
      await onEnterHost(trimmedHost);
      setStep(1);
    } catch {
      // Host connection errors are surfaced in the UI.
    } finally {
      setIsConnectingHost(false);
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
    setIsSubmittingUsername(true);
    try {
      const didStartWaiting = await onStartGame(trimmed, trimmedHost);
      if (didStartWaiting) {
        setIsEditingUsername(false);
      }
    } catch {
      // Username errors are surfaced in the UI.
    } finally {
      setIsSubmittingUsername(false);
    }
  }

  function handleBackToHostStep() {
    onLeaveHost();
    setStep(0);
  }

  return (
    <section className="lobby-page">
      <div className="lobby-card">
        <p className="lobby-eyebrow">Lobby</p>
        <h2>게임 시작 대기 중</h2>
        <p className="lobby-copy">
          먼저 서버에 입장한 뒤 사용자 이름을 정하고 게임 시작 시각까지 대기합니다. 시작 시각이 되면 자동으로 플레이 화면으로 이동합니다.
        </p>

        <StepCarousel step={step} showIndicators>
          <StepCarousel.Item eyebrow="1 / 2">
            <h3>서버 입장</h3>
            <p className="step-carousel-item-copy">접속할 게임 서버 호스트를 입력한 뒤 다음 단계로 이동합니다.</p>
            <form onSubmit={handleEnterHost}>
              <LobbyField
                id="lobby-host"
                label="서버 호스트"
                value={host}
                onChange={setHost}
                placeholder="127.0.0.1:8080 또는 game.example.com"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                errorMessage={hostErrorMessage}
              />

              <div className="lobby-step-actions">
                <SpinnerButton
                  className="lobby-step-submit lobby-step-submit-secondary"
                  type="submit"
                  disabled={!host.trim()}
                  isLoading={isConnectingHost}
                >
                  입장
                </SpinnerButton>
              </div>
            </form>
          </StepCarousel.Item>

          <StepCarousel.Item eyebrow="2 / 2">
            <h3>참가 대기</h3>
            <p className="step-carousel-item-copy">사용할 사용자명을 입력하고 참가 대기를 시작합니다.</p>
            <form onSubmit={handleSubmit}>
              <LobbyField
                id="lobby-username"
                label="사용자 명"
                value={username}
                onChange={setUsername}
                placeholder="사용자 명을 입력하세요"
                autoComplete="nickname"
                autoFocus={step === 1}
                readOnly={hasSubmittedUsername}
                errorMessage={usernameErrorMessage}
              />
              <div className="lobby-step-actions">
                <button
                  className="lobby-step-back"
                  type="button"
                  onClick={handleBackToHostStep}
                >
                  이전
                </button>
                <SpinnerButton
                  className="lobby-submit"
                  type="submit"
                  disabled={!username.trim() || !host.trim()}
                  isLoading={isSubmittingUsername}
                >
                  {hasSubmittedUsername ? '대기 정보 갱신' : '참가 대기'}
                </SpinnerButton>
              </div>
            </form>
          </StepCarousel.Item>
        </StepCarousel>
        <LobbyGameStatus
          isLoading={isLoadingGameStartTime}
          gameStartTime={gameStartTime}
          now={now}
        />
      </div>
    </section>
  );
}

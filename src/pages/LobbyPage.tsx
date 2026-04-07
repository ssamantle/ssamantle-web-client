import React, { useEffect, useRef, useState } from 'react';
import { LobbyGameStatus } from '../components/LobbyGameStatus';
import { SpinnerInputField } from '../components/SpinnerInputField';

interface Props {
  initialUsername: string;
  initialHost: string;
  onStartGame: (username: string) => Promise<boolean>;
  onBeginUsernameEdit: () => void;
  gameStartTime: number | null;
  isLoadingGameStartTime: boolean;
  usernameErrorMessage: string;
}

export function LobbyPage({
  initialUsername,
  initialHost,
  onStartGame,
  onBeginUsernameEdit,
  gameStartTime,
  isLoadingGameStartTime,
  usernameErrorMessage,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [host, setHost] = useState(initialHost);
  const previousHostRef = useRef(initialHost);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
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

  async function handleSubmit(value: string) {
    if (hasSubmittedUsername) {
      onBeginUsernameEdit();
      setIsEditingUsername(true);
      return;
    }
    const trimmed = value.trim();
    const trimmedHost = host.trim();
    if (!trimmed || !trimmedHost) return;
    setIsSubmittingUsername(true);
    try {
      const didStartWaiting = await onStartGame(trimmed);
      if (didStartWaiting) {
        setIsEditingUsername(false);
      }
    } catch {
      // Username errors are surfaced in the UI.
    } finally {
      setIsSubmittingUsername(false);
    }
  }

  return (
    <section className="lobby-page">
      <div className="lobby-card">
        <p className="lobby-eyebrow">Lobby</p>
        <h2>게임 시작 대기 중</h2>
        <p className="lobby-copy">
          사용자 이름을 입력하고 게임 시작 시각까지 대기합니다. 시작 시각이 되면 자동으로 플레이 화면으로 이동합니다.
        </p>
        <h3>참가 대기</h3>
        <p className="step-carousel-item-copy">사용할 사용자명을 입력하고 참가 대기를 시작합니다.</p>
        <SpinnerInputField
          id="lobby-username"
          label="사용자 명"
          placeholder="사용자 명을 입력하세요"
          onChange={setUsername}
          onSubmit={(value: string) => {
            void handleSubmit(value);
          }}
          buttonLabel={hasSubmittedUsername ? '대기 정보 갱신' : '참가 대기'}
          isLoading={isSubmittingUsername}
          buttonDisabled={!username.trim() || !host.trim()}
        />
        {usernameErrorMessage && <p className="lobby-error">{usernameErrorMessage}</p>}
        <LobbyGameStatus
          isLoading={isLoadingGameStartTime}
          gameStartTime={gameStartTime}
        />
      </div>
    </section>
  );
}

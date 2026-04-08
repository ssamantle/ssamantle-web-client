import React from 'react';
import { LobbyGameStatus } from '../components/LobbyGameStatus';
import { SpinnerInputField } from '../components/SpinnerInputField';
import { userService, gameService } from '../services';
import { UserSession } from '../services/UserService';

interface Props {
  currentUser: UserSession | null;
  gameStartTime: number | null;
  isLoadingGameInfo: boolean;
  onSessionChange?: (session: UserSession | null) => void;
}

interface State {
  isEditingUsername: boolean;
  isSubmittingUsername: boolean;
  usernameErrorMessage: string;
}

export class PreGamePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isEditingUsername: false,
      isSubmittingUsername: false,
      usernameErrorMessage: '',
    };
  }

  private handleSubmit = async (value: string) => {
    const { isEditingUsername } = this.state;
    const { currentUser, onSessionChange } = this.props;

    if (currentUser !== null && !isEditingUsername) {
      await userService.logout();
      this.setState({ isEditingUsername: false, usernameErrorMessage: '' });
      onSessionChange?.(null);
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) return;

    this.setState({ isSubmittingUsername: true, usernameErrorMessage: '' });
    try {
      const isAvailable = await userService.isUsernameAvailable(trimmed);
      if (!isAvailable) {
        this.setState({ usernameErrorMessage: '이미 사용 중이거나 사용할 수 없는 사용자명입니다.' });
        return;
      }
      await userService.login(trimmed);
      const session = await userService.getCurrentUser();
      if (session) {
        await gameService.setUserSession(session);
        this.setState({ isEditingUsername: false });
        onSessionChange?.(session);
      }
    } catch {
      this.setState({ usernameErrorMessage: '이미 사용 중이거나 사용할 수 없는 사용자명입니다.' });
    } finally {
      this.setState({ isSubmittingUsername: false });
    }
  };

  render() {
    const {
      isEditingUsername,
      isSubmittingUsername,
      usernameErrorMessage,
    } = this.state;
    const { currentUser, gameStartTime, isLoadingGameInfo } = this.props;

    const hasSubmittedUsername = currentUser !== null && !isEditingUsername;

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
            onSubmit={(value) => { void this.handleSubmit(value); }}
            buttonLabel={hasSubmittedUsername ? '대기 정보 갱신' : '참가 대기'}
            isLoading={isSubmittingUsername}
          />
          {usernameErrorMessage && <p className="lobby-error">{usernameErrorMessage}</p>}
          <LobbyGameStatus
            isLoading={isLoadingGameInfo}
            gameStartTime={gameStartTime}
          />
        </div>
      </section>
    );
  }
}

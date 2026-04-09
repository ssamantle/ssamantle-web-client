import React from "react";
import { SpinnerInputField } from "../components/SpinnerInputField";
import { UserService, UserSession } from "../services/UserService";
import { GameService } from "../services/GameService";
import { IntervalHandler } from "../utils/IntervalHandler";
import { Callout, CalloutContent, CalloutTitle } from "../components/Callout";
import { Timestamp } from "../components/Timestamp";

interface Props {
  gameService: GameService;
  userService: UserService;
}

interface State {
  gameStartAt: number | null;
  userSession: UserSession | null;
  isEditingUsername: boolean;
  isSubmittingUsername: boolean;
  hasSubmittedUsername: boolean;
  usernameErrorMessage: string;
}

export class PreGamePage extends React.Component<Props, State> {
  private readonly gameService: GameService;
  private readonly userService: UserService;

  private readonly intervalHandler: IntervalHandler;

  state: State = {
    gameStartAt: null,
    userSession: null,
    isEditingUsername: false,
    isSubmittingUsername: false,
    hasSubmittedUsername: false,
    usernameErrorMessage: "asfas",
  };

  constructor(props: Props) {
    super(props);
    this.gameService = props.gameService;
    this.userService = props.userService;
    this.intervalHandler = new IntervalHandler(this.handleInterval, 1000);
  }

  componentDidMount(): void {
    this.intervalHandler.start();
  }

  componentWillUnmount(): void {
    this.intervalHandler.clear();
  }

  private handleInterval = async () => {
    await this.gameService.syncGameInfo();
    if (this.state.gameStartAt !== this.gameService.getGameStartTime()) {
      this.setState({
        gameStartAt: this.gameService.getGameStartTime(),
      });
    }
  };

  private async handleSubmit(value: string) {
    let hasSubmittedUsername;
    this.setState({ isSubmittingUsername: true });
    if (this.state.userSession) {
      await this.userService.logout();
      hasSubmittedUsername = false;
    } else {
      await this.userService.login(value);
      hasSubmittedUsername = true;
    }
    this.setState({ isSubmittingUsername: false, hasSubmittedUsername });
    return;
  }

  render() {
    const {
      isEditingUsername,
      isSubmittingUsername,
      hasSubmittedUsername,
      usernameErrorMessage,
    } = this.state;

    const { gameStartAt } = this.state;

    return (
      <>
        <Callout>
          <CalloutTitle>
            게임 시작까지 -{" "}
            <Timestamp time={gameStartAt ? gameStartAt - Date.now() : null} />
          </CalloutTitle>
          <CalloutContent>안내</CalloutContent>
        </Callout>

        <SpinnerInputField
          id="lobby-username"
          label="사용자 명"
          placeholder="사용자 명을 입력하세요"
          onSubmit={this.handleSubmit}
          buttonLabel={hasSubmittedUsername ? "수정" : "확인"}
          isLoading={isSubmittingUsername}
        />

        <section className="lobby-page">
          <div className="lobby-card">
            <p className="lobby-eyebrow">Lobby</p>
            <h2>게임 시작 대기 중</h2>
            <p className="lobby-copy">
              사용자 이름을 입력하고 게임 시작 시각까지 대기합니다. 시작 시각이 되면 자동으로
              플레이 화면으로 이동합니다.
            </p>
            <h3>참가 대기</h3>
            <p className="step-carousel-item-copy">
              사용할 사용자명을 입력하고 참가 대기를 시작합니다.
            </p>
            <SpinnerInputField
              id="lobby-username"
              label="사용자 명"
              placeholder="사용자 명을 입력하세요"
              onSubmit={this.handleSubmit}
              buttonLabel={hasSubmittedUsername ? "수정" : "확인"}
              isLoading={isSubmittingUsername}
            />
            {usernameErrorMessage && (
              <p className="lobby-error">{usernameErrorMessage}</p>
            )}
          </div>
        </section>
      </>
    );
  }
}

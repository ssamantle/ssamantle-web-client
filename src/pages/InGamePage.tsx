import React from 'react';
import { GuessTable } from '../components/GuessTable';
import { InGameDashboard } from '../components/InGameDashboard';
import { LeaderboardRaceMap } from '../components/LeaderboardRaceMap';
import { SpinnerInputField } from '../components/SpinnerInputField';
import { GuessEntry, LeaderboardEntry } from '../types';
import { GameService } from '../services/GameService';
import { UserService } from '../services/UserService';
import { IntervalHandler } from '../utils/IntervalHandler';

interface Props {
  gameService: GameService;
  userService: UserService;
}

interface State {
  guesses: GuessEntry[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  username: string;
  gameEndTime: number | null;
}

export class InGamePage extends React.Component<Props, State> {
  private readonly gameService: GameService;
  private readonly userService: UserService;
  private readonly intervalHandler: IntervalHandler;

  state: State = {
    guesses: [],
    leaderboard: [],
    isLoading: false,
    username: '',
    gameEndTime: null,
  };

  constructor(props: Props) {
    super(props);
    this.gameService = props.gameService;
    this.userService = props.userService;
    this.intervalHandler = new IntervalHandler(this.handleInterval, 1000);
  }

  componentDidMount(): void {
    this.intervalHandler.start();
    void this.loadUsername();
  }

  componentWillUnmount(): void {
    this.intervalHandler.clear();
  }

  private loadUsername = async () => {
    const session = await this.userService.getCurrentUser();
    if (session) {
      this.setState({ username: session.username });
    }
  };

  private handleInterval = async () => {
    await this.gameService.syncGameInfo();
    this.syncStateFromService();
  };

  private syncStateFromService() {
    const guesses = this.gameService.getMyGuessHistory().map((guess, index) => ({
      word: guess.label,
      similarity: guess.similarity,
      rank: guess.rank,
      guessNumber: index + 1,
    }));
    const leaderboard = this.gameService.listUsers().map((user) => ({
      username: user.name,
      similarity: user.bestSimilarity,
    }));
    this.setState({
      guesses,
      leaderboard,
      gameEndTime: this.gameService.getGameEndTime(),
    });
  }

  private handleSubmitGuess = async (value: string) => {
    if (!value.trim() || this.state.isLoading) return;
    this.setState({ isLoading: true });
    await this.gameService.submitGuess(value);
    await this.gameService.syncGameInfo();
    this.syncStateFromService();
    this.setState({ isLoading: false });
  };

  render() {
    const { guesses, leaderboard, isLoading, username, gameEndTime } = this.state;
    const bestGuess = guesses[0] ?? null;
    const upperLeaderboard = leaderboard.slice(0, 3);
    const lowerLeaderboard = leaderboard.slice(3);

    return (
      <>
        <InGameDashboard
          gameEndTime={gameEndTime}
          username={username}
          bestGuess={bestGuess}
        />

        <LeaderboardRaceMap
          leaderboard={leaderboard}
          currentUsername={username}
        />

        <div id="form">
          <SpinnerInputField
            id="guess"
            placeholder="추측할 단어를 입력하세요"
            onSubmit={this.handleSubmitGuess}
            buttonLabel="추측하기"
            isLoading={isLoading}
          />
        </div>

        <GuessTable guesses={guesses} currentGuess="" />

        <div className="game-panels">
          <div className="game-panel-main"></div>
          <aside className="leaderboard-panel" aria-label="실시간 리더보드">
            {leaderboard.length > 0 ? (
              <>
                <div className="leaderboard-card">
                  <h3>실시간 리더보드</h3>
                  <ol className="leaderboard-list leaderboard-list-upper">
                    {upperLeaderboard.map((entry, index) => (
                      <li
                        className="leaderboard-row leaderboard-row-upper"
                        key={`${entry.username}-${index}`}
                      >
                        <span className="leaderboard-rank">#{index + 1}</span>
                        <span className={`leaderboard-name${index === 0 ? ' leaderboard-name-top' : ''}`}>
                          {entry.username}
                        </span>
                        <span className="leaderboard-score">
                          {entry.similarity.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                {lowerLeaderboard.length > 0 && (
                  <ol className="leaderboard-list leaderboard-list-lower" start={4}>
                    {lowerLeaderboard.map((entry, index) => (
                      <li
                        className="leaderboard-row leaderboard-row-lower"
                        key={`${entry.username}-${index + 3}`}
                      >
                        <span className="leaderboard-rank">#{index + 4}</span>
                        <span className="leaderboard-name">{entry.username}</span>
                        <span className="leaderboard-score">
                          {entry.similarity.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : (
              <div className="leaderboard-card">
                <h3>실시간 리더보드</h3>
                <p className="leaderboard-empty">아직 참여 기록이 없습니다.</p>
              </div>
            )}
          </aside>
        </div>
      </>
    );
  }
}

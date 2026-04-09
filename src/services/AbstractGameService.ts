import { UserSession } from "./UserService";
import {
  GameInfo,
  GameState,
  GameService,
  Guess,
  UserInfo,
} from "./GameService";

export abstract class AbstractGameService implements GameService {
  private gameInfo: GameInfo = {
    startAt: null,
    endAt: null,
    users: [],
  };
  private guessHistory: Guess[] = [];
  private userSession: UserSession | null = null;

  /** 서버에서 게임 정보를 가져옵니다. */
  protected abstract fetchGameInfo(): Promise<GameInfo>;

  /** 서버에서 사용자 단어 제출 기록을 가져옵니다. */
  protected abstract fetchGuessHistory(
    userSession: UserSession,
  ): Promise<Guess[]>;

  /** 서버에 단어를 제출하고 단어 정보를 가져옵니다. */
  protected abstract fetchGuess(
    userSession: UserSession,
    word: string,
  ): Promise<Guess>;

  async setUserSession(userSession: UserSession): Promise<void> {
    this.userSession = userSession;
    this.guessHistory = await this.fetchGuessHistory(userSession);
  }

  async syncGameInfo(): Promise<void> {
    this.gameInfo = {
      ...this.gameInfo,
      ...(await this.fetchGameInfo()),
    };
  }

  getGameStartTime(): number | null {
    return this.gameInfo.startAt;
  }

  getGameEndTime(): number | null {
    return this.gameInfo.endAt;
  }

  getCurrentGameState(now: number = Date.now()): GameState {
    const { startAt, endAt } = this.gameInfo;
    if (startAt === null || now < startAt) {
      return GameState.PRE_GAME;
    }
    if (endAt !== null && now < endAt) {
      return GameState.IN_GAME;
    }
    return GameState.POST_GAME;
  }

  getMyGuessHistory(): Guess[] {
    return this.guessHistory;
  }

  getMyInfo(): UserInfo | null {
    if (!this.userSession) return null;
    return this.findUserByName(this.userSession.username);
  }

  getMyBestGuess(): Guess | null {
    const guesses = this.getMyGuessHistory();
    if (guesses.length === 0) return null;
    return guesses.reduce((g1, g2) => {
      return g1.similarity > g2.similarity ? g1 : g2;
    });
  }

  listUsers(): UserInfo[] {
    return this.gameInfo.users;
  }

  findUserByName(name: string): UserInfo | null {
    return this.gameInfo.users.find((u) => u.name === name) ?? null;
  }

  async submitGuess(word: string): Promise<Guess | null> {
    if (this.userSession === null) {
      throw new Error("USER_SESSION_NOT_FOUND");
    }
    return await this.fetchGuess(this.userSession, word);
  }
}

import { UserSession } from "./UserService";

export interface GameInfo {
  startAt: number | null;
  endAt: number | null;
  users: UserInfo[];
}

export interface UserInfo {
  name: string;
  bestSimilarity: number;
  rank: number;
}

export interface Guess {
  label: string;
  similarity: number;
  rank: number;
}

export type GameState = 'pre-game' | 'in-game' | 'post-game';

export const PRE_GAME: GameState = 'pre-game';
export const IN_GAME: GameState = 'in-game';
export const POST_GAME: GameState = 'post-game';

export interface GameService {
  /** 현재 사용자 세션을 변경합니다. */
  setUserSession(userSession: UserSession): Promise<void>;

  /** 게임 상태 캐시를 갱신합니다. */
  syncGameInfo(): Promise<void>;

  /** 캐시된 게임 시작 시간을 반환합니다. */
  getGameStartTime(): number | null;

  /** 캐시된 게임 종료 시간을 반환합니다. */
  getGameEndTime(): number | null;

  /** 현재 게임의 상태를 반환합니다. */
  getCurrentGameState(): GameState;

  /** 캐시된 단어 제출 기록을 반환합니다. */
  getMyGuessHistory(): Guess[];

  /** 캐시된 현재 사용자 정보를 반환합니다. */
  getMyInfo(): UserInfo | null;

  /** 캐시된 현재 사용자의 최고 제출을 반환합니다. */
  getMyBestGuess(): Guess | null;

  /** 캐시된 사용자 목록을 반환합니다. */
  listUsers(): UserInfo[];

  /** 캐시된 사용자 목록에서 특정 사용자 정보를 반환합니다. 발견되지 않는다면 null을 반환합니다. */
  findUserByName(name: string): UserInfo | null;

  /** 단어를 제출하고 유사도와 순위를 받아옵니다. */
  submitGuess(word: string): Promise<Guess | null>;
}

import { GuessApiResponse, User } from '../types';

/**
 * 게임 서버와의 통신을 추상화한 서비스 인터페이스.
 * 구현체를 교체하는 것으로 목업↔실서버를 전환할 수 있습니다.
 */
export abstract class GameService {
  constructor(
    protected user: User,
    protected host: string,
  ) {}

  abstract setUsername(username: string): void;
  abstract setHost(host: string): void;
  abstract getGameStartTime(): Promise<number | null>;
  abstract getGameEndTime(): Promise<number | null>;

  /** 단어를 추측하고 유사도·순위 결과를 가져옵니다. */
  abstract submitGuess(word: string): Promise<GuessApiResponse | null>;
}

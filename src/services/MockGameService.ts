import { GameInfo, UserInfo, Guess, GameState, IN_GAME, POST_GAME, PRE_GAME } from './GameService';
import { AbstractGameService } from './AbstractGameService';
import { UserSession } from './UserService';

const MOCK_ANSWER = '사과';
const MOCK_PRE_GAME_DURATION_MS = 1.5 * 60 * 1000;
const MOCK_IN_GAME_DURATION_MS = 10 * 60 * 1000;
const MOCK_FORCE_STATE = (
  null
  // PRE_GAME
  // IN_GAME
  // POST_GAME
);

/** 유사도가 미리 정해진 단어 목록 (테스트용) */
const KNOWN_WORDS: Record<string, number> = {
  과일:   0.85,
  배:     0.80,
  포도:   0.75,
  과즙:   0.78,
  빨간:   0.70,
  달콤한: 0.68,
  나무:   0.62,
  씨앗:   0.52,
  먹다:   0.45,
};

const MOCK_USERS: UserInfo[] = [
  { name: 'alpha',   bestSimilarity: 97.2, rank: 1 },
  { name: 'beta',    bestSimilarity: 93.8, rank: 2 },
  { name: 'gamma',   bestSimilarity: 88.4, rank: 3 },
  { name: 'delta',   bestSimilarity: 82.1, rank: 4 },
  { name: 'epsilon', bestSimilarity: 77.5, rank: 5 },
];

/**
 * 서버 없이 동작하는 GameService 목업 구현체.
 * 정답은 '사과'이며, 미리 정의된 단어 외에는 낮은 임의 유사도를 반환합니다.
 */
export class MockGameService extends AbstractGameService {
  private readonly guessCache: Record<string, Guess> = {};
  private readonly initiatedAt = Date.now();

  protected async fetchGameInfo(): Promise<GameInfo> {
    const startAt = this.initiatedAt + MOCK_PRE_GAME_DURATION_MS;
    const endAt = startAt + MOCK_IN_GAME_DURATION_MS;
    return { startAt, endAt, users: [...MOCK_USERS] };
  }

  protected async fetchGuessHistory(_userSession: UserSession): Promise<Guess[]> {
    return [];
  }

  protected async fetchGuess(_userSession: UserSession, word: string): Promise<Guess> {
    if (this.guessCache[word]) return this.guessCache[word];
    await new Promise(resolve => setTimeout(resolve, 500));

    let result: Guess;

    if (word === MOCK_ANSWER) {
      result = { label: word, similarity: 1.0, rank: 0 };
    } else if (word in KNOWN_WORDS) {
      const similarity = KNOWN_WORDS[word];
      result = { label: word, similarity, rank: Math.max(1, Math.round((1 - similarity) * 1000)) };
    } else {
      result = { label: word, similarity: Math.random() * 0.3, rank: -1 };
    }

    this.guessCache[word] = result;
    return result;
  }

  getCurrentGameState(now?: number): GameState {
    if (MOCK_FORCE_STATE !== null)
      return MOCK_FORCE_STATE;
    return super.getCurrentGameState(now);
  }
}

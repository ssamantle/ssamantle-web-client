import { GameService } from './GameService';
import { GuessApiResponse } from '../types';

const MOCK_ANSWER = '사과';
const MOCK_GAME_START_TIME_KEY = 'mockGameStartTime';
const MOCK_GAME_END_TIME_KEY = 'mockGameEndTime';

/** 유사도가 미리 정해진 단어 목록 (테스트용) */
const KNOWN_WORDS: Record<string, number> = {
  과일:  0.85,
  배:    0.80,
  포도:  0.75,
  과즙:  0.78,
  빨간:  0.70,
  달콤한: 0.68,
  나무:  0.62,
  씨앗:  0.52,
  먹다:  0.45,
};

/**
 * 서버 없이 동작하는 GameService 목업 구현체.
 * 정답은 '사과'이며, 미리 정의된 단어 외에는 낮은 임의 유사도를 반환합니다.
 */
export class MockGameService extends GameService {
  private readonly cache: Record<string, GuessApiResponse> = {};

  private normalizeHost(host: string) {
    return host
      .trim()
      .replace(/^[a-z]+:\/\//i, '')
      .replace(/\/.*$/, '');
  }

  setUsername(username: string) {
    this.user = {
      ...this.user,
      username,
    };
  }

  setHost(host: string) {
    this.host = this.normalizeHost(host);
  }

  async getGameStartTime(): Promise<number | null> {
    const saved = localStorage.getItem(MOCK_GAME_START_TIME_KEY);
    if (saved) return Number(saved);

    const startTime = Date.now() + 15_000;
    localStorage.setItem(MOCK_GAME_START_TIME_KEY, String(startTime));
    return startTime;
  }

  async getGameEndTime(): Promise<number | null> {
    const saved = localStorage.getItem(MOCK_GAME_END_TIME_KEY);
    if (saved) return Number(saved);

    const startTime = await this.getGameStartTime();
    if (startTime === null) return null;

    const endTime = startTime + 10 * 60_000;
    localStorage.setItem(MOCK_GAME_END_TIME_KEY, String(endTime));
    return endTime;
  }

  async submitGuess(word: string): Promise<GuessApiResponse | null> {
    if (this.cache[word]) return this.cache[word];

    let result: GuessApiResponse;

    if (word === MOCK_ANSWER) {
      result = { guess: word, sim: 1.0, rank: '정답' };
    } else if (word in KNOWN_WORDS) {
      const sim = KNOWN_WORDS[word];
      const rank = Math.max(1, Math.round((1 - sim) * 1000));
      result = { guess: word, sim, rank };
    } else {
      // 알 수 없는 단어는 낮은 임의 유사도 반환
      const sim = Math.random() * 0.3;
      result = { guess: word, sim, rank: '1000위 이상' };
    }

    this.cache[word] = result;
    return result;
  }

}

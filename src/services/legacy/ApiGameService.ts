import { GameService } from './GameService';
import { GuessApiResponse } from '../../types';

/**
 * 실제 HTTP API 서버와 통신하는 GameService 구현체.
 * 서버가 준비되면 services/index.ts 에서 이 구현체로 전환합니다.
 */
export class ApiGameService extends GameService {
  private readonly cache: Record<string, GuessApiResponse> = {};

  private normalizeHost(host: string) {
    return host
      .trim()
      .replace(/^[a-z]+:\/\//i, '')
      .replace(/\/.*$/, '');
  }

  private buildUrl(path: string) {
    return this.host ? `//${this.host}${path}` : path;
  }

  private parseTimeValue(data: number | string | { time?: number | string; startTime?: number | string; endTime?: number | string }) {
    if (typeof data === 'number') return data;
    if (typeof data === 'string') {
      const parsed = Date.parse(data);
      return Number.isNaN(parsed) ? null : parsed;
    }
    const candidate = data?.time ?? data?.startTime ?? data?.endTime;
    if (typeof candidate === 'number') return candidate;
    if (typeof candidate === 'string') {
      const parsed = Date.parse(candidate);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
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
    try {
      const res = await fetch(this.buildUrl('/start-time'));
      const data: number | string | { startTime?: number | string; time?: number | string } = await res.json();
      return this.parseTimeValue(data);
    } catch {
      return null;
    }
  }

  async getGameEndTime(): Promise<number | null> {
    try {
      const res = await fetch(this.buildUrl('/end-time'));
      const data: number | string | { endTime?: number | string; time?: number | string } = await res.json();
      return this.parseTimeValue(data);
    } catch {
      return null;
    }
  }

  async submitGuess(word: string): Promise<GuessApiResponse | null> {
    if (this.cache[word]) return this.cache[word];
    try {
      const res = await fetch(this.buildUrl(`/guess/${encodeURIComponent(word)}`));
      const data: GuessApiResponse = await res.json();
      if (data.guess) this.cache[data.guess] = data;
      return data;
    } catch {
      return null;
    }
  }

}

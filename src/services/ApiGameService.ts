import { GameServiceLegacy } from './GameServiceLegacy';
import { GuessApiResponse, LeaderboardEntry } from '../types';

/**
 * 실제 HTTP API 서버와 통신하는 GameService 구현체.
 * 서버가 준비되면 services/index.ts 에서 이 구현체로 전환합니다.
 */
export class ApiGameService extends GameServiceLegacy {
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

  async setUsername(username: string): Promise<void> {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error('USERNAME_UNAVAILABLE');
    }

    const leaderboard = await this.getLeaderboard();
    const isDuplicate = leaderboard.some(entry => entry.username === trimmed && entry.username !== this.user.username);
    if (isDuplicate) {
      throw new Error('USERNAME_UNAVAILABLE');
    }

    this.user = {
      ...this.user,
      username: trimmed,
    };
  }

  clearUser() {
    this.user = {
      ...this.user,
      username: '',
    };
  }

  setHost(host: string) {
    this.host = this.normalizeHost(host);
  }

  async connectHost(host: string): Promise<void> {
    this.setHost(host);
    if (!this.host) {
      throw new Error('HOST_UNREACHABLE');
    }

    try {
      const res = await fetch(this.buildUrl('/start-time'));
      if (!res.ok) throw new Error('HOST_UNREACHABLE');
    } catch {
      throw new Error('HOST_UNREACHABLE');
    }
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

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(this.buildUrl('/leaderboard'));
      const data: LeaderboardEntry[] = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
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

import { Component } from 'react';
import { Header } from './components/Header';
import { SettingsDialog } from './components/SettingsDialog';
import { PostGamePage } from './pages/PostGamePage';
import { InGamePage } from './pages/InGamePage';
import { PreGamePage } from './pages/PreGamePage';
import { gameService, userService } from './services';
import { Guess } from './services/GameService';
import { UserSession } from './services/UserService';
import { GuessEntry, GameStats, LeaderboardEntry, Settings } from './types';
import { puzzleNumber } from './utils/puzzle';

type Page = 'lobby' | 'in-game' | 'final-results';

interface State {
  page: Page;
  session: UserSession | null;
  serviceTick: number;
  settings: Settings;
  settingsOpen: boolean;
  guesses: GuessEntry[];
  gameOver: boolean;
  stats: GameStats | null;
  currentGuess: string;
  error: string;
  isLoading: boolean;
  startTime: number | null;
  endTime: number | null;
}

export default class App extends Component<{}, State> {
  // Game tracking (equivalent to useRef — not reactive, no re-render on change)
  private guessedWords = new Set<string>();
  private guessCount = 0;
  private guessesCache: GuessEntry[] = [];
  private gameOverFlag = false;
  private endTimeCache: number | null = null;
  private syncIntervalId: number | null = null;

  state: State = {
    page: 'lobby',
    session: null,
    serviceTick: 0,
    settings: { darkMode: localStorage.getItem('darkMode') === 'true' },
    settingsOpen: false,
    guesses: [],
    gameOver: false,
    stats: null,
    currentGuess: '',
    error: '',
    isLoading: false,
    startTime: null,
    endTime: null,
  };

  componentDidMount() {
    if (localStorage.getItem('darkMode') === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        this.setState(prev => ({ settings: { ...prev.settings, darkMode: true } }));
      }
    }
    document.body.classList.toggle('dark', this.state.settings.darkMode);

    this.initGame();
    void this.bootstrapSession();

    // gameService 자체 polling으로 서버 동기화, 1초 interval로 UI 반영
    gameService.startPollingGameInfo();
    this.syncIntervalId = window.setInterval(() => { this.syncFromService(); }, 1_000);
  }

  componentDidUpdate(_prevProps: {}, prevState: State) {
    if (prevState.settings.darkMode !== this.state.settings.darkMode) {
      document.body.classList.toggle('dark', this.state.settings.darkMode);
    }
  }

  componentWillUnmount() {
    gameService.stopPollingGameInfo();
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // gameService 캐시에서 리더보드·페이지 전환 상태를 UI에 반영
  private syncFromService() {
    const { page, session } = this.state;
    const username = session?.username ?? '';
    let nextPage = page;

    if (username) {
      const startAt = gameService.getGameStartTime();
      const endAt = gameService.getGameEndTime();
      const now = Date.now();
      if (endAt !== null && now >= endAt && page !== 'final-results') {
        nextPage = 'final-results';
      } else if (startAt !== null && now >= startAt && page === 'lobby') {
        nextPage = 'in-game';
      }
    }

    this.setState(prev => ({
      page: nextPage,
      serviceTick: prev.serviceTick + 1,
    }));
  }

  // ── Game logic ───────────────────────────────────────────────────────────

  private async bootstrapSession() {
    const session = await userService.getCurrentUser();
    if (!session) return;

    await gameService.setUserSession(session);
    this.setState({ session });
  }

  private initGame() {
    if (localStorage.getItem('puzzleNumber') !== String(puzzleNumber)) {
      localStorage.removeItem('guesses');
      localStorage.removeItem('winState');
      localStorage.removeItem('startTime');
      localStorage.removeItem('endTime');
      localStorage.setItem('puzzleNumber', String(puzzleNumber));
    }

    const updates: Partial<State> = {};

    const savedStart = localStorage.getItem('startTime');
    const savedEnd = localStorage.getItem('endTime');
    if (savedStart) updates.startTime = Number(savedStart);
    if (savedEnd) {
      const t = Number(savedEnd);
      this.endTimeCache = t;
      updates.endTime = t;
    }

    const savedWinState = localStorage.getItem('winState');
    if (savedWinState !== null) {
      const saved: GuessEntry[] = JSON.parse(localStorage.getItem('guesses') ?? '[]');
      this.guessesCache = saved;
      this.guessedWords = new Set(saved.map(g => g.word));
      this.guessCount = this.guessedWords.size;
      updates.guesses = saved;
      if (savedWinState !== '-1') {
        Object.assign(updates, this.buildFinishGameUpdates(false));
      }
    }

    this.setState(updates as State);
  }

  private loadStats(): GameStats {
    const raw = localStorage.getItem('stats');
    if (!raw) {
      const stats: GameStats = {
        firstPlay: puzzleNumber,
        lastEnd: puzzleNumber - 1,
        lastPlay: puzzleNumber,
        winStreak: 0,
        playStreak: 0,
        totalGuesses: 0,
        wins: 0,
        abandons: 0,
        totalPlays: 0,
      };
      localStorage.setItem('stats', JSON.stringify(stats));
      return stats;
    }
    const stats: GameStats = JSON.parse(raw);
    if (stats.lastPlay !== puzzleNumber) {
      if (stats.lastPlay === puzzleNumber - 1) stats.playStreak += 1;
      stats.totalPlays += 1;
      if (stats.lastEnd !== puzzleNumber - 1) stats.abandons += 1;
      stats.lastPlay = puzzleNumber;
    }
    return stats;
  }

  private saveGame(winStateVal: number) {
    if (localStorage.getItem('puzzleNumber') !== String(puzzleNumber)) return;
    localStorage.setItem('winState', String(winStateVal));
    localStorage.setItem('guesses', JSON.stringify(this.guessesCache));
  }

  private buildFinishGameUpdates(countStats: boolean): Partial<State> {
    const updates: Partial<State> = {};

    if (this.endTimeCache === null) {
      const now = Date.now();
      this.endTimeCache = now;
      localStorage.setItem('endTime', String(now));
      updates.endTime = now;
    }

    const s = this.loadStats();
    if (countStats) {
      const onStreak = s.lastEnd === puzzleNumber - 1;
      s.lastEnd = puzzleNumber;
      s.winStreak = onStreak ? s.winStreak + 1 : 1;
      s.wins += 1;
      localStorage.setItem('stats', JSON.stringify(s));
      this.saveGame(1);
    }

    this.gameOverFlag = true;
    return { ...updates, stats: s, gameOver: true };
  }

  submitGuess = async (input: string) => {
    this.setState({ error: '' });
    const cleaned = input.trim().replace(/[!*/]/g, '');
    if (!cleaned) return;

    this.setState({ isLoading: true });
    let data: Guess | null;
    try {
      data = await gameService.submitGuess(cleaned);
    } catch {
      this.setState({ error: '서버가 응답하지 않습니다. 나중에 다시 시도해보세요.', isLoading: false });
      return;
    }
    this.setState({ isLoading: false });

    if (!data) {
      this.setState({ error: `${cleaned}은(는) 알 수 없는 단어입니다.` });
      return;
    }

    const word = data.label;
    const similarity = data.similarity * 100;

    this.setState({ currentGuess: word });

    if (!this.guessedWords.has(word)) {
      if (this.guessCount === 0) {
        const now = Date.now();
        localStorage.setItem('startTime', String(now));
        this.setState({ startTime: now });
      }
      this.guessCount += 1;
      this.guessedWords.add(word);

      const entry: GuessEntry = { similarity, word, rank: data.rank, guessNumber: this.guessCount };
      const newGuesses = [...this.guessesCache, entry].sort((a, b) => b.similarity - a.similarity);
      this.guessesCache = newGuesses;
      this.setState({ guesses: newGuesses });

      if (!this.gameOverFlag) {
        const s = this.loadStats();
        s.totalGuesses += 1;
        localStorage.setItem('stats', JSON.stringify(s));
      }
    }

    if (!this.gameOverFlag) this.saveGame(-1);
    if (data.similarity === 1 && !this.gameOverFlag) {
      this.setState(this.buildFinishGameUpdates(true) as State);
    }
  };

  // ── Settings logic (useSettings 훅 인라인) ───────────────────────────────

  private updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    localStorage.setItem(key, String(value));
    this.setState(prev => ({ settings: { ...prev.settings, [key]: value } }));
  };

  // ── Session ──────────────────────────────────────────────────────────────

  private handleSessionChange = (session: UserSession | null) => {
    if (session === null) {
      this.setState({ session: null, page: 'lobby' });
    } else {
      this.setState({ session });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const {
      page, session,
      settings, settingsOpen,
      guesses, gameOver, stats, currentGuess, error, isLoading, startTime, endTime,
    } = this.state;
    const username = session?.username ?? '';
    const leaderboard: LeaderboardEntry[] = gameService.listUsers().map(u => ({
      username: u.name,
      similarity: u.bestSimilarity,
    }));
    const gameStartTime = gameService.getGameStartTime();
    const gameEndTime = gameService.getGameEndTime();

    return (
      <div className="container">
        <Header onSettingsClick={() => this.setState({ settingsOpen: true })} />
        <SettingsDialog
          open={settingsOpen}
          settings={settings}
          onClose={() => this.setState({ settingsOpen: false })}
          onUpdate={this.updateSetting}
        />

        {error && <div id="error">{error}</div>}

        {page === 'lobby' && (
          <PreGamePage
            currentUser={session}
            gameStartTime={gameStartTime}
            isLoadingGameInfo={gameStartTime === null}
            onSessionChange={this.handleSessionChange}
          />
        )}

        {page === 'in-game' && (
          <InGamePage
            guesses={guesses}
            leaderboard={leaderboard}
            gameOver={gameOver}
            stats={stats}
            currentGuess={currentGuess}
            isLoading={isLoading}
            startTime={startTime}
            endTime={endTime}
            gameEndTime={gameEndTime}
            username={username}
            submitGuess={this.submitGuess}
          />
        )}

        {page === 'final-results' && (
          <PostGamePage
            username={username}
            guesses={guesses}
            leaderboard={leaderboard}
          />
        )}
      </div>
    );
  }
}

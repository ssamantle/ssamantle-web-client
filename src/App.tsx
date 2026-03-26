import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SettingsDialog } from './components/SettingsDialog';
import { useGame } from './hooks/useGame';
import { FinalResultsPage } from './pages/FinalResultsPage';
import { useSettings } from './hooks/useSettings';
import { InGamePage } from './pages/InGamePage';
import { LobbyPage } from './pages/LobbyPage';
import { gameService } from './services';
import { LeaderboardEntry } from './types';

type Page = 'lobby' | 'in-game' | 'final-results';

const USERNAME_STORAGE_KEY = 'username';
const HOST_STORAGE_KEY = 'host';

function App() {
  const [page, setPage] = useState<Page>('lobby');
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY) || '');
  const [host, setHost] = useState(() => localStorage.getItem(HOST_STORAGE_KEY) || '');
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [isLoadingGameStartTime, setIsLoadingGameStartTime] = useState(false);
  const [pageError, setPageError] = useState('');
  const [hostError, setHostError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const { settings, settingsOpen, setSettingsOpen, updateSetting } = useSettings();
  const {
    guesses,
    gameOver,
    stats,
    currentGuess,
    error,
    isLoading,
    startTime,
    endTime,
    submitGuess,
  } = useGame();

  useEffect(() => {
    if (!host) return;
    gameService.setHost(host);
  }, [host]);

  useEffect(() => {
    if (!host) {
      setPage('lobby');
      setGameStartTime(null);
      setGameEndTime(null);
      setLeaderboard([]);
      setHostError('');
      setUsernameError('');
      return;
    }

    let cancelled = false;

    async function loadGameTimes() {
      setIsLoadingGameStartTime(true);
      setPageError('');
      setHostError('');
      setUsernameError('');

      try {
        await gameService.connectHost(host);
      } catch {
        if (!cancelled) {
          setIsLoadingGameStartTime(false);
          setPage('lobby');
          setGameStartTime(null);
          setGameEndTime(null);
          setLeaderboard([]);
          setHostError('서버에 연결할 수 없습니다. 호스트 주소를 확인해주세요.');
        }
        return;
      }

      const [nextGameStartTime, nextGameEndTime] = await Promise.all([
        gameService.getGameStartTime(),
        gameService.getGameEndTime(),
      ]);
      if (cancelled) return;

      if (nextGameStartTime === null) {
        setIsLoadingGameStartTime(false);
        setPage('lobby');
        setPageError('게임 시작 시간을 불러오지 못했습니다.');
        return;
      }

      setGameStartTime(nextGameStartTime);
      setGameEndTime(nextGameEndTime);
      setNow(Date.now());

      if (!username) {
        setIsLoadingGameStartTime(false);
        setPage('lobby');
        return;
      }

      try {
        await gameService.setUsername(username);
      } catch {
        if (!cancelled) {
          setIsLoadingGameStartTime(false);
          setPage('lobby');
          setLeaderboard([]);
          setUsernameError('이미 사용 중이거나 사용할 수 없는 사용자명입니다.');
        }
        return;
      }

      setIsLoadingGameStartTime(false);
      const currentTime = Date.now();
      if (nextGameEndTime !== null && currentTime >= nextGameEndTime) {
        setPage('final-results');
      } else if (currentTime >= nextGameStartTime) {
        setPage('in-game');
      } else {
        setPage('lobby');
      }
    }

    void loadGameTimes();

    return () => {
      cancelled = true;
    };
  }, [username, host]);

  useEffect(() => {
    if ((page !== 'in-game' && page !== 'final-results') || !username || !host) return;

    let cancelled = false;

    async function loadLeaderboard() {
      const nextLeaderboard = await gameService.getLeaderboard();
      if (!cancelled) setLeaderboard(nextLeaderboard);
    }

    void loadLeaderboard();
    const intervalId = window.setInterval(() => {
      void loadLeaderboard();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [page, username, host]);

  useEffect(() => {
    if ((page !== 'lobby' && page !== 'in-game' && page !== 'final-results') || (gameStartTime === null && gameEndTime === null)) return;

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (gameEndTime !== null && currentTime >= gameEndTime) {
        setPage('final-results');
      } else if (username && gameStartTime !== null && currentTime >= gameStartTime) {
        setPage('in-game');
      } else {
        setPage('lobby');
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [page, gameStartTime, gameEndTime, username]);

  async function handleStartGame(nextUsername: string, nextHost: string) {
    return applyLobbyIdentity(nextUsername, nextHost);
  }

  function handleBeginUsernameEdit() {
    setUsernameError('');
    gameService.clearUser();
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    setUsername('');
  }

  function handleLeaveHost() {
    setPage('lobby');
    setPageError('');
    setHostError('');
    setUsernameError('');
    setGameStartTime(null);
    setGameEndTime(null);
    setLeaderboard([]);
    gameService.clearUser();
    gameService.setHost('');
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(HOST_STORAGE_KEY);
    setUsername('');
    setHost('');
  }

  async function handleEnterHost(nextHost: string) {
    const normalizedHost = nextHost.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
    setHostError('');
    setUsernameError('');
    gameService.setHost(nextHost);

    try {
      await gameService.connectHost(nextHost);
    } catch {
      setHostError('서버에 연결할 수 없습니다. 호스트 주소를 확인해주세요.');
      throw new Error('HOST_UNREACHABLE');
    }

    gameService.clearUser();
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    setUsername('');
    localStorage.setItem(HOST_STORAGE_KEY, normalizedHost);
    setHost(normalizedHost);
  }

  async function applyLobbyIdentity(nextUsername: string, nextHost: string) {
    const normalizedHost = nextHost.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
    gameService.setHost(nextHost);
    setUsernameError('');

    try {
      await gameService.setUsername(nextUsername);
    } catch {
      setUsernameError('이미 사용 중이거나 사용할 수 없는 사용자명입니다.');
      return false;
    }

    localStorage.setItem(USERNAME_STORAGE_KEY, nextUsername.trim());
    localStorage.setItem(HOST_STORAGE_KEY, normalizedHost);
    setUsername(nextUsername.trim());
    setHost(normalizedHost);
    return true;
  }

  return (
    <div className="container">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onUpdate={updateSetting}
      />

      {(pageError || error) && <div id="error">{pageError || error}</div>}

      {page === 'lobby' && (
        <LobbyPage
          initialUsername={username}
          initialHost={host}
          onEnterHost={handleEnterHost}
          onStartGame={handleStartGame}
          onBeginUsernameEdit={handleBeginUsernameEdit}
          onLeaveHost={handleLeaveHost}
          gameStartTime={gameStartTime}
          now={now}
          isLoadingGameStartTime={isLoadingGameStartTime}
          hostErrorMessage={hostError}
          usernameErrorMessage={usernameError}
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
          now={now}
          submitGuess={submitGuess}
        />
      )}

      {page === 'final-results' && (
        <FinalResultsPage
          username={username}
          guesses={guesses}
          leaderboard={leaderboard}
        />
      )}
    </div>
  );
}

export default App;

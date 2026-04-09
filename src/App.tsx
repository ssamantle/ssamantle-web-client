import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SettingsDialog } from './components/SettingsDialog';
import { useGame } from './hooks/useGame';
import { useSettings } from './hooks/useSettings';
import { InGamePage } from './pages/InGamePage';
import { LobbyPage } from './pages/LobbyPage';
import { gameService } from './services/legacy';

type Page = 'lobby' | 'in-game';

const USERNAME_STORAGE_KEY = 'username';
const HOST_STORAGE_KEY = 'host';

function App() {
  const [page, setPage] = useState<Page>('lobby');
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY) || '');
  const [host, setHost] = useState(() => localStorage.getItem(HOST_STORAGE_KEY) || '');
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isLoadingGameStartTime, setIsLoadingGameStartTime] = useState(false);
  const [pageError, setPageError] = useState('');
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
    if (!username) return;
    gameService.setUsername(username);
  }, [username]);

  useEffect(() => {
    if (!host) return;
    gameService.setHost(host);
  }, [host]);

  useEffect(() => {
    if (!username || !host) {
      setPage('lobby');
      setGameStartTime(null);
      setGameEndTime(null);
      return;
    }

    let cancelled = false;

    async function loadGameTimes() {
      setIsLoadingGameStartTime(true);
      setPageError('');

      const [nextGameStartTime, nextGameEndTime] = await Promise.all([
        gameService.getGameStartTime(),
        gameService.getGameEndTime(),
      ]);
      if (cancelled) return;

      setIsLoadingGameStartTime(false);

      if (nextGameStartTime === null) {
        setPage('lobby');
        setPageError('게임 시작 시간을 불러오지 못했습니다.');
        return;
      }

      setGameStartTime(nextGameStartTime);
      setGameEndTime(nextGameEndTime);
      setNow(Date.now());
      setPage(Date.now() >= nextGameStartTime ? 'in-game' : 'lobby');
    }

    void loadGameTimes();

    return () => {
      cancelled = true;
    };
  }, [username, host]);

  useEffect(() => {
    if ((page !== 'lobby' && page !== 'in-game') || (gameStartTime === null && gameEndTime === null)) return;

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (gameStartTime !== null && currentTime >= gameStartTime) {
        setPage('in-game');
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [page, gameStartTime, gameEndTime]);

  function handleStartGame(nextUsername: string, nextHost: string) {
    gameService.setUsername(nextUsername);
    gameService.setHost(nextHost);
    localStorage.setItem(USERNAME_STORAGE_KEY, nextUsername);
    localStorage.setItem(HOST_STORAGE_KEY, nextHost.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, ''));
    setUsername(nextUsername);
    setHost(nextHost.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, ''));
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
          onStartGame={handleStartGame}
          gameStartTime={gameStartTime}
          now={now}
          isLoadingGameStartTime={isLoadingGameStartTime}
        />
      )}

      {page === 'in-game' && (
        <InGamePage
          guesses={guesses}
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
    </div>
  );
}

export default App;

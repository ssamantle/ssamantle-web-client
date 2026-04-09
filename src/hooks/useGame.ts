import { useState, useEffect, useRef, useCallback } from 'react';
import { GuessEntry, GameStats, GuessApiResponse } from '../types';
import { puzzleNumber } from '../utils/puzzle';
import { GameService, gameService as defaultGameService } from '../services/legacy';

function loadStats(): GameStats {
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

export function useGame(service: GameService = defaultGameService) {
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Refs so async callbacks always see up-to-date values
  const guessedRef = useRef<Set<string>>(new Set());
  const guessCountRef = useRef(0);
  const guessesRef = useRef<GuessEntry[]>([]);
  const gameOverRef = useRef(false);
  const endTimeRef = useRef<number | null>(null);

  const saveGame = useCallback((winStateVal: number) => {
    if (localStorage.getItem('puzzleNumber') !== String(puzzleNumber)) return;
    localStorage.setItem('winState', String(winStateVal));
    localStorage.setItem('guesses', JSON.stringify(guessesRef.current));
  }, []);

  const finishGame = useCallback(
    (countStats: boolean) => {
      if (endTimeRef.current === null) {
        const now = Date.now();
        endTimeRef.current = now;
        localStorage.setItem('endTime', String(now));
        setEndTime(now);
      }
      const s = loadStats();
      if (countStats) {
        const onStreak = s.lastEnd === puzzleNumber - 1;
        s.lastEnd = puzzleNumber;
        s.winStreak = onStreak ? s.winStreak + 1 : 1;
        s.wins += 1;
        localStorage.setItem('stats', JSON.stringify(s));
        saveGame(1);
      }
      setStats(s);
      setWon(true);
      setGameOver(true);
      gameOverRef.current = true;
    },
    [saveGame],
  );

  useEffect(() => {
    // Clear stale puzzle data on day change
    if (localStorage.getItem('puzzleNumber') !== String(puzzleNumber)) {
      localStorage.removeItem('guesses');
      localStorage.removeItem('winState');
      localStorage.removeItem('startTime');
      localStorage.removeItem('endTime');
      localStorage.setItem('puzzleNumber', String(puzzleNumber));
    }

    // Restore persisted timing values
    const savedStart = localStorage.getItem('startTime');
    const savedEnd = localStorage.getItem('endTime');
    if (savedStart) setStartTime(Number(savedStart));
    if (savedEnd) {
      const t = Number(savedEnd);
      endTimeRef.current = t;
      setEndTime(t);
    }

    // Restore saved game state
    const savedWinState = localStorage.getItem('winState');
    if (savedWinState !== null) {
      const saved: GuessEntry[] = JSON.parse(localStorage.getItem('guesses') || '[]');
      guessesRef.current = saved;
      guessedRef.current = new Set(saved.map(g => g.word));
      guessCountRef.current = guessedRef.current.size;
      setGuesses(saved);
      if (savedWinState !== '-1') {
        finishGame(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitGuess = useCallback(
    async (input: string) => {
      setError('');
      const cleaned = input.trim().replace(/[!*/]/g, '');
      if (!cleaned) return;

      setIsLoading(true);
      let data: GuessApiResponse | null;
      try {
        data = await service.submitGuess(cleaned);
      } catch {
        setError('서버가 응답하지 않습니다. 나중에 다시 시도해보세요.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);

      if (!data || data.error === 'unknown') {
        setError(`${cleaned}은(는) 알 수 없는 단어입니다.`);
        return;
      }

      const word = data.guess;
      const similarity = data.sim * 100;

      setCurrentGuess(word);

      if (!guessedRef.current.has(word)) {
        if (guessCountRef.current === 0) {
          const now = Date.now();
          localStorage.setItem('startTime', String(now));
          setStartTime(now);
        }
        guessCountRef.current += 1;
        guessedRef.current.add(word);

        const entry: GuessEntry = { similarity, word, rank: data.rank, guessNumber: guessCountRef.current };
        const newGuesses = [...guessesRef.current, entry].sort((a, b) => b.similarity - a.similarity);
        guessesRef.current = newGuesses;
        setGuesses(newGuesses);

        if (!gameOverRef.current) {
          const s = loadStats();
          s.totalGuesses += 1;
          localStorage.setItem('stats', JSON.stringify(s));
        }
      }

      if (!gameOverRef.current) saveGame(-1);
      if (data.sim === 1 && !gameOverRef.current) finishGame(true);
    },
    [service, finishGame, saveGame],
  );

  return {
    guesses,
    gameOver,
    won,
    stats,
    currentGuess,
    error,
    isLoading,
    startTime,
    endTime,
    submitGuess,
  };
}

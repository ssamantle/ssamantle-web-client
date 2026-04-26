import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGameState } from "../services/gameService";
import type { GameState } from "../types/game";

interface UseGamePollingResult {
  gameState: GameState | null;
  isLoading: boolean;
  lastSyncedAt: Date | null;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGamePolling(intervalMs = 3000): UseGamePollingResult {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const aliveRef = useRef(true);
  const fetchingRef = useRef(false);
  const queuedRefetchRef = useRef(false);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) {
      queuedRefetchRef.current = true;
      return;
    }

    fetchingRef.current = true;

    try {
      const next = await fetchGameState();
      if (!aliveRef.current) return;
      setGameState(next);
      setLastSyncedAt(new Date());
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(e instanceof Error ? e : new Error("Failed to fetch game info"));
    } finally {
      if (aliveRef.current) setIsLoading(false);
      fetchingRef.current = false;

      if (aliveRef.current && queuedRefetchRef.current) {
        queuedRefetchRef.current = false;
        void refetch();
      }
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    void refetch();

    const id = window.setInterval(() => {
      void refetch();
    }, intervalMs);

    return () => {
      aliveRef.current = false;
      queuedRefetchRef.current = false;
      window.clearInterval(id);
    };
  }, [intervalMs, refetch]);

  return { gameState, isLoading, error, lastSyncedAt, refetch };
}

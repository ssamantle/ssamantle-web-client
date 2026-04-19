import { useEffect, useMemo, useState } from 'react';

/**
 * 남은 시간을 1초마다 로컬에서 갱신합니다.
 */
export function useGameClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => new Date(now), [now]);
}

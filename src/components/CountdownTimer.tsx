import React, { useEffect, useState } from 'react';

interface Props {
  label: string;
  targetTime: number;
  completedMessage?: string;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function CountdownTimer({
  label,
  targetTime,
  completedMessage,
}: Props) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const isCompleted = currentTime >= targetTime;

  useEffect(() => {
    setCurrentTime(Date.now());

    if (isCompleted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isCompleted, targetTime]);

  const valueText = isCompleted && completedMessage
    ? completedMessage
    : formatCountdown(targetTime - currentTime);

  return (
    <div className="countdown-timer">
      <span className="countdown-timer-label">{label}</span>
      <strong className="countdown-timer-value">{valueText}</strong>
    </div>
  );
}

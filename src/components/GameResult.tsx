import React from 'react';
import { GuessEntry, GameStats } from '../types';
import { puzzleNumber, solveStory } from '../utils/puzzle';

interface Props {
  guessCount: number;
  stats: GameStats;
  storedGuesses: GuessEntry[];
  startTime: number | null;
  endTime: number | null;
}

export function GameResult({ guessCount, stats, storedGuesses, startTime, endTime }: Props) {
  async function handleShare() {
    const text = solveStory(storedGuesses, puzzleNumber, startTime, endTime);
    try {
      await navigator.clipboard.writeText(text);
      alert('클립보드로 복사했습니다.');
    } catch {
      alert('클립보드에 복사할 수 없습니다.');
    }
  }

  const totalGames = stats.wins + stats.abandons;

  return (
    <div id="response" className="gaveup">
      <p>
        <b>정답 단어를 맞혔습니다. {guessCount}번째 추측만에 정답을 맞혔네요!</b>
        <br />
        정답 단어와 비슷한,{' '}
        <a href={`/nearest1k/${puzzleNumber}`}>상위 1,000개의 단어</a>를 확인해보세요.
      </p>
      <input
        type="button"
        value="기록 복사하기"
        id="result"
        onClick={handleShare}
        className="button"
      />
      <br />
      <br />
      {puzzleNumber + 1}번째 꼬맨틀은 오늘 밤 자정(한국 시간 기준)에 열립니다.
      <br />
      <br />
      <b>나의 플레이 기록</b>:
      <br />
      <table>
        <tbody>
          <tr>
            <th>가장 처음 풀었던 꼬맨틀 번호:</th>
            <td>{stats.firstPlay}</td>
          </tr>
          <tr>
            <th>도전한 게임 횟수:</th>
            <td>{totalGames}</td>
          </tr>
          <tr>
            <th>정답 횟수:</th>
            <td>{stats.wins}</td>
          </tr>
          <tr>
            <th>연속 정답 횟수:</th>
            <td>{stats.winStreak}</td>
          </tr>
          <tr>
            <th>지금까지 추측 단어 총 갯수:</th>
            <td>{stats.totalGuesses}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

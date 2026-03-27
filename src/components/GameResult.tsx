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
      </p>
      <br />
      <input
        type="button"
        value="기록 복사하기"
        id="result"
        onClick={handleShare}
        className="button"
      />
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

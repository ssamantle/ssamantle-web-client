import { GuessEntry, Rank } from '../types';

const NUM_PUZZLES = 4650;
const INITIAL_DATE = new Date('2022-04-01T00:00:00+09:00');

export const puzzleNumber =
  Math.floor((Date.now() - INITIAL_DATE.getTime()) / 86400000) % NUM_PUZZLES;

export function solveStory(
  guesses: GuessEntry[],
  pNumber: number,
  startTime: number | null,
  endTime: number | null,
): string {
  const guessCount = guesses.length;

  if (guessCount === 1) {
    return `이럴 수가! 첫번째 추측에서 ${pNumber}번째 꼬맨틀 정답 단어를 맞혔습니다!\nhttps://semantle-ko.newsjel.ly/`;
  }

  function describe(similarity: number, percentile: Rank) {
    let out = similarity.toFixed(2);
    if (percentile !== '1000위 이상') out += ` (순위 ${percentile})`;
    return out;
  }

  const time = endTime && startTime ? endTime - startTime : 0;
  let timeInfo = `소요 시간: ${new Date(time).toISOString().substr(11, 8).replace(':', '시간').replace(':', '분')}초\n`;
  if (time > 24 * 3600000) timeInfo = '소요 시간: 24시간 이상\n';

  let topGuessMsg = '';
  if (guesses.length >= 2) {
    const topGuess = [...guesses].sort((a, b) => b.similarity - a.similarity)[1];
    if (topGuess) {
      topGuessMsg = `최대 유사도: ${describe(topGuess.similarity, topGuess.rank)}\n`;
    }
  }

  return `${pNumber}번째 꼬맨틀을 풀었습니다!\n추측 횟수: ${guessCount}\n${timeInfo}${topGuessMsg}https://semantle-ko.newsjel.ly/`;
}

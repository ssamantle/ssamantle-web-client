import React, { useState } from 'react';
import { GuessEntry, Rank } from '../types';

type SortOrder = 'similarity' | 'chrono-asc' | 'chrono-desc' | 'alpha';

interface RowProps {
  entry: GuessEntry;
  isCurrentGuess: boolean;
}

function GuessRow({ entry, isCurrentGuess }: RowProps) {
  const { similarity, word, rank: percentile, guessNumber } = entry;

  function renderRank(rank: Rank) {
    if (typeof rank === 'number') {
      return (
        <>
          <span className="percentile">{rank}</span>&nbsp;
          <span className="progress-container">
            <span
              className="progress-bar"
              style={{ width: `${(1001 - rank) / 10}%` }}
            >
              &nbsp;
            </span>
          </span>
        </>
      );
    }
    return <>{rank}</>;
  }

  const isClose = typeof percentile === 'number';

  return (
    <tr>
      <td>{guessNumber}</td>
      <td style={isCurrentGuess ? { color: '#f7617a', fontWeight: 600 } : undefined}>
        {word}
      </td>
      <td>{similarity.toFixed(2)}</td>
      <td className={isClose ? 'close' : ''}>{renderRank(percentile)}</td>
    </tr>
  );
}

interface Props {
  guesses: GuessEntry[];
  currentGuess: string;
}

export function GuessTable({ guesses, currentGuess }: Props) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('similarity');

  const sorted = [...guesses];
  if (sortOrder === 'chrono-asc') {
    sorted.sort((a, b) => a.guessNumber - b.guessNumber);
  } else if (sortOrder === 'chrono-desc') {
    sorted.sort((a, b) => b.guessNumber - a.guessNumber);
  } else if (sortOrder === 'alpha') {
    sorted.sort((a, b) => a.word.localeCompare(b.word));
  } else {
    sorted.sort((a, b) => b.similarity - a.similarity);
  }

  function handleChronoClick() {
    setSortOrder(prev => (prev === 'chrono-asc' ? 'chrono-desc' : 'chrono-asc'));
  }

  const currentEntry = currentGuess ? sorted.find(e => e.word === currentGuess) : undefined;
  const otherEntries = currentGuess ? sorted.filter(e => e.word !== currentGuess) : sorted;

  if (guesses.length === 0) return null;

  return (
    <table id="guesses">
      <tbody>
        <tr>
          <th id="chronoOrder" onClick={handleChronoClick}>#</th>
          <th id="alphaOrder" onClick={() => setSortOrder('alpha')}>추측한 단어</th>
          <th id="similarityOrder" onClick={() => setSortOrder('similarity')}>유사도</th>
          <th>유사도 순위</th>
        </tr>
        {currentEntry && (
          <GuessRow
            key={currentEntry.word + '-current'}
            entry={currentEntry}
            isCurrentGuess
          />
        )}
        {currentEntry && (
          <tr>
            <td colSpan={4}>
              <hr />
            </td>
          </tr>
        )}
        {otherEntries.map(entry => (
          <GuessRow
            key={entry.word}
            entry={entry}
            isCurrentGuess={false}
          />
        ))}
      </tbody>
    </table>
  );
}

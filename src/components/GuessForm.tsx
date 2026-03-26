import React, { useState, useRef } from 'react';

interface Props {
  onSubmit: (guess: string) => Promise<void>;
  gameOver: boolean;
  isLoading: boolean;
}

export function GuessForm({ onSubmit, gameOver, isLoading }: Props) {
  const [input, setInput] = useState('');
  const dummyRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const value = input;
    setInput('');
    // iOS keyboard buffer fix
    dummyRef.current?.focus();
    inputRef.current?.focus();
    try {
      await onSubmit(value);
    } finally {
      if (!gameOver) focusInput();
    }
  }

  return (
    <form id="form" autoCorrect="off" autoCapitalize="none" autoComplete="off" onSubmit={handleSubmit}>
      <div id="guess-wrapper">
        <input
          ref={dummyRef}
          type="text"
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          placeholder="추측할 단어를 입력하세요"
          autoCorrect="off"
          autoCapitalize="none"
          autoComplete="off"
          type="text"
          id="guess"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={gameOver}
          readOnly={isLoading}
          aria-disabled={gameOver || isLoading}
          autoFocus
        />
        <input
          type="submit"
          value="추측하기"
          id="guess-btn"
          className="button"
          onMouseDown={e => e.preventDefault()}
          disabled={gameOver || isLoading}
        />
      </div>

    </form>
  );
}

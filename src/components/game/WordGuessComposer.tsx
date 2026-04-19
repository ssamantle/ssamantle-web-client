import { useEffect, useRef, useState } from "react";
import { submitGuess } from "../../api/games";
import { GamePhaseEnum, type GamePhase, type GuessResult } from "../../types/game";
import { validateGuessWord } from "../../utils/inputValidation";

interface WordGuessComposerProps {
  username: string;
  sessionId: string;
  phase: GamePhase;
  onSubmitted: (result: GuessResult) => Promise<void>;
}

const SUBMIT_COOLDOWN_MS = 700;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "단어 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

export function WordGuessComposer({
  username,
  sessionId,
  phase,
  onSubmitted,
}: WordGuessComposerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);
  const lastSubmittedWordRef = useRef("");
  const lastSubmittedAtRef = useRef(0);
  const [word, setWord] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isInGame = phase === GamePhaseEnum.IN_GAME;
  const isDisabled = !isInGame || isSubmitting;

  useEffect(() => {
    if (!shouldRestoreFocusRef.current || isDisabled) return;

    inputRef.current?.focus();
    shouldRestoreFocusRef.current = false;
  }, [isDisabled]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isInGame) {
      setError("게임 진행 중에만 단어를 제출할 수 있습니다.");
      return;
    }

    const validation = validateGuessWord(word);
    if (!validation.isValid) {
      setError(validation.error ?? "추측할 단어를 확인해 주세요.");
      return;
    }

    const now = Date.now();
    if (now - lastSubmittedAtRef.current < SUBMIT_COOLDOWN_MS) {
      setError("너무 빠르게 제출하고 있습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (lastSubmittedWordRef.current === validation.value) {
      setError("이미 제출한 단어예요. 다른 단어를 시도해 보세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const nextResult = await submitGuess(sessionId, username, validation.value);
      lastSubmittedWordRef.current = validation.value;
      lastSubmittedAtRef.current = Date.now();
      setWord("");
      shouldRestoreFocusRef.current = true;
      await onSubmitted(nextResult);
    } catch (submitError) {
      setError(toErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-[3px] border border-[#d7e0ea] bg-white p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#202938]">단어 추측</h2>
          <p className="text-sm text-[#5b7380]">
            가장 비슷한 단어를 입력해 순위를 올려 보세요.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              ref={inputRef}
              value={word}
              onChange={(event) => {
                setWord(event.target.value);
                if (error) setError("");
              }}
              placeholder="추측할 단어를 입력하세요"
              disabled={isDisabled}
              className="min-w-0 flex-1 rounded-full border border-[#c7d3df] bg-[#f8fbfe] px-5 py-3 text-sm text-[#202938] outline-none transition placeholder:text-[#8aa0ab] focus:border-[#11a4d3] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={isDisabled}
              className="rounded-full bg-[#11a4d3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0e93bd] disabled:cursor-not-allowed disabled:bg-[#8ccfe3]"
            >
              {isSubmitting ? "제출 중..." : "추측하기"}
            </button>
          </div>

          {error ? (
            <p className="rounded-[3px] border border-[#efc4c4] bg-[#fff4f4] px-3 py-2 text-sm text-[#9a4545]">
              {error}
            </p>
          ) : null}

          {!isInGame ? (
            <p className="text-xs text-[#6c8491]">
              게임이 진행 중일 때만 단어를 제출할 수 있습니다.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

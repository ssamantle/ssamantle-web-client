import { useState } from "react";

interface LoginPageProps {
  onLogin: (username: string) => Promise<void>;
}

const MIN_LENGTH = 2;
const MAX_LENGTH = 20;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "게임 참가에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = username.trim();

    if (trimmed.length < MIN_LENGTH) {
      setError(`사용자명은 ${MIN_LENGTH}자 이상이어야 합니다.`);
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setError(`사용자명은 ${MAX_LENGTH}자 이하여야 합니다.`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onLogin(trimmed);
    } catch (submitError) {
      setError(toErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[960px] items-center px-4 py-8 md:px-6">
      <section className="w-full rounded-[3px] border border-[#d7e0ea] bg-white px-6 py-7 shadow-[0_18px_40px_rgba(180,191,214,0.18)] md:px-8">
        <div className="max-w-xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium tracking-[0.08em] text-[#6c8491]">
              SSAMANTLE
            </p>
            <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#202938]">
              게임에 입장하기 전에 사용자명을 입력해 주세요.
            </h1>
            <p className="text-sm leading-6 text-[#5b7380]">
              닉네임을 입력하면 게임 참가를 시도하고, 성공하면 바로 인게임
              화면으로 이동합니다.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#202938]">
                사용자명
              </span>
              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (error) setError("");
                }}
                placeholder="예: 김싸피"
                className="w-full rounded-[3px] border border-[#c7d3df] bg-[#f8fbfe] px-4 py-3 text-[#202938] outline-none transition focus:border-[#11a4d3] focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                maxLength={MAX_LENGTH}
                autoFocus
                disabled={isSubmitting}
              />
            </label>

            {error ? (
              <p className="rounded-[3px] border border-[#efc4c4] bg-[#fff4f4] px-3 py-2 text-sm text-[#9a4545]">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-[#6c8491]">
                공백 제외 {MIN_LENGTH}~{MAX_LENGTH}자
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[3px] bg-[#11a4d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e93bd] disabled:cursor-not-allowed disabled:bg-[#8ccfe3]"
              >
                {isSubmitting ? "참가 중..." : "게임 시작"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

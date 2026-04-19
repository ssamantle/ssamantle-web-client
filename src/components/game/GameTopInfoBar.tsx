import { LastSyncedAtLabel } from "./LastSyncedAtLabel";

interface GameTopInfoBarProps {
  username: string;
  lastSyncedAt: Date | null;
  onLogout: () => void;
}

export function GameTopInfoBar({
  username,
  lastSyncedAt,
  onLogout,
}: GameTopInfoBarProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-semibold tracking-[-0.01em] text-[#202938]">
        싸맨틀 :: 단어 추측 게임
      </p>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 md:justify-end">
        <LastSyncedAtLabel lastSyncedAt={lastSyncedAt} />

        <span aria-hidden="true" className="text-xs text-[#b4bfd6]">
          |
        </span>

        <span className="text-xs font-medium text-[#536273]">{username}</span>

        <span aria-hidden="true" className="text-xs text-[#b4bfd6]">
          |
        </span>

        <button
          type="button"
          onClick={onLogout}
          className="text-xs font-medium text-[#6c8491] underline-offset-2 transition hover:text-[#202938] hover:underline focus:outline-none focus-visible:underline"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
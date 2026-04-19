interface LastSyncedAtLabelProps {
  lastSyncedAt: Date | null;
}

function formatSyncedAt(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function LastSyncedAtLabel({
  lastSyncedAt,
}: LastSyncedAtLabelProps) {
  const formatted = lastSyncedAt
    ? formatSyncedAt(lastSyncedAt)
    : "동기화 대기 중";

  return (
    <div className="flex items-center gap-1 text-xs text-[#6c8491]">
      <span>마지막 동기화</span>
      <time
        dateTime={lastSyncedAt?.toISOString()}
        aria-label={`마지막 동기화 ${formatted}`}
        className="font-medium text-[#536273]"
      >
        {formatted}
      </time>
    </div>
  );
}

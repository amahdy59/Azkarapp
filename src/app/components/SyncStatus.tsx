export function SyncStatus({
  isSyncing,
  errorMessage,
  onRetry,
}: {
  isSyncing: boolean;
  errorMessage: string;
  onRetry: () => void;
}) {
  if (errorMessage) {
    return (
      <div className="sync-status sync-status-error" role="alert">
        <span className="min-w-0 flex-1">Account sync paused: {errorMessage}</span>
        <button type="button" onClick={onRetry} className="min-h-11 shrink-0 rounded-lg border border-current px-3">
          Retry
        </button>
      </div>
    );
  }

  if (!isSyncing) {
    return null;
  }

  return (
    <div className="sync-status" role="status" aria-live="polite">
      Syncing account…
    </div>
  );
}

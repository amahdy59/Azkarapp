import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function SyncStatus({
  isSyncing,
  errorMessage,
  onRetry,
  language,
}: {
  isSyncing: boolean;
  errorMessage: string;
  onRetry: () => void;
  language: AppLanguage;
}) {
  if (errorMessage) {
    return (
      <div className="sync-status sync-status-error" role="alert">
        <span className="min-w-0 flex-1">{t(language, "syncStatus.paused", { error: errorMessage })}</span>
        <button type="button" onClick={onRetry} className="min-h-11 shrink-0 rounded-lg border border-current px-3">
          {t(language, "syncStatus.retry")}
        </button>
      </div>
    );
  }

  if (!isSyncing) {
    return null;
  }

  return (
    <div className="sync-status" role="status" aria-live="polite">
      {t(language, "syncStatus.syncing")}
    </div>
  );
}

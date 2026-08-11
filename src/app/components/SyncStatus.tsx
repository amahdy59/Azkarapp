import { useEffect, useState } from "react";
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
  const [dismissedError, setDismissedError] = useState("");

  useEffect(() => {
    if (!errorMessage) setDismissedError("");
  }, [errorMessage]);

  if (errorMessage) {
    if (dismissedError === errorMessage) return null;
    return (
      <div className="sync-status sync-status-error" role="alert">
        <span className="min-w-0 flex-1">{t(language, "syncStatus.paused")}</span>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => setDismissedError(errorMessage)} className="min-h-11 rounded-lg px-3">
            {t(language, "common.dismiss")}
          </button>
          <button type="button" onClick={onRetry} className="min-h-11 rounded-lg border border-current px-3">
            {t(language, "syncStatus.retry")}
          </button>
        </div>
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

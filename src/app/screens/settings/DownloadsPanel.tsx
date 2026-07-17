import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CloudOff, Database, RotateCcw } from "../../components/icons";
import { SubHeader } from "./SettingsPrimitives";

type OfflineStatus = {
  cacheCount: number;
  serviceWorkerReady: boolean;
  usageBytes?: number;
  quotaBytes?: number;
};

function formatMegabytes(bytes?: number) {
  if (typeof bytes !== "number") {
    return "Unavailable";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsPanel({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const refreshStatus = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const [registration, cacheNames, storage] = await Promise.all([
        "serviceWorker" in navigator ? navigator.serviceWorker.getRegistration() : Promise.resolve(undefined),
        "caches" in window ? caches.keys() : Promise.resolve([]),
        navigator.storage?.estimate ? navigator.storage.estimate() : Promise.resolve({} as StorageEstimate),
      ]);

      setStatus({
        serviceWorkerReady: Boolean(registration?.active),
        cacheCount: cacheNames.length,
        usageBytes: storage.usage,
        quotaBytes: storage.quota,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not inspect offline storage.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="Offline Access" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="offline-content-title">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
              aria-hidden="true"
            >
              <CloudOff size={22} className="text-primary" />
            </span>
            <div>
              <h2 id="offline-content-title" className="text-[17px] font-semibold text-foreground">
                Core content is bundled
              </h2>
              <p className="mt-1 text-[14px] leading-[22px] text-muted-foreground">
                All azkar are included with the app. Offline reloads are available after the production service worker
                has installed and cached the app shell.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5" aria-labelledby="offline-status-title">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted"
              aria-hidden="true"
            >
              {status?.serviceWorkerReady ? (
                <CheckCircle2 size={22} className="text-primary" />
              ) : (
                <Database size={22} className="text-primary" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="offline-status-title" className="text-[17px] font-semibold text-foreground">
                Current browser status
              </h2>
              {isLoading ? (
                <p className="mt-1 text-[14px] text-muted-foreground" role="status">
                  Checking offline storage…
                </p>
              ) : status ? (
                <dl className="mt-2 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Service worker</dt>
                    <dd className="font-medium text-foreground">
                      {status.serviceWorkerReady ? "Active" : "Not active"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Origin caches</dt>
                    <dd className="font-medium text-foreground">{status.cacheCount}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Origin storage used</dt>
                    <dd className="font-medium text-foreground">{formatMegabytes(status.usageBytes)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Origin quota</dt>
                    <dd className="font-medium text-foreground">{formatMegabytes(status.quotaBytes)}</dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refreshStatus()}
            disabled={isLoading}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-semibold text-foreground disabled:opacity-60"
          >
            <RotateCcw size={18} aria-hidden="true" />
            Refresh status
          </button>

          {errorMessage && (
            <p className="mt-3 text-[14px] text-destructive" role="alert">
              {errorMessage} Reload the page and try again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

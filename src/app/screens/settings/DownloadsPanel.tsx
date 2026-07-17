import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CloudOff, Database, RotateCcw } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { SubHeader } from "./SettingsPrimitives";

type OfflineStatus = {
  cacheCount: number;
  serviceWorkerReady: boolean;
  usageBytes?: number;
  quotaBytes?: number;
};

function formatMegabytes(bytes: number | undefined, language: AppLanguage) {
  if (typeof bytes !== "number") {
    return t(language, "downloads.unavailable");
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadsPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
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
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SubHeader title={t(language, "downloads.title")} onBack={onBack} language={language} />
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
                {t(language, "downloads.bundledTitle")}
              </h2>
              <p className="mt-1 text-[14px] leading-[22px] text-muted-foreground">
                {t(language, "downloads.bundledBody")}
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
                {t(language, "downloads.statusTitle")}
              </h2>
              {isLoading ? (
                <p className="mt-1 text-[14px] text-muted-foreground" role="status">
                  {t(language, "downloads.checking")}
                </p>
              ) : status ? (
                <dl className="mt-2 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t(language, "downloads.serviceWorker")}</dt>
                    <dd className="font-medium text-foreground">
                      {status.serviceWorkerReady ? t(language, "downloads.active") : t(language, "downloads.inactive")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t(language, "downloads.caches")}</dt>
                    <dd className="font-medium text-foreground">{status.cacheCount}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t(language, "downloads.storageUsed")}</dt>
                    <dd className="font-medium text-foreground">{formatMegabytes(status.usageBytes, language)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{t(language, "downloads.quota")}</dt>
                    <dd className="font-medium text-foreground">{formatMegabytes(status.quotaBytes, language)}</dd>
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
            {t(language, "downloads.refresh")}
          </button>

          {errorMessage && (
            <p className="mt-3 text-[14px] text-destructive" role="alert">
              {errorMessage || t(language, "downloads.statusError")}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/button";
import { CloudOff, Database, Download, RotateCcw, X } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { formatNumerals } from "../../formatting";
import { reportError } from "../../../lib/observability";
import { InformationCard } from "./InformationCard";
import { SubHeader } from "./SettingsPrimitives";
import { getAzkarForMode } from "../../content/azkar";
import { loadAudioPreferences, saveAudioPreferences } from "../../audio/audioPreferences";
import { getAudioVoices } from "../../audio/audioVoices";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getDownloadedAudioSummary,
  removeDownloadedAudio,
} from "../../audio/audioOfflineCache";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "../../content/mushafOfflineCache";
import { hasDownloadSpace, isStorageQuotaError, MUSHAF_ESTIMATED_PAGE_BYTES } from "../../content/downloadStorage";

type OfflineStatus = {
  cacheCount: number;
  serviceWorkerReady: boolean;
  usageBytes?: number;
  quotaBytes?: number;
  downloadedAudioAssets: number;
  downloadedAudioBytes: number;
  downloadedMushafPages: number;
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
  const [successMessage, setSuccessMessage] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<{ completed: number; total: number } | null>(null);
  const [mushafProgress, setMushafProgress] = useState<{ completed: number; total: number } | null>(null);
  const mushafAbortRef = useRef<AbortController | null>(null);
  const audioAbortRef = useRef<AbortController | null>(null);
  const [audioPreferences, setAudioPreferences] = useState(loadAudioPreferences);
  const voices = useMemo(() => getAudioVoices(language), [language]);

  /* Persisted immediately rather than on a Save button: every other
     preference in Settings applies on change, and a lone deferred one
     reads as a bug. The id is stable, so the stored choice survives a
     renamed display label. */
  const handleVoiceChange = useCallback((voiceId: string) => {
    setAudioPreferences((previous) => {
      const next = { ...previous, duaVoiceId: voiceId };
      saveAudioPreferences(next);
      return next;
    });
  }, []);

  const audioCollections = useMemo(
    () =>
      (["morning", "evening", "before_sleep"] as const).map((category) => {
        const zikrs = getAzkarForMode(category, "core");
        return { category, zikrs, byteSize: estimateAudioDownloadBytes(zikrs, audioPreferences) };
      }),
    [audioPreferences],
  );

  const refreshStatus = useCallback(async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsLoading(true);

      const [registration, cacheNames, storage, mushafStatus] = await Promise.all([
        "serviceWorker" in navigator ? navigator.serviceWorker.getRegistration() : Promise.resolve(undefined),
        "caches" in window ? caches.keys() : Promise.resolve([]),
        navigator.storage?.estimate ? navigator.storage.estimate() : Promise.resolve({} as StorageEstimate),
        getMushafDownloadStatus(),
      ]);

      const audioSummary = getDownloadedAudioSummary();
      setStatus({
        serviceWorkerReady: Boolean(registration?.active),
        cacheCount: cacheNames.length,
        usageBytes: storage.usage,
        quotaBytes: storage.quota,
        downloadedAudioAssets: audioSummary.assetCount,
        downloadedAudioBytes: audioSummary.byteSize,
        downloadedMushafPages: mushafStatus.downloadedPages,
      });
    } catch (error) {
      reportError(error, "offline-storage-status");
      setErrorMessage(t(language, "downloads.statusError"));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void refreshStatus();
    return () => {
      mushafAbortRef.current?.abort();
      audioAbortRef.current?.abort();
    };
  }, [refreshStatus]);

  const downloadCollection = async (collection: (typeof audioCollections)[number]) => {
    const controller = new AbortController();
    audioAbortRef.current = controller;
    setErrorMessage("");
    setSuccessMessage("");
    setDownloadProgress({ completed: 0, total: collection.byteSize });
    try {
      if (!(await hasDownloadSpace(collection.byteSize))) throw new DOMException("Storage full", "QuotaExceededError");
      await downloadAudioForZikrs(collection.zikrs, audioPreferences, {
        signal: controller.signal,
        onProgress: (completed, total) => setDownloadProgress({ completed, total }),
      });
      await refreshStatus();
      setSuccessMessage(t(language, "downloads.downloadComplete"));
    } catch (error) {
      await refreshStatus();
      if (controller.signal.aborted) {
        setSuccessMessage(t(language, "downloads.downloadCancelled"));
      } else {
        reportError(error, "audio-download");
        setErrorMessage(
          t(language, isStorageQuotaError(error) ? "downloads.storageFull" : "downloads.downloadErrorDescription"),
        );
      }
    } finally {
      audioAbortRef.current = null;
      setDownloadProgress(null);
    }
  };

  const removeDownloads = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await removeDownloadedAudio();
      await refreshStatus();
      setSuccessMessage(t(language, "downloads.removeComplete"));
    } catch (error) {
      reportError(error, "audio-download-remove");
      setErrorMessage(t(language, "downloads.removeError"));
    }
  };

  const removeMushaf = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await removeDownloadedMushaf();
      await refreshStatus();
      setSuccessMessage(t(language, "downloads.mushafRemoveComplete"));
    } catch (error) {
      reportError(error, "mushaf-download-remove");
      setErrorMessage(t(language, "downloads.removeError"));
    }
  };

  const downloadCompleteMushaf = async () => {
    const controller = new AbortController();
    mushafAbortRef.current = controller;
    setErrorMessage("");
    setSuccessMessage("");
    setMushafProgress({ completed: 0, total: 604 });
    try {
      if (
        !(await hasDownloadSpace(Math.max(0, 604 - (status?.downloadedMushafPages ?? 0)) * MUSHAF_ESTIMATED_PAGE_BYTES))
      ) {
        throw new DOMException("Storage full", "QuotaExceededError");
      }
      await downloadMushaf({
        signal: controller.signal,
        onProgress: (completed, total) => setMushafProgress({ completed, total }),
      });
      await refreshStatus();
      setSuccessMessage(t(language, "downloads.mushafDownloadComplete"));
    } catch (error) {
      await refreshStatus();
      if (controller.signal.aborted) {
        setSuccessMessage(t(language, "downloads.downloadCancelled"));
      } else {
        reportError(error, "mushaf-download");
        setErrorMessage(
          t(language, isStorageQuotaError(error) ? "downloads.storageFull" : "downloads.downloadErrorDescription"),
        );
      }
    } finally {
      mushafAbortRef.current = null;
      setMushafProgress(null);
    }
  };

  const isAnyJobActive = downloadProgress !== null || mushafProgress !== null;

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "downloads.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-3">
        {/* Card 1: What works offline out of the box */}
        <InformationCard
          icon={<CloudOff size={20} aria-hidden="true" />}
          title={t(language, "downloads.bundledTitle")}
          body={t(language, "downloads.bundledBody")}
        />

        {/* Card 2: Complete Offline Mushaf */}
        <Card as="section" padding="lg" aria-labelledby="mushaf-download-title">
          <h2 id="mushaf-download-title" className="text-subtitle font-extrabold text-foreground">
            {t(language, "downloads.mushafTitle")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(language, "downloads.mushafBody")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(language, "downloads.mushafReady", {
              count: formatNumerals(status?.downloadedMushafPages ?? 0, language),
            })}
          </p>
          {(status?.downloadedMushafPages ?? 0) < 604 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t(language, "downloads.estimatedRemaining", {
                size: formatMegabytes(
                  (604 - (status?.downloadedMushafPages ?? 0)) * MUSHAF_ESTIMATED_PAGE_BYTES,
                  language,
                ),
              })}
            </p>
          )}
          <Button
            type="button"
            onClick={() => void downloadCompleteMushaf()}
            disabled={isAnyJobActive || status?.downloadedMushafPages === 604}
            className="mt-4 w-full"
          >
            <Download size={18} aria-hidden="true" />
            {t(
              language,
              status?.downloadedMushafPages === 604
                ? "downloads.mushafDownloaded"
                : (status?.downloadedMushafPages ?? 0) > 0
                  ? "downloads.resumeMushaf"
                  : "downloads.downloadMushaf",
            )}
          </Button>
          {mushafProgress && (
            <div className="mt-3">
              <progress
                className="w-full"
                max={mushafProgress.total}
                value={mushafProgress.completed}
                aria-label={t(language, "downloads.mushafProgressLabel")}
              />
              <p className="mt-1 text-center text-xs font-semibold text-muted-foreground" role="status">
                {t(language, "downloads.mushafProgressValue", {
                  completed: formatNumerals(mushafProgress.completed, language),
                  total: formatNumerals(mushafProgress.total, language),
                })}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => mushafAbortRef.current?.abort()}
                className="mt-2 w-full border-border"
              >
                <X size={18} aria-hidden="true" />
                {t(language, "downloads.cancelDownload")}
              </Button>
            </div>
          )}

          {Boolean(status?.downloadedMushafPages && status.downloadedMushafPages > 0) && mushafProgress === null && (
            <Button
              type="button"
              variant="outline"
              disabled={isAnyJobActive}
              onClick={() => void removeMushaf()}
              className="mt-3 w-full border-destructive/40 text-destructive"
            >
              {t(language, "downloads.removeDownloadedMushaf")}
            </Button>
          )}
        </Card>

        {/* Card 3: Optional Audio Downloads */}
        <Card as="section" padding="lg" aria-labelledby="audio-downloads-title">
          <h2 id="audio-downloads-title" className="text-subtitle font-extrabold text-foreground">
            {t(language, "downloads.optionalAudioDownloads")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(language, "downloads.approvedOnly")}</p>

          <label
            className="mt-3 flex min-h-11 items-center justify-between gap-3 text-label font-semibold text-foreground"
            htmlFor="audio-reciter"
          >
            <span>{t(language, "downloads.reciterLabel")}</span>
            <select
              id="audio-reciter"
              value={audioPreferences.duaVoiceId}
              onChange={(event) => handleVoiceChange(event.target.value)}
              disabled={isAnyJobActive}
              className="h-11 max-w-[60%] rounded-xl border border-border-control bg-background px-3 text-label font-bold text-foreground disabled:opacity-50"
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {language === "ar" ? voice.nameArabic : voice.nameEnglish}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-2">
            {audioCollections.map((collection) => {
              const label = t(
                language,
                collection.category === "morning"
                  ? "downloads.morningCore"
                  : collection.category === "evening"
                    ? "downloads.eveningCore"
                    : "downloads.beforeSleepCore",
              );
              return (
                <button
                  key={collection.category}
                  type="button"
                  disabled={collection.byteSize === 0 || isAnyJobActive}
                  onClick={() => void downloadCollection(collection)}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-start font-semibold text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2">
                    <Download size={18} aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {collection.byteSize > 0
                      ? formatMegabytes(collection.byteSize, language)
                      : t(language, "downloads.unavailable")}
                  </span>
                </button>
              );
            })}
          </div>

          {downloadProgress && (
            <div className="mt-3">
              <progress
                className="w-full"
                max={Math.max(1, downloadProgress.total)}
                value={downloadProgress.completed}
                aria-label={t(language, "downloads.progressLabel")}
                aria-describedby="audio-download-progress-value"
              />
              <p
                id="audio-download-progress-value"
                className="mt-1 text-center text-xs font-semibold text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {t(language, "downloads.progressValue", {
                  percent: formatNumerals(
                    Math.round((downloadProgress.completed / Math.max(1, downloadProgress.total)) * 100),
                    language,
                  ),
                })}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => audioAbortRef.current?.abort()}
                className="mt-2 w-full border-border"
              >
                <X size={18} aria-hidden="true" />
                {t(language, "downloads.cancelDownload")}
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={!status?.downloadedAudioAssets || isAnyJobActive}
            onClick={() => void removeDownloads()}
            className="mt-3 w-full border-destructive/40 text-destructive"
          >
            {t(language, "downloads.removeDownloadedAudio")}
          </Button>
        </Card>

        {/* Card 4: Technical Diagnostics in an expandable disclosure */}
        <details className="rounded-2xl border border-border/60 bg-card p-4 transition-colors">
          <summary className="flex cursor-pointer select-none items-center justify-between text-subtitle font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center gap-2">
              <Database size={18} className="text-primary" aria-hidden="true" />
              {t(language, "downloads.statusTitle")}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {status?.serviceWorkerReady ? t(language, "downloads.active") : t(language, "downloads.inactive")}
            </span>
          </summary>
          <div className="mt-3 border-t border-border/60 pt-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground" role="status">
                {t(language, "downloads.checking")}
              </p>
            ) : status ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t(language, "downloads.serviceWorker")}</dt>
                  <dd className="font-medium text-foreground">
                    {status.serviceWorkerReady ? t(language, "downloads.active") : t(language, "downloads.inactive")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t(language, "downloads.downloadedMushaf")}</dt>
                  <dd className="font-medium text-foreground">
                    {formatNumerals(status.downloadedMushafPages, language)} / {formatNumerals(604, language)}
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
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t(language, "downloads.downloadedAudio")}</dt>
                  <dd className="font-medium text-foreground">
                    {status.downloadedAudioAssets} · {formatMegabytes(status.downloadedAudioBytes, language)}
                  </dd>
                </div>
              </dl>
            ) : null}

            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshStatus()}
              disabled={isLoading || isAnyJobActive}
              className="mt-4 w-full"
            >
              <RotateCcw size={18} aria-hidden="true" />
              {t(language, "downloads.refresh")}
            </Button>
          </div>
        </details>

        {/* Global Feedback Messages */}
        {errorMessage && (
          <p className="mt-3 text-center text-sm font-semibold text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="mt-3 text-center text-label font-semibold text-primary" role="status" aria-live="polite">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}

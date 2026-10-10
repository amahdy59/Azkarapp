import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/button";
import { ChevronDown, CloudOff, Database, Download, RotateCcw } from "../../components/icons";
import { DownloadProgress } from "../../components/DownloadProgress";
import { OfflineResourceRow } from "../../components/OfflineResourceRow";
import { getScrollViewport } from "../../components/scrollViewport";
import { t } from "../../i18n";
import type { AppLanguage, Zikr } from "../../types";
import { formatNumerals } from "../../formatting";
import { reportError } from "../../../lib/observability";
import { SubHeader } from "./SettingsPrimitives";
import { applyContentReview } from "../../content/contentReview";
import { getAzkarForMode } from "../../content/azkar";
import { loadAudioPreferences } from "../../audio/audioPreferences";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getDownloadedAudioSummary,
  getAudioDownloadStatuses,
  removeAudioForZikrs,
} from "../../audio/audioOfflineCache";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "../../content/mushafOfflineCache";
import { hasDownloadSpace, isStorageQuotaError, MUSHAF_ESTIMATED_PAGE_BYTES } from "../../content/downloadStorage";
import { prepareTravelDownloads } from "../../audio/travelPreparation";

type AudioCollection = { id: string; titleKey: string; zikrs: readonly Zikr[]; byteSize: number };
type AudioStatus = { completed: number; total: number; remainingBytes: number };
type OfflineStatus = {
  cacheCount: number;
  serviceWorkerReady: boolean;
  usageBytes?: number;
  quotaBytes?: number;
  downloadedAudioAssets: number;
  downloadedAudioBytes: number;
  downloadedMushafPages: number;
  travelAudioCompleted: number;
  travelAudioTotal: number;
  travelAudioRemainingBytes: number;
  audio: AudioStatus[];
};
type Job = { id: string; completed: number; total: number; group?: number };
function formatMegabytes(bytes: number | undefined, language: AppLanguage) {
  return typeof bytes === "number"
    ? formatNumerals((bytes / 1_000_000).toFixed(1), language) + " MB"
    : t(language, "downloads.unavailable");
}

export function DownloadsPanel({ language, onBack }: { language: AppLanguage; onBack: () => void }) {
  const [collections, setCollections] = useState<AudioCollection[]>([]);
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [removing, setRemoving] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(false);
  const mountedRef = useRef(true);
  const audioPreferences = useMemo(loadAudioPreferences, []);
  // Optional Quran corpora load only when this panel is opened.
  const resourcePromise = useMemo(
    () =>
      Promise.all([import("../../content/fridayKahf"), import("../../content/baqarahSurah")]).then(
        ([{ FRIDAY_KAHF }, { BAQARAH_SURAH }]) => {
          const entries = [
            ...(["morning", "evening", "before_sleep"] as const).map((id, index) => ({
              id,
              titleKey: ["downloads.morningCore", "downloads.eveningCore", "downloads.beforeSleepCore"][index]!,
              zikrs: getAzkarForMode(id, "core"),
            })),
            { id: "kahf", titleKey: "downloads.kahf", zikrs: FRIDAY_KAHF },
            { id: "baqarah", titleKey: "downloads.baqarah", zikrs: applyContentReview([BAQARAH_SURAH]) },
          ];
          return entries.map((entry) => ({
            ...entry,
            byteSize: estimateAudioDownloadBytes(entry.zikrs, audioPreferences),
          }));
        },
      ),
    [audioPreferences],
  );

  const refreshStatus = useCallback(async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const resources = await resourcePromise;
      if (mountedRef.current) setCollections(resources);
      const [registration, cacheNames, storage, mushafStatus, audioStatus] = await Promise.all([
        "serviceWorker" in navigator ? navigator.serviceWorker.getRegistration() : undefined,
        "caches" in window ? caches.keys() : [],
        navigator.storage?.estimate?.().catch(() => ({}) as StorageEstimate) ?? {},
        getMushafDownloadStatus(),
        // The final group is the deduplicated essentials bundle; Baqarah remains opt-in.
        getAudioDownloadStatuses(
          [...resources.map((r) => r.zikrs), resources.slice(0, 4).flatMap((r) => r.zikrs)],
          audioPreferences,
        ),
      ]);
      if (!mountedRef.current) return;
      const bundle = audioStatus[resources.length]!;
      const audioSummary = getDownloadedAudioSummary();
      setCollections(resources);
      setStatus({
        serviceWorkerReady: Boolean(registration?.active),
        cacheCount: cacheNames.length,
        usageBytes: storage.usage,
        quotaBytes: storage.quota,
        downloadedAudioAssets: audioSummary.assetCount,
        downloadedAudioBytes: audioSummary.byteSize,
        downloadedMushafPages: mushafStatus.downloadedPages,
        travelAudioCompleted: bundle.completed,
        travelAudioTotal: bundle.total,
        travelAudioRemainingBytes: bundle.remainingBytes,
        audio: audioStatus.slice(0, resources.length),
      });
    } catch (error) {
      reportError(error, "offline-storage-status");
      if (mountedRef.current) setErrorMessage(t(language, "downloads.statusError"));
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [language, resourcePromise, audioPreferences]);
  useEffect(() => {
    mountedRef.current = true;
    void refreshStatus();
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [refreshStatus]);

  const runDownload = async (id: string, bytes: number, work: (controller: AbortController) => Promise<void>) => {
    if (operationRef.current || isLoading || !status) return;
    operationRef.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    setErrorMessage("");
    setSuccessMessage("");
    setJob({ id, completed: 0, total: id === "mushaf" ? 604 : bytes });
    let message = "";
    let failure = "";
    try {
      if (!(await hasDownloadSpace(bytes))) throw new DOMException("Storage full", "QuotaExceededError");
      controller.signal.throwIfAborted();
      await work(controller);
      message = t(
        language,
        id === "mushaf"
          ? "downloads.mushafDownloadComplete"
          : id === "bundle"
            ? "downloads.travelChecked"
            : "downloads.downloadComplete",
      );
    } catch (error) {
      if (controller.signal.aborted)
        message = t(
          language,
          id === "mushaf"
            ? "downloads.mushafCancelled"
            : id === "bundle"
              ? "downloads.travelCancelled"
              : "downloads.downloadCancelled",
        );
      else {
        reportError(error, "offline-download");
        failure =
          error instanceof Error && error.message.startsWith("bundle-partial:")
            ? t(language, "downloads.travelPartial") + " " + error.message.slice("bundle-partial:".length)
            : t(language, isStorageQuotaError(error) ? "downloads.storageFull" : "downloads.downloadErrorDescription");
      }
    } finally {
      if (mountedRef.current) {
        await refreshStatus();
        if (mountedRef.current) {
          setJob(null);
          setSuccessMessage(message);
          if (failure) setErrorMessage(failure);
        }
      }
      controllerRef.current = null;
      operationRef.current = false;
    }
  };
  const updateProgress = (id: string) => (completed: number, total: number) => {
    if (mountedRef.current) setJob({ id, completed, total });
  };
  const mushafBytes = Math.max(0, 604 - (status?.downloadedMushafPages ?? 0)) * MUSHAF_ESTIMATED_PAGE_BYTES;
  const prepareTravel = () =>
    void runDownload("bundle", mushafBytes + (status?.travelAudioRemainingBytes ?? 0), async (controller) => {
      const result = await prepareTravelDownloads(
        collections.slice(0, 4).map((r) => r.zikrs),
        audioPreferences,
        {
          signal: controller.signal,
          onProgress: () => undefined,
          onJobProgress: (group, completed, total) => {
            if (mountedRef.current) setJob({ id: "bundle", group, completed, total });
          },
        },
      );
      if (result.failures > 0)
        throw new Error(
          "bundle-partial:" +
            result.failedJobs
              .map((index) => t(language, index === 0 ? "downloads.mushafTitle" : collections[index - 1]!.titleKey))
              .join("، "),
        );
    });
  const removeResource = async (id: string, collection?: AudioCollection) => {
    if (operationRef.current || isLoading) return;
    operationRef.current = true;
    setRemoving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (id === "mushaf") await removeDownloadedMushaf();
      else if (collection) await removeAudioForZikrs(collection.zikrs, audioPreferences);
      await refreshStatus();
      if (mountedRef.current)
        setSuccessMessage(t(language, id === "mushaf" ? "downloads.mushafRemoveComplete" : "downloads.removeComplete"));
    } catch (error) {
      reportError(error, "offline-download-remove");
      if (mountedRef.current) await refreshStatus();
      if (mountedRef.current) setErrorMessage(t(language, "downloads.removeError"));
    } finally {
      operationRef.current = false;
      if (mountedRef.current) setRemoving(false);
    }
  };
  const isAnyJobActive = job !== null || removing;
  const travelReady =
    status?.downloadedMushafPages === 604 &&
    status.travelAudioTotal > 0 &&
    status.travelAudioCompleted === status.travelAudioTotal;
  const numeric = (bytes: number | undefined) => <bdi dir="ltr">{formatMegabytes(bytes, language)}</bdi>;
  const collectionState = (info: AudioStatus | undefined) =>
    !info || isLoading
      ? t(language, "downloads.checking")
      : info.total === 0
        ? t(language, "downloads.unavailable")
        : t(language, "downloads.recordingCoverage", {
            completed: formatNumerals(info.completed, language),
            total: formatNumerals(info.total, language),
          });
  const audioRows = (resources: AudioCollection[]) =>
    resources.map((resource) => {
      const index = collections.indexOf(resource);
      const saved = status?.audio[index];
      const active = job?.id === resource.id;
      const title = t(language, resource.titleKey);
      const completed = active ? job.completed : (saved?.completed ?? 0);
      const total = active ? job.total : (saved?.total ?? 0);
      return (
        <OfflineResourceRow
          key={resource.id}
          id={resource.id}
          title={title}
          detail={t(language, "downloads.audioResourceHint")}
          state={active ? t(language, "downloads.verifyingAudio") : collectionState(saved)}
          size={
            <>
              {t(language, "downloads.remainingSize")} {numeric(saved?.remainingBytes)}
            </>
          }
          completed={completed}
          total={total}
          language={language}
          disabled={isLoading || isAnyJobActive}
          active={active}
          action={t(
            language,
            saved?.completed && saved.completed < saved.total
              ? "downloads.resumeResource"
              : saved?.total && saved.completed === saved.total
                ? "downloads.resourceReady"
                : "downloads.downloadResource",
          )}
          onDownload={() =>
            void runDownload(resource.id, saved?.remainingBytes ?? resource.byteSize, async (controller) => {
              await downloadAudioForZikrs(resource.zikrs, audioPreferences, {
                signal: controller.signal,
                onProgress: updateProgress(resource.id),
              });
            })
          }
          onCancel={() => controllerRef.current?.abort()}
          onRemove={() => void removeResource(resource.id, resource)}
        />
      );
    });
  return (
    <div
      className="slide-in-from-right flex h-full min-h-0 flex-col bg-background/50 backdrop-blur-md"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <SubHeader title={t(language, "downloads.title")} onBack={onBack} language={language} />
      <div
        className="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 pt-3"
        data-testid="downloads-scroll"
        onFocusCapture={(event) => {
          // Native focus scrolling sees the viewport, but not a floating dock.
          const scroll = getScrollViewport(event.currentTarget);
          const clearance =
            Number.parseFloat(getComputedStyle(scroll).getPropertyValue("--floating-audio-clearance")) || 0;
          const bottom = scroll.getBoundingClientRect().bottom - clearance;
          const targetBottom = event.target.getBoundingClientRect().bottom;
          if (targetBottom > bottom) scroll.scrollTop += targetBottom - bottom + 8;
        }}
        style={{
          paddingBottom: "calc(2rem + var(--floating-audio-clearance, 0px))",
          scrollPaddingBottom: "calc(2rem + var(--floating-audio-clearance, 0px))",
        }}
      >
        <Card as="section" padding="md" aria-labelledby="offline-summary-title">
          <h2 id="offline-summary-title" className="flex items-center gap-2 text-subtitle font-semibold">
            <CloudOff size={20} aria-hidden="true" />
            {t(language, "downloads.bundledTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(language, "downloads.bundledBody")}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t(language, status?.serviceWorkerReady ? "downloads.appOfflineReady" : "downloads.appOfflinePending")}
          </p>
          <dl className="mt-3 flex flex-wrap gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t(language, "downloads.storageUsed")}</dt>
              <dd>{numeric(status?.usageBytes)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t(language, "downloads.availableStorage")}</dt>
              <dd>
                {numeric(
                  status?.quotaBytes === undefined || status.usageBytes === undefined
                    ? undefined
                    : Math.max(0, status.quotaBytes - status.usageBytes),
                )}
              </dd>
            </div>
          </dl>
        </Card>
        <Card as="section" padding="md" aria-labelledby="travel-download-title">
          <h2 id="travel-download-title" className="text-subtitle font-semibold">
            {t(language, "downloads.travelTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(language, "downloads.travelBody")}</p>
          <ul className="mt-3 mb-3 list-disc ps-5 text-sm text-muted-foreground">
            <li>{t(language, "downloads.mushafTitle")}</li>
            <li>{t(language, "downloads.dailyAudio")}</li>
            <li>{t(language, "downloads.kahf")}</li>
          </ul>
          <p className="text-sm font-semibold" data-testid="travel-readiness">
            {isLoading
              ? t(language, "downloads.checking")
              : t(language, travelReady ? "downloads.travelReady" : "downloads.travelNotReady")}
          </p>
          {status && (
            <>
              <p className="my-2 text-sm text-muted-foreground">
                {t(language, "downloads.travelCoverage", {
                  pages: formatNumerals(status.downloadedMushafPages, language),
                  completed: formatNumerals(status.travelAudioCompleted, language),
                  total: formatNumerals(status.travelAudioTotal, language),
                })}
              </p>
              <DownloadProgress
                completed={status.downloadedMushafPages + status.travelAudioCompleted}
                total={604 + status.travelAudioTotal}
                label={t(language, "downloads.bundleReadiness")}
                language={language}
              />
            </>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t(language, "downloads.remainingSize")}{" "}
            {numeric(status ? mushafBytes + status.travelAudioRemainingBytes : undefined)}
          </p>
          <Button
            onClick={prepareTravel}
            disabled={isLoading || !status || isAnyJobActive || travelReady}
            className="mt-3 h-auto min-h-11 w-full whitespace-normal py-2"
          >
            <Download size={18} aria-hidden="true" />
            {t(language, "downloads.prepareTravel")}
          </Button>
          {job?.id === "bundle" && (
            <div className="mt-3 space-y-2">
              <p className="text-sm">
                {t(
                  language,
                  job.group === 0
                    ? "downloads.mushafTitle"
                    : (collections[(job.group ?? 1) - 1]?.titleKey ?? "downloads.checking"),
                )}
              </p>
              <DownloadProgress
                completed={job.completed}
                total={job.total}
                label={t(language, "downloads.travelProgressLabel")}
                language={language}
                active
              />
              <Button variant="outline" onClick={() => controllerRef.current?.abort()}>
                {t(language, "downloads.cancelDownload")}
              </Button>
            </div>
          )}
        </Card>
        <Card as="section" padding="md" aria-labelledby="resource-downloads-title">
          <h2 id="resource-downloads-title" className="text-subtitle font-semibold">
            {t(language, "downloads.manageResources")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(language, "downloads.approvedOnly")}</p>
          <div className="divide-y divide-border/40">
            <OfflineResourceRow
              id="mushaf"
              title={t(language, "downloads.mushafTitle")}
              detail={t(language, "downloads.mushafBody")}
              state={
                isLoading
                  ? t(language, "downloads.checking")
                  : t(language, "downloads.mushafProgressValue", {
                      completed: formatNumerals(
                        job?.id === "mushaf" ? job.completed : (status?.downloadedMushafPages ?? 0),
                        language,
                      ),
                      total: formatNumerals(604, language),
                    })
              }
              size={
                <>
                  {t(language, "downloads.remainingSize")} {numeric(status ? mushafBytes : undefined)}
                </>
              }
              completed={job?.id === "mushaf" ? job.completed : (status?.downloadedMushafPages ?? 0)}
              total={604}
              language={language}
              disabled={isLoading || isAnyJobActive}
              active={job?.id === "mushaf"}
              action={t(
                language,
                status?.downloadedMushafPages === 604
                  ? "downloads.mushafDownloaded"
                  : status?.downloadedMushafPages
                    ? "downloads.resumeMushaf"
                    : "downloads.downloadMushaf",
              )}
              onDownload={() =>
                void runDownload("mushaf", mushafBytes, async (controller) => {
                  await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("mushaf") });
                })
              }
              onCancel={() => controllerRef.current?.abort()}
              onRemove={() => void removeResource("mushaf")}
            />
            {audioRows(collections.slice(3).reverse())}
          </div>
          <h3 className="mt-3 text-sm font-semibold">{t(language, "downloads.dailyAudio")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t(language, "downloads.sharedRecordings")}</p>
          <div className="divide-y divide-border/40">{audioRows(collections.slice(0, 3))}</div>
        </Card>
        <div className="space-y-2" aria-busy={removing}>
          <p role="alert" className="text-sm font-semibold text-destructive">
            {errorMessage}
          </p>
          <p role="status" className="text-sm text-foreground">
            {removing ? t(language, "downloads.removing") : successMessage}
          </p>
        </div>
        {/* Card 4: Technical Diagnostics in an expandable disclosure */}
        <details className="group rounded-2xl border border-border/60 bg-card p-4 transition-colors">
          <summary className="flex min-h-11 cursor-pointer select-none items-center justify-between rounded-lg text-subtitle font-semibold text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            <span className="flex items-center gap-2">
              <Database size={18} className="text-primary" aria-hidden="true" />
              {t(language, "downloads.statusTitle")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {status?.serviceWorkerReady ? t(language, "downloads.active") : t(language, "downloads.inactive")}
              </span>
              <ChevronDown
                size={16}
                className="shrink-0 text-muted-foreground transition-transform duration-standard group-open:rotate-180"
                aria-hidden="true"
              />
            </div>
          </summary>
          <div className="mt-3 border-t border-border/60 pt-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground" role="status">
                {t(language, "downloads.checking")}
              </p>
            ) : status ? (
              <dl className="space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-3">
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
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t(language, "downloads.downloadedMushafEstimate")}</dt>
                  <dd className="font-medium text-foreground">
                    {status.downloadedMushafPages} ·{" "}
                    {formatMegabytes(status.downloadedMushafPages * MUSHAF_ESTIMATED_PAGE_BYTES, language)}
                  </dd>
                </div>
              </dl>
            ) : null}

            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshStatus()}
              disabled={isLoading || isAnyJobActive}
              className="mt-4 h-auto min-h-11 w-full whitespace-normal py-2"
            >
              <RotateCcw size={18} aria-hidden="true" />
              {t(language, "downloads.refresh")}
            </Button>
          </div>
        </details>
      </div>
    </div>
  );
}

import { isNativeAndroid } from "../../native/platform";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/button";
import { ChevronDown, Database, RotateCcw } from "../../components/icons";
import { OfflineResourceRow } from "../../components/OfflineResourceRow";
import { getScrollViewport } from "../../components/scrollViewport";
import { t } from "../../i18n";
import type { AppLanguage, Zikr } from "../../types";
import { formatNumerals } from "../../formatting";
import { reportError } from "../../../lib/observability";
import { SubHeader } from "./SettingsPrimitives";
import { AudioFileExports } from "./AudioFileExports";
import { DownloadProgress } from "../../components/DownloadProgress";
import { saveFileToDevice } from "../../share/shareDispatcher";
import { applyContentReview } from "../../content/contentReview";
import { ALL_AZKAR, getAzkarForMode } from "../../content/azkar";
import { loadAudioPreferences } from "../../audio/audioPreferences";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getDownloadedAudioSummary,
  getAudioDownloadStatuses,
  removeAudioForZikrs,
  type AudioDownloadProgress,
} from "../../audio/audioOfflineCache";
import { AudioDownloadError } from "../../audio/audioDownloadTransfer";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "../../content/mushafOfflineCache";
import {
  hasDownloadSpace,
  isStorageQuotaError,
  MUSHAF_ESTIMATED_PAGE_BYTES,
  getDownloadPersistence,
  requestDownloadPersistence,
  type DownloadPersistence,
} from "../../content/downloadStorage";

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
  groups: AudioStatus[];
  audio: AudioStatus[];
};
type Job = { id: string; completed: number; total: number; detail?: AudioDownloadProgress; archive?: boolean };
function formatMegabytes(bytes: number | undefined, language: AppLanguage) {
  return typeof bytes === "number"
    ? formatNumerals((bytes / 1_000_000).toFixed(1), language) + " MB"
    : t(language, "downloads.unavailable");
}

export function DownloadsPanel({
  language,
  onBack,
  direction = language === "ar" ? "rtl" : "ltr",
}: {
  language: AppLanguage;
  onBack: () => void;
  direction?: "ltr" | "rtl";
}) {
  const [collections, setCollections] = useState<AudioCollection[]>([]);
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [persistence, setPersistence] = useState<DownloadPersistence>("unsupported");
  const [requestingPersistence, setRequestingPersistence] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(false);
  const mountedRef = useRef(true);
  const statusRequestRef = useRef(0);
  const audioPreferences = useMemo(loadAudioPreferences, []);
  // Optional Quran corpora load only when this panel is opened.
  const resourcePromise = useMemo(
    () =>
      Promise.all([
        import("../../content/fridayKahf"),
        import("../../content/baqarahSurah"),
        import("../../content/comprehensiveDuas"),
      ]).then(([{ FRIDAY_KAHF }, { BAQARAH_SURAH }, { COMPREHENSIVE_DUAS }]) => {
        const entries = [
          ...(["morning", "evening", "before_sleep"] as const).map((id, index) => ({
            id,
            titleKey: ["downloads.morningFull", "downloads.eveningFull", "downloads.sleepFull"][index]!,
            zikrs: getAzkarForMode(id, "complete").filter((z) => z.id !== BAQARAH_SURAH.id),
          })),
          {
            id: "other",
            titleKey: "downloads.otherAdhkar",
            zikrs: [...ALL_AZKAR, ...COMPREHENSIVE_DUAS].filter(
              (z) =>
                !z.isCollectionIntroduction &&
                z.id !== BAQARAH_SURAH.id &&
                !["morning", "evening", "before_sleep"].includes(z.category),
            ),
          },
          { id: "kahf", titleKey: "downloads.kahf", zikrs: FRIDAY_KAHF },
          { id: "baqarah", titleKey: "downloads.baqarah", zikrs: applyContentReview([BAQARAH_SURAH]) },
        ];
        return entries.map((entry) => ({
          ...entry,
          byteSize: estimateAudioDownloadBytes(entry.zikrs, audioPreferences),
        }));
      }),
    [audioPreferences],
  );

  const refreshStatus = useCallback(async () => {
    const request = ++statusRequestRef.current;
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const resources = await resourcePromise;
      if (!mountedRef.current || request !== statusRequestRef.current) return;
      setCollections(resources);
      const [registration, cacheNames, storage, mushafStatus, audioStatus, storagePersistence] = await Promise.all([
        "serviceWorker" in navigator ? navigator.serviceWorker.getRegistration() : undefined,
        "caches" in window ? caches.keys() : [],
        navigator.storage?.estimate?.().catch(() => ({}) as StorageEstimate) ?? {},
        getMushafDownloadStatus(),
        // Aggregate groups use the same exact-variant deduplication and verification as individual downloads.
        getAudioDownloadStatuses(
          [
            ...resources.map((r) => r.zikrs),
            resources.slice(0, 4).flatMap((r) => r.zikrs),
            resources.slice(4).flatMap((r) => r.zikrs),
          ],
          audioPreferences,
        ),
        getDownloadPersistence(),
      ]);
      if (!mountedRef.current || request !== statusRequestRef.current) return;

      const audioSummary = getDownloadedAudioSummary();
      setPersistence(storagePersistence);
      setCollections(resources);
      setStatus({
        serviceWorkerReady: isNativeAndroid() || Boolean(registration?.active),
        cacheCount: cacheNames.length,
        usageBytes: storage.usage,
        quotaBytes: storage.quota,
        downloadedAudioAssets: audioSummary.assetCount,
        downloadedAudioBytes: audioSummary.byteSize,
        downloadedMushafPages: mushafStatus.downloadedPages,
        groups: audioStatus.slice(resources.length),
        audio: audioStatus.slice(0, resources.length),
      });
    } catch (error) {
      reportError(error, "offline-storage-status");
      if (mountedRef.current && request === statusRequestRef.current)
        setErrorMessage(t(language, "downloads.statusError"));
    } finally {
      if (mountedRef.current && request === statusRequestRef.current) setIsLoading(false);
    }
  }, [language, resourcePromise, audioPreferences]);
  useEffect(() => {
    mountedRef.current = true;
    void refreshStatus();
    return () => {
      mountedRef.current = false;
      statusRequestRef.current += 1;
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
    setFailedId(null);
    setJob({ id, completed: 0, total: id === "mushaf" ? 604 : bytes });
    let message = "";
    let failure = "";
    try {
      if (!(await hasDownloadSpace(bytes))) throw new DOMException("Storage full", "QuotaExceededError");
      if (persistence !== "granted") {
        void requestDownloadPersistence().then((result) => {
          if (mountedRef.current && result === "granted") setPersistence(result);
        });
      }
      controller.signal.throwIfAborted();
      await work(controller);
      message = t(
        language,
        id === "mushaf"
          ? "downloads.mushafDownloadComplete"
          : id === "archive"
            ? "downloads.fileHandedToBrowser"
            : "downloads.downloadComplete",
      );
    } catch (error) {
      if (controller.signal.aborted)
        message = t(language, id === "mushaf" ? "downloads.mushafCancelled" : "downloads.downloadCancelled");
      else {
        reportError(error, "offline-download");
        failure = t(
          language,
          isStorageQuotaError(error)
            ? "downloads.storageFull"
            : error instanceof AudioDownloadError
              ? error.code === "integrity"
                ? "downloads.integrityError"
                : error.code === "unsupported"
                  ? "downloads.unsupportedError"
                  : error.code === "server"
                    ? "downloads.serverError"
                    : "downloads.networkError"
              : "downloads.downloadErrorDescription",
        );
      }
    } finally {
      if (mountedRef.current) {
        await refreshStatus();
        if (mountedRef.current) {
          setJob(null);
          setSuccessMessage(message);
          if (failure) {
            setErrorMessage(failure);
            setFailedId(id);
          }
        }
      }
      controllerRef.current = null;
      operationRef.current = false;
    }
  };
  const updateProgress = (id: string) => (completed: number, total: number) => {
    if (mountedRef.current) setJob((previous) => ({ ...previous, id, completed, total }));
  };
  const updateAudioDetail = (id: string) => (detail: AudioDownloadProgress) => {
    if (mountedRef.current) setJob({ id, completed: detail.receivedBytes, total: detail.totalBytes, detail });
  };
  const mushafBytes = Math.max(0, 604 - (status?.downloadedMushafPages ?? 0)) * MUSHAF_ESTIMATED_PAGE_BYTES;
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
  const numeric = (bytes: number | undefined) => <bdi dir="ltr">{formatMegabytes(bytes, language)}</bdi>;
  const collectionState = (info: AudioStatus | undefined) =>
    !info || isLoading
      ? t(language, "downloads.checking")
      : info.total === 0
        ? t(language, "downloads.unavailable")
        : t(
            language,
            info.completed === info.total
              ? "downloads.downloaded"
              : info.completed > 0
                ? "downloads.partial"
                : "downloads.notDownloaded",
          );
  const groupedResources: AudioCollection[] = useMemo(
    () => [
      {
        id: "adhkar",
        titleKey: "downloads.adhkarTitle",
        zikrs: collections.slice(0, 4).flatMap((r) => r.zikrs),
        byteSize: 0,
      },
      {
        id: "recitations",
        titleKey: "downloads.recitationsTitle",
        zikrs: collections.slice(4).flatMap((r) => r.zikrs),
        byteSize: 0,
      },
    ],
    [collections],
  );
  const audioRows = (resources: AudioCollection[], grouped = false) =>
    resources.map((resource) => {
      const index = collections.indexOf(resource);
      const saved = grouped ? status?.groups[resource.id === "adhkar" ? 0 : 1] : status?.audio[index];
      const active =
        job !== null &&
        (job.id === resource.id ||
          (grouped &&
            collections
              .slice(resource.id === "adhkar" ? 0 : 4, resource.id === "adhkar" ? 4 : undefined)
              .some((collection) => collection.id === job.id)));
      const title = t(language, resource.titleKey);
      const detail = active ? job?.detail : undefined;
      const completed = active ? job.completed : (saved?.completed ?? 0);
      const total = active ? job.total : (saved?.total ?? 0);
      return (
        <OfflineResourceRow
          key={resource.id}
          id={resource.id}
          title={title}
          detail={
            grouped
              ? t(
                  language,
                  resource.id === "adhkar" ? "downloads.adhkarDescription" : "downloads.recitationsDescription",
                )
              : ""
          }
          state={active ? t(language, "downloads.downloading") : collectionState(saved)}
          feedback={
            <>
              {!isLoading && saved && (
                <p>
                  {t(language, "downloads.recordingCoverage", {
                    completed: formatNumerals(detail?.completedFiles ?? saved?.completed ?? 0, language),
                    total: formatNumerals(detail?.totalFiles ?? saved?.total ?? 0, language),
                  })}
                </p>
              )}
              {detail && (
                <p>
                  {t(
                    language,
                    detail.phase === "retrying"
                      ? "downloads.retryingFile"
                      : detail.phase === "verifying"
                        ? "downloads.verifyingFile"
                        : detail.phase === "saved"
                          ? "downloads.fileSaved"
                          : "downloads.receivingFile",
                    {
                      file: formatNumerals(detail.fileNumber, language),
                      total: formatNumerals(detail.totalFiles, language),
                      attempt: formatNumerals(detail.attempt, language),
                    },
                  )}
                </p>
              )}
              {active && (
                <p>
                  <bdi dir="ltr">
                    {formatMegabytes(completed, language)} / {formatMegabytes(total, language)}
                  </bdi>
                </p>
              )}
              {failedId === resource.id && <p className="text-destructive">{errorMessage}</p>}
            </>
          }
          size={numeric(saved?.remainingBytes)}
          completed={completed}
          total={total}
          language={language}
          direction={direction}
          compact
          headingLevel={grouped ? 2 : 3}
          hideRemove={grouped}
          disabled={isLoading || isAnyJobActive}
          active={active}
          action={t(
            language,
            failedId === resource.id
              ? "downloads.retry"
              : saved?.completed && saved.completed < saved.total
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
                onDetail: updateAudioDetail(resource.id),
              });
            })
          }
          onCancel={() => controllerRef.current?.abort()}
          onRemove={() => void removeResource(resource.id, resource)}
        />
      );
    });
  return (
    <div className="slide-in-from-right flex h-full min-h-0 flex-col bg-background/50 backdrop-blur-md" dir={direction}>
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
        <p className="text-sm text-muted-foreground">{t(language, "downloads.includedText")}</p>
        <details className="rounded-xl border border-border bg-card px-3">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "downloads.offlineHelp")}
          </summary>
          <p className="pb-3 text-sm leading-relaxed text-muted-foreground">
            {t(language, "downloads.localStorageHelp")}
          </p>
        </details>
        <div className="space-y-2 rounded-xl border border-border p-3">
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
            data-testid="download-persistence"
          >
            {t(
              language,
              requestingPersistence
                ? "downloads.requestingPersistence"
                : persistence === "granted"
                  ? "downloads.persistenceGranted"
                  : persistence === "denied"
                    ? "downloads.persistenceDenied"
                    : "downloads.persistenceUnsupported",
            )}
          </p>
          {persistence === "denied" && (
            <Button
              variant="outline"
              disabled={requestingPersistence || isLoading}
              className="h-auto min-h-11 max-w-full whitespace-normal py-2"
              onClick={async () => {
                setRequestingPersistence(true);
                const result = await requestDownloadPersistence();
                if (mountedRef.current) {
                  setPersistence(result);
                  setRequestingPersistence(false);
                }
              }}
            >
              {t(language, "downloads.keepDownloads")}
            </Button>
          )}
        </div>
        <div className="space-y-2 rounded-xl border border-border p-3" data-testid="audio-archive-export">
          <p className="text-sm text-muted-foreground">{t(language, "downloads.archiveHelp")}</p>
          {job?.id === "archive" && (
            <>
              <p role="status" className="text-sm">
                {job.archive
                  ? t(language, "downloads.archiveProgress", {
                      completed: formatNumerals(job.completed, language),
                      total: formatNumerals(job.total, language),
                    })
                  : t(language, "downloads.recordingCoverage", {
                      completed: formatNumerals(job.detail?.completedFiles ?? 0, language),
                      total: formatNumerals(job.detail?.totalFiles ?? 0, language),
                    })}
              </p>
              <DownloadProgress
                completed={job.completed}
                total={job.total}
                label={t(language, "downloads.archiveAll")}
                language={language}
                direction={direction}
                active={true}
              />
            </>
          )}
          <Button
            variant="outline"
            className="h-auto min-h-11 max-w-full whitespace-normal py-2"
            disabled={
              job?.id !== "archive" &&
              (isLoading || isAnyJobActive || !status || !collections.some((r) => r.byteSize > 0))
            }
            onClick={() => {
              if (job?.id === "archive") {
                controllerRef.current?.abort();
                return;
              }
              void runDownload(
                "archive",
                status?.groups.reduce((sum, group) => sum + group.remainingBytes, 0) ?? 0,
                async (controller) => {
                  const { prepareAudioArchive } = await import("../../audio/audioArchive");
                  const file = await prepareAudioArchive(
                    collections.flatMap((resource) => resource.zikrs),
                    audioPreferences,
                    {
                      language,
                      signal: controller.signal,
                      onDetail: updateAudioDetail("archive"),
                      onArchiveProgress: (completed, total) => {
                        if (mountedRef.current) setJob({ id: "archive", completed, total, archive: true });
                      },
                    },
                  );
                  controller.signal.throwIfAborted();
                  if (mountedRef.current) await saveFileToDevice(file);
                },
              );
            }}
          >
            {t(language, job?.id === "archive" ? "downloads.cancelDownload" : "downloads.archiveAll")}
          </Button>
        </div>
        {status && !status.serviceWorkerReady && (
          <p role="status" className="text-sm text-muted-foreground">
            {t(language, "downloads.checkApp")}
          </p>
        )}
        {groupedResources.map((resource, index) => (
          <Card key={resource.id} as="section" padding="md" data-testid={"download-category-" + resource.id}>
            {audioRows([resource], true)}
            <details className="group border-t border-border/40">
              <summary
                className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "downloads.manage") + " · " + t(language, resource.titleKey)}
              >
                {t(language, "downloads.manage")}
                <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-xs text-muted-foreground">{t(language, "downloads.availableOnly")}</p>
              {index === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">{t(language, "downloads.sharedRecordings")}</p>
              )}
              <div className="divide-y divide-border/40">
                {audioRows(index === 0 ? collections.slice(0, 4) : collections.slice(4))}
              </div>
              <AudioFileExports
                zikrs={resource.zikrs}
                preferences={audioPreferences}
                language={language}
                disabled={isLoading || isAnyJobActive}
                revision={status}
              />
            </details>
          </Card>
        ))}
        <Card as="section" padding="md" data-testid="download-category-mushaf">
          <OfflineResourceRow
            id="mushaf"
            headingLevel={2}
            title={t(language, "downloads.pagesTitle")}
            detail={t(language, "downloads.pagesDescription")}
            state={
              job?.id === "mushaf"
                ? t(language, "downloads.mushafProgressValue", {
                    completed: formatNumerals(job.completed, language),
                    total: formatNumerals(604, language),
                  })
                : collectionState(
                    status
                      ? { completed: status.downloadedMushafPages, total: 604, remainingBytes: mushafBytes }
                      : undefined,
                  )
            }
            feedback={
              !isLoading && (
                <>
                  <p>
                    {t(language, "downloads.mushafProgressValue", {
                      completed: formatNumerals(status?.downloadedMushafPages ?? 0, language),
                      total: formatNumerals(604, language),
                    })}
                  </p>
                  {failedId === "mushaf" && <p className="text-destructive">{errorMessage}</p>}
                </>
              )
            }
            size={numeric(status ? mushafBytes : undefined)}
            completed={job?.id === "mushaf" ? job.completed : (status?.downloadedMushafPages ?? 0)}
            total={604}
            language={language}
            direction={direction}
            compact
            hideRemove
            disabled={isLoading || isAnyJobActive}
            active={job?.id === "mushaf"}
            action={t(
              language,
              failedId === "mushaf"
                ? "downloads.retry"
                : status?.downloadedMushafPages === 604
                  ? "downloads.downloaded"
                  : status?.downloadedMushafPages
                    ? "downloads.resumeResource"
                    : "downloads.downloadResource",
            )}
            onDownload={() =>
              void runDownload("mushaf", mushafBytes, async (controller) => {
                await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("mushaf") });
              })
            }
            onCancel={() => controllerRef.current?.abort()}
            onRemove={() => void removeResource("mushaf")}
          />
          <details className="group border-t border-border/40">
            <summary
              className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={t(language, "downloads.manage") + " · " + t(language, "downloads.pagesTitle")}
            >
              {t(language, "downloads.manage")}
              <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
            </summary>
            <OfflineResourceRow
              id="mushaf-management"
              title={t(language, "downloads.pagesTitle")}
              detail=""
              state={t(language, "downloads.mushafProgressValue", {
                completed: formatNumerals(status?.downloadedMushafPages ?? 0, language),
                total: formatNumerals(604, language),
              })}
              size={numeric(status ? mushafBytes : undefined)}
              completed={status?.downloadedMushafPages ?? 0}
              total={604}
              language={language}
              direction={direction}
              disabled={isLoading || isAnyJobActive}
              active={job?.id === "mushaf"}
              compact
              showDownload={false}
              action={t(language, "downloads.downloadResource")}
              onDownload={() =>
                void runDownload("mushaf", mushafBytes, async (controller) => {
                  await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("mushaf") });
                })
              }
              onCancel={() => controllerRef.current?.abort()}
              onRemove={() => void removeResource("mushaf")}
            />
          </details>
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
              {t(language, "downloads.storageDetails")}
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
            <p className="mb-3 text-xs text-muted-foreground">
              {t(language, status?.serviceWorkerReady ? "downloads.appOfflineReady" : "downloads.appOfflinePending")}
            </p>
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

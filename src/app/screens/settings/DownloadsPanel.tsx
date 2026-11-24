import { MushafDownloadSelection } from "../../components/MushafDownloadSelection";
import {
  useDownloadSession,
  runDownloadSession,
  updateDownloadSession,
  cancelDownloadSession,
  getDownloadSession,
  clearDownloadNotice,
} from "../../downloads/downloadSession";
import { DownloadOverview } from "../../components/DownloadOverview";
import { DownloadBatchError, runDownloadBatch, type DownloadCategory } from "../../downloads/downloadBatch";
import { isNativeAndroid } from "../../native/platform";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/button";
import { Check, ChevronDown, Database, Download, Headphones, BookOpen, RotateCcw } from "../../components/icons";
import { OfflineResourceRow } from "../../components/OfflineResourceRow";
import { getScrollViewport } from "../../components/scrollViewport";
import { t } from "../../i18n";
import type { AppLanguage, Zikr } from "../../types";
import { formatNumerals } from "../../formatting";
import { reportError } from "../../../lib/observability";
import { SubHeader } from "./SettingsPrimitives";
import { AudioFileExports } from "./AudioFileExports";
import { saveFileToDevice } from "../../share/shareDispatcher";
import { applyContentReview } from "../../content/contentReview";
import { ALL_AZKAR, getAzkarForMode } from "../../content/azkar";
import { loadAudioPreferences } from "../../audio/audioPreferences";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getDownloadedAudioSummary,
  getAudioDownloadStatuses,
  getAudioDownloadVoices,
  removeAudioForZikrs,
  type AudioDownloadProgress,
} from "../../audio/audioOfflineCache";
import { AudioDownloadError } from "../../audio/audioDownloadTransfer";
import {
  downloadMushaf,
  getMushafDownloadStatus,
  getPreviousMushafDownloadStatus,
  removeDownloadedMushaf,
} from "../../content/mushafOfflineCache";
import {
  hasDownloadSpace,
  isStorageQuotaError,
  getMushafDownloadBytes,
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
  groups: AudioStatus[];
  audio: AudioStatus[];
};
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
  const [mushafStatus, setMushafStatus] = useState(() => getPreviousMushafDownloadStatus());
  const [checkingMushaf, setCheckingMushaf] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const session = useDownloadSession();
  const job = session.job;
  const [selected, setSelected] = useState<DownloadCategory[]>(["adhkar", "recitations", "mushaf"]);
  const [customizing, setCustomizing] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [failedPageRange, setFailedPageRange] = useState<readonly [number, number] | undefined>();
  const [lastOperationId, setLastOperationId] = useState<string>();
  const [noticeKind, setNoticeKind] = useState<"complete" | "cancelled" | "failed" | null>(null);
  const overviewActionRef = useRef<HTMLDivElement>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [persistence, setPersistence] = useState<DownloadPersistence>("unsupported");
  const [requestingPersistence, setRequestingPersistence] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(false);
  const archiveButtonRef = useRef<HTMLButtonElement>(null);
  const archiveOwnedFocus = useRef(false);
  const [restoreArchiveFocus, setRestoreArchiveFocus] = useState(false);
  const previousJobId = useRef(job?.id);
  useEffect(() => {
    if (job && previousJobId.current !== job.id) {
      overviewActionRef.current?.querySelector<HTMLButtonElement>('[data-testid="download-overview-action"]')?.focus();
    }
    previousJobId.current = job?.id;
  }, [job]);

  const mountedRef = useRef(true);
  const statusRequestRef = useRef(0);
  const statusController = useRef<AbortController | null>(null);
  const audioPreferences = useMemo(loadAudioPreferences, []);
  const allAudioZikrs = useMemo(() => collections.flatMap((resource) => resource.zikrs), [collections]);
  // Optional Quran corpora load only when this panel is opened.
  const loadResources = useCallback(
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
    statusController.current?.abort();
    const acquisition = new AbortController();
    statusController.current = acquisition;
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);
    setCheckingMushaf(true);
    const mushafCheck = getMushafDownloadStatus(acquisition.signal)
      .then((value) => {
        if (!acquisition.signal.aborted) setMushafStatus(value);
      })
      .catch((error) => {
        if (!acquisition.signal.aborted) reportError(error, "mushaf-storage-status");
      })
      .finally(() => {
        if (!acquisition.signal.aborted) setCheckingMushaf(false);
      });
    try {
      const resources = await loadResources();
      if (!mountedRef.current || request !== statusRequestRef.current) return;
      setCollections(resources);
      const [registration, cacheNames, storage, audioStatus, storagePersistence] = await Promise.all([
        "serviceWorker" in navigator ? navigator.serviceWorker.getRegistration() : undefined,
        "caches" in window ? caches.keys() : [],
        navigator.storage?.estimate?.().catch(() => ({}) as StorageEstimate) ?? {},
        // Aggregate groups use the same exact-variant deduplication and verification as individual downloads.
        getAudioDownloadStatuses(
          [
            ...resources.map((r) => r.zikrs),
            resources.slice(0, 4).flatMap((r) => r.zikrs),
            resources.slice(4).flatMap((r) => r.zikrs),
          ],
          audioPreferences,
          { signal: acquisition.signal },
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
        groups: audioStatus.slice(resources.length),
        audio: audioStatus.slice(0, resources.length),
      });
    } catch (error) {
      if (acquisition.signal.aborted) return;
      reportError(error, "offline-storage-status");
      if (mountedRef.current && request === statusRequestRef.current)
        setErrorMessage(t(language, "downloads.statusError"));
    } finally {
      if (mountedRef.current && request === statusRequestRef.current) setIsLoading(false);
      await mushafCheck;
    }
  }, [language, loadResources, audioPreferences]);
  useEffect(() => {
    mountedRef.current = true;
    if (!getDownloadSession().result) void refreshStatus();
    return () => {
      mountedRef.current = false;
      statusRequestRef.current += 1;
      statusController.current?.abort();
      if (getDownloadSession().job?.id === "archive") cancelDownloadSession();
    };
  }, [refreshStatus]);

  const runDownload = async (
    id: string,
    bytes: number,
    work: (controller: AbortController) => Promise<void>,
    pageRange?: readonly [number, number],
  ) => {
    if (operationRef.current || getDownloadSession().job || isLoading || checkingMushaf || !status) return;
    operationRef.current = true;
    setErrorMessage("");
    setSuccessMessage("");
    setFailedId(null);
    setNoticeKind(null);
    await runDownloadSession(
      {
        id,
        completed: 0,
        total: id === "mushaf" ? 604 : id === "mushaf-pages" || id === "selection" ? 0 : bytes,
        selection: id === "selection" ? [...selected] : undefined,
        pageRange,
      },
      async (controller) => {
        controllerRef.current = controller;
        if (!(await hasDownloadSpace(bytes))) throw new DOMException("Storage full", "QuotaExceededError");
        if (persistence !== "granted") {
          void requestDownloadPersistence().then((result) => {
            if (mountedRef.current && result === "granted") setPersistence(result);
          });
        }
        controller.signal.throwIfAborted();
        await work(controller);
      },
    );
    controllerRef.current = null;
    operationRef.current = false;
  };
  useEffect(() => {
    const result = session.result;
    if (!result) return;
    let active = true;
    const selectedResult = result.selection?.filter((id): id is DownloadCategory =>
      ["adhkar", "recitations", "mushaf"].includes(id),
    );
    if (selectedResult?.length) setSelected(selectedResult);
    setFailedPageRange(result.pageRange);
    setLastOperationId(result.id);
    const restore =
      result.id === "archive" && (archiveOwnedFocus.current || document.activeElement === archiveButtonRef.current);
    void refreshStatus().then(() => {
      if (!active) return;
      setNoticeKind(result.status);
      if (result.status === "failed") {
        reportError(result.error, "offline-download");
        const failure = result.error instanceof DownloadBatchError ? result.error.failures[0]?.error : result.error;
        const code =
          failure instanceof AudioDownloadError
            ? failure.code
            : failure instanceof TypeError ||
                (failure instanceof DOMException && ["TimeoutError", "NetworkError"].includes(failure.name))
              ? "network"
              : failure instanceof DOMException && failure.name === "DataError"
                ? "integrity"
                : failure instanceof DOMException && failure.name === "OperationError"
                  ? "server"
                  : undefined;
        setErrorMessage(
          t(
            language,
            isStorageQuotaError(failure)
              ? "downloads.storageFull"
              : code === "integrity"
                ? "downloads.integrityError"
                : code === "unsupported"
                  ? "downloads.unsupportedError"
                  : code === "server"
                    ? "downloads.serverError"
                    : code === "network"
                      ? "downloads.networkError"
                      : "downloads.downloadErrorDescription",
          ),
        );
        setFailedId(result.id);
      } else
        setSuccessMessage(
          t(
            language,
            result.status === "cancelled"
              ? result.id.startsWith("mushaf")
                ? "downloads.mushafCancelled"
                : "downloads.downloadCancelled"
              : result.id === "mushaf"
                ? "downloads.mushafDownloadComplete"
                : result.id === "archive"
                  ? "downloads.fileHandedToBrowser"
                  : "downloads.downloadComplete",
          ),
        );
      archiveOwnedFocus.current = false;
      if (restore) setRestoreArchiveFocus(true);
      else clearDownloadNotice();
    });
    return () => {
      active = false;
    };
  }, [session.revision, session.result, refreshStatus, language]);
  useEffect(() => {
    if (!restoreArchiveFocus || isLoading || job) return;
    if (
      [
        document.body,
        document.documentElement,
        archiveButtonRef.current,
        overviewActionRef.current?.querySelector('[data-testid="download-overview-action"]'),
      ].includes(document.activeElement as HTMLElement)
    )
      archiveButtonRef.current?.focus();
    setRestoreArchiveFocus(false);
    clearDownloadNotice();
  }, [restoreArchiveFocus, isLoading, job]);
  const updateProgress = (id: string) => (completed: number, total: number, transferredBytes?: number) => {
    updateDownloadSession({ id, completed, total, transferredBytes });
  };
  const updateAudioDetail = (id: string) => (detail: AudioDownloadProgress) => {
    updateDownloadSession({ id, completed: detail.receivedBytes, total: detail.totalBytes, detail });
  };
  const mushafBytes = mushafStatus?.remainingBytes ?? getMushafDownloadBytes(1, 604);
  const removeResource = async (id: string, collection?: AudioCollection) => {
    if (operationRef.current || getDownloadSession().job || isLoading) return;
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
  const collectionState = (info: AudioStatus | undefined, pages = false) =>
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
                : pages
                  ? "downloads.pagesNotDownloaded"
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
  const voiceNames = useMemo(
    () =>
      getAudioDownloadVoices(allAudioZikrs, audioPreferences)
        .map((voice) => voice.name)
        .join(" · "),
    [allAudioZikrs, audioPreferences],
  );
  const resourceVoices = useMemo(
    () =>
      new Map(
        [...collections, ...groupedResources].map((resource) => [
          resource.id,
          getAudioDownloadVoices(resource.zikrs, audioPreferences)
            .map((voice) => voice.name)
            .join(" · "),
        ]),
      ),
    [collections, groupedResources, audioPreferences],
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
      const voices = resourceVoices.get(resource.id);
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
              {voices && <p>{t(language, "downloads.recordingVoices", { voices })}</p>}
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
          size={
            <>
              {t(language, "downloads.remainingSize")} {numeric(saved?.remainingBytes)}
            </>
          }
          completed={completed}
          total={total}
          language={language}
          direction={direction}
          compact
          showTransfer={false}
          headingLevel={grouped ? 2 : 3}
          hideRemove={grouped}
          disabled={isLoading || isAnyJobActive}
          active={active}
          action={t(
            language,
            failedId === resource.id
              ? saved?.completed
                ? "downloads.resumeDownload"
                : "downloads.retry"
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
          onCancel={() => cancelDownloadSession()}
          onRemove={() => void removeResource(resource.id, resource)}
        />
      );
    });

  const categories = [
    ...groupedResources.map((resource, index) => ({
      id: resource.id as DownloadCategory,
      title: t(language, resource.titleKey),
      ready: Boolean(status?.groups[index]?.total && status.groups[index]!.completed === status.groups[index]!.total),
      completed: status?.groups[index]?.completed ?? 0,
      available: Boolean(status?.groups[index]?.total),
      remaining: status?.groups[index]?.remainingBytes ?? 0,
    })),
    {
      id: "mushaf" as const,
      title: t(language, "downloads.pagesTitle"),
      ready: mushafStatus?.isComplete === true,
      completed: mushafStatus?.downloadedPages ?? 0,
      available: true,
      remaining: mushafBytes,
    },
  ];
  const busy = isLoading || checkingMushaf || removing;
  const selectedCategories = categories.filter((category) => selected.includes(category.id) && category.available);
  const selectedBytes = selectedCategories.reduce((sum, category) => sum + category.remaining, 0);
  const ready = !busy && selectedCategories.length > 0 && selectedCategories.every((category) => category.ready);
  const hasSavedSelection = !busy && selectedCategories.some((category) => category.completed > 0);
  const activeTitle = job
    ? t(
        language,
        job.id === "archive"
          ? "downloads.archiveAll"
          : job.id === "mushaf-pages"
            ? "downloads.downloadPages"
            : categories.find((category) => category.id === (job.group ?? job.id))?.id === "mushaf"
              ? "downloads.pagesTitle"
              : ((
                  groupedResources.find((resource) => resource.id === (job.group ?? job.id)) ??
                  collections.find((resource) => resource.id === job.id)
                )?.titleKey ?? "downloads.title"),
      )
    : "";
  const phase = job
    ? "active"
    : busy
      ? "checking"
      : failedId
        ? "failed"
        : ready
          ? "ready"
          : noticeKind === "cancelled"
            ? "cancelled"
            : "idle";
  const transferPhase = job?.cancelling
    ? "downloads.cancelling"
    : job?.detail?.phase === "verifying" && job.detail.receivedBytes >= job.detail.totalBytes
      ? "downloads.verifying"
      : job?.detail?.phase === "retrying"
        ? "downloads.retrying"
        : job?.archive
          ? "downloads.packaging"
          : "downloads.downloading";
  const startSelection = () => {
    const tasks = selectedCategories.filter((category) => !category.ready);
    void runDownload("selection", selectedBytes, async (controller) => {
      const finished: string[] = [];
      await runDownloadBatch(
        tasks.map((category) => ({
          id: category.id,
          run: async () => {
            if (category.id === "mushaf")
              await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("selection") });
            else
              await downloadAudioForZikrs(
                groupedResources.find((resource) => resource.id === category.id)!.zikrs,
                audioPreferences,
                {
                  signal: controller.signal,
                  onProgress: updateProgress("selection"),
                  onDetail: updateAudioDetail("selection"),
                },
              );
            finished.push(category.id);
            const current = getDownloadSession().job;
            if (current) updateDownloadSession({ ...current, finishedGroups: [...finished] });
          },
        })),
        controller.signal,
        (group, groupIndex, groupCount) => {
          updateDownloadSession({
            id: "selection",
            completed: 0,
            total: 0,
            group,
            groupIndex,
            groupCount,
            detail: undefined,
          });
        },
      );
    });
  };
  const startArchive = () => {
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
              updateDownloadSession({ id: "archive", completed, total, archive: true });
            },
          },
        );
        controller.signal.throwIfAborted();
        if (mountedRef.current) await saveFileToDevice(file);
      },
    );
  };
  const primaryAction = () => {
    const recoveryId = failedId ?? (noticeKind === "cancelled" ? lastOperationId : undefined);
    if (job) cancelDownloadSession();
    else if (ready) onBack();
    else if (recoveryId === "archive") {
      startArchive();
    } else if (recoveryId && recoveryId !== "selection") {
      if (recoveryId.startsWith("mushaf")) {
        const range = failedPageRange;
        void runDownload(
          range ? "mushaf-pages" : "mushaf",
          range ? getMushafDownloadBytes(...range) : mushafBytes,
          async (controller) => {
            await downloadMushaf({
              signal: controller.signal,
              pages: range
                ? Array.from({ length: range[1] - range[0] + 1 }, (_, index) => range[0] + index)
                : undefined,
              onProgress: updateProgress(range ? "mushaf-pages" : "mushaf"),
            });
          },
          range,
        );
      } else {
        const resource = [...groupedResources, ...collections].find((item) => item.id === recoveryId);
        if (resource)
          void runDownload(
            resource.id,
            categories.find((category) => category.id === resource.id)?.remaining ??
              status?.audio[collections.indexOf(resource)]?.remainingBytes ??
              resource.byteSize,
            async (controller) => {
              await downloadAudioForZikrs(resource.zikrs, audioPreferences, {
                signal: controller.signal,
                onProgress: updateProgress(resource.id),
                onDetail: updateAudioDetail(resource.id),
              });
            },
          );
      }
    } else startSelection();
  };

  return (
    <div className="slide-in-from-right flex h-full min-h-0 flex-col bg-background/50 backdrop-blur-md" dir={direction}>
      <SubHeader title={t(language, "downloads.title")} onBack={onBack} language={language} />
      <div
        className="flex-1 min-h-0 space-y-4 overflow-y-auto break-words px-4 pt-3"
        data-testid="downloads-scroll"
        onFocusCapture={(event) => {
          // Pointer focus precedes click. Scrolling here can move a disclosure
          // between pointerdown and pointerup and swallow its activation.
          if (!event.target.matches(":focus-visible")) return;
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
        <p className="flex items-center gap-2 rounded-xl border border-border/40 bg-card px-3 py-3 text-sm text-muted-foreground">
          <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />
          {t(language, "downloads.includedText")}
        </p>
        <div ref={overviewActionRef}>
          <DownloadOverview
            language={language}
            phase={phase}
            title={t(
              language,
              job
                ? transferPhase
                : phase === "ready"
                  ? "downloads.selectionReady"
                  : phase === "failed"
                    ? "downloads.downloadError"
                    : phase === "checking"
                      ? "downloads.checking"
                      : "downloads.prepareOffline",
            )}
            description={
              job ? (
                <>
                  <p>{activeTitle}</p>
                  {job.groupCount && (
                    <p>
                      {t(language, "downloads.groupProgress", {
                        current: formatNumerals((job.groupIndex ?? 0) + 1, language),
                        total: formatNumerals(job.groupCount, language),
                      })}
                    </p>
                  )}
                </>
              ) : phase === "ready" ? (
                t(language, "downloads.savedHere")
              ) : phase === "failed" || phase === "cancelled" ? (
                t(language, "downloads.completedKept")
              ) : selected.length === 3 ? (
                t(language, "downloads.offlineScope")
              ) : (
                selectedCategories.map((category) => category.title).join(" · ")
              )
            }
            progress={
              job && job.total > 0
                ? {
                    completed: job.completed,
                    total: job.total,
                    label: activeTitle,
                    context: job.groupCount ? t(language, "downloads.currentGroupProgress") : undefined,
                  }
                : undefined
            }
            action={t(
              language,
              job
                ? job.cancelling
                  ? "downloads.cancelling"
                  : "downloads.cancelDownload"
                : ready
                  ? "downloads.done"
                  : failedId
                    ? "downloads.retry"
                    : noticeKind === "cancelled" || hasSavedSelection
                      ? "downloads.resumeDownload"
                      : customizing || selected.length !== 3
                        ? "downloads.downloadSelected"
                        : "downloads.downloadAll",
            )}
            disabled={job ? Boolean(job.cancelling) : busy || !status || (!ready && selectedCategories.length === 0)}
            onAction={primaryAction}
            size={
              !job && !ready && !busy && status ? (
                <>
                  {t(language, "downloads.remainingSize")} {numeric(selectedBytes)}
                </>
              ) : undefined
            }
          >
            {!job && !ready && (
              <details className="group border-t border-border/40">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                  <span className="flex min-w-0 items-center gap-2">
                    <Headphones size={18} aria-hidden="true" />
                    <span className="min-w-0">
                      {t(language, "downloads.selectedVoices")}
                      <span className="block text-sm font-normal text-muted-foreground">
                        {voiceNames || t(language, "downloads.checking")}
                      </span>
                    </span>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
                </summary>
                <Button asChild variant="outline" className="mb-3">
                  <a href="#/settings/audio">{t(language, "downloads.changeVoices")}</a>
                </Button>
              </details>
            )}
            {!job && (
              <>
                <details
                  data-testid="download-selection"
                  onToggle={(event) => setCustomizing(event.currentTarget.open)}
                >
                  <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                    <span className="flex min-w-0 items-center gap-2">
                      <Download size={20} aria-hidden="true" />
                      {t(language, "downloads.chooseDownloads")}
                    </span>
                    <ChevronDown size={18} aria-hidden="true" className="shrink-0" />
                  </summary>
                  <fieldset disabled={busy || isAnyJobActive} className="min-w-0 border-t border-border/40">
                    <legend className="sr-only">{t(language, "downloads.chooseDownloads")}</legend>
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex min-h-12 cursor-pointer flex-wrap items-center gap-3 border-b border-border/40 py-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="size-5 shrink-0 accent-primary focus-visible:ring-[3px] focus-visible:ring-ring"
                          checked={selected.includes(category.id)}
                          disabled={!category.available}
                          onChange={(event) => {
                            setFailedId(null);
                            setNoticeKind(null);
                            setSelected((values) =>
                              event.target.checked
                                ? [...values, category.id]
                                : values.filter((id) => id !== category.id),
                            );
                          }}
                        />
                        {category.id === "mushaf" ? (
                          <BookOpen size={20} aria-hidden="true" className="shrink-0 text-primary" />
                        ) : (
                          <Headphones size={20} aria-hidden="true" className="shrink-0 text-primary" />
                        )}
                        <span className="min-w-0 flex-1">{category.title}</span>
                        <span className="text-muted-foreground">
                          {busy
                            ? t(language, "downloads.checking")
                            : category.ready
                              ? t(language, "downloads.downloaded")
                              : category.available
                                ? numeric(category.remaining)
                                : t(language, "downloads.unavailable")}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="min-w-0">
                    {" "}
                    <MushafDownloadSelection
                      language={language}
                      disabled={busy || isAnyJobActive}
                      active={false}
                      onCancel={cancelDownloadSession}
                      onDownload={(first, last) =>
                        void runDownload(
                          "mushaf-pages",
                          getMushafDownloadBytes(first, last),
                          async (controller) => {
                            await downloadMushaf({
                              signal: controller.signal,
                              pages: Array.from({ length: last - first + 1 }, (_, index) => first + index),
                              onProgress: updateProgress("mushaf-pages"),
                            });
                          },
                          [first, last],
                        )
                      }
                    />
                  </div>
                </details>
              </>
            )}
            {job && (
              <details className="group border-t border-border/40" data-testid="download-transfer-details">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                  {t(language, "downloads.transferDetails")}
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <div className="space-y-2 pb-2 text-sm text-muted-foreground">
                  {job.detail && (
                    <>
                      <p>
                        {t(language, "downloads.recordingCoverage", {
                          completed: formatNumerals(job.detail.completedFiles, language),
                          total: formatNumerals(job.detail.totalFiles, language),
                        })}
                      </p>
                      <p>
                        {t(
                          language,
                          job.detail.phase === "verifying"
                            ? "downloads.verifyingFile"
                            : job.detail.phase === "retrying"
                              ? "downloads.retryingFile"
                              : "downloads.receivingFile",
                          {
                            file: formatNumerals(job.detail.fileNumber, language),
                            total: formatNumerals(job.detail.totalFiles, language),
                            attempt: formatNumerals(job.detail.attempt, language),
                          },
                        )}
                      </p>
                    </>
                  )}
                  <p>
                    {job.group === "mushaf" || job.id.startsWith("mushaf") ? (
                      t(language, "downloads.mushafProgressValue", {
                        completed: formatNumerals(job.completed, language),
                        total: formatNumerals(job.total, language),
                      })
                    ) : job.archive ? (
                      t(language, "downloads.archiveProgress", {
                        completed: formatNumerals(job.completed, language),
                        total: formatNumerals(job.total, language),
                      })
                    ) : (
                      <bdi dir="ltr">
                        {formatMegabytes(job.completed, language)} / {formatMegabytes(job.total, language)}
                      </bdi>
                    )}
                  </p>
                </div>
              </details>
            )}
          </DownloadOverview>
        </div>
        <p role="status" aria-atomic="true" className="sr-only">
          {job ? `${t(language, transferPhase)} · ${activeTitle}` : ""}
        </p>
        <div className="space-y-2" aria-busy={removing}>
          <p role="alert" className="text-sm font-semibold text-destructive">
            {errorMessage}
          </p>
          <p role="status" className="text-sm text-foreground">
            {removing ? t(language, "downloads.removing") : successMessage}
          </p>
        </div>
        {
          <Card as="section">
            <h2 className="mb-2 text-subtitle font-semibold">{t(language, "downloads.contentSummary")}</h2>
            <ul className="divide-y divide-border/40" data-testid="download-coverage">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>{category.title}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {(!busy && category.ready) || job?.finishedGroups?.includes(category.id) ? (
                      <Check size={18} aria-hidden="true" />
                    ) : null}
                    {t(
                      language,
                      (job?.group ?? job?.id) === category.id
                        ? "downloads.downloading"
                        : job?.finishedGroups?.includes(category.id)
                          ? "downloads.downloaded"
                          : busy
                            ? "downloads.checking"
                            : !status
                              ? "downloads.unavailable"
                              : category.ready
                                ? "downloads.downloaded"
                                : !category.available
                                  ? "downloads.unavailable"
                                  : category.completed > 0
                                    ? "downloads.partial"
                                    : "downloads.incomplete",
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        }
        {status && !status.serviceWorkerReady && (
          <p className="text-sm text-muted-foreground">{t(language, "downloads.checkApp")}</p>
        )}
        <Card as="section" padding="none">
          <details data-testid="download-management" onToggle={(event) => setManagementOpen(event.currentTarget.open)}>
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              <span className="flex min-w-0 items-center gap-2">
                <Database size={20} aria-hidden="true" />
                {t(language, "downloads.manageDownloads")}
              </span>
              <ChevronDown size={18} aria-hidden="true" className="shrink-0" />
            </summary>
            {managementOpen && (
              <div className="space-y-4 border-t border-border/40 p-4">
                {groupedResources.map((resource, index) => (
                  <section
                    key={resource.id}
                    className="border-b border-border/40 py-2"
                    data-testid={"download-category-" + resource.id}
                  >
                    {audioRows([resource], true)}
                    <details className="group border-t border-border/40">
                      <summary
                        className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        aria-label={t(language, "downloads.manage") + " · " + t(language, resource.titleKey)}
                      >
                        {t(language, "downloads.manage")}
                        <ChevronDown
                          size={16}
                          aria-hidden="true"
                          className="transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <p className="text-xs text-muted-foreground">{t(language, "downloads.availableOnly")}</p>
                      {index === 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t(language, "downloads.sharedRecordings")}
                        </p>
                      )}
                      <div className="divide-y divide-border/40">
                        {audioRows(index === 0 ? collections.slice(0, 4) : collections.slice(4))}
                      </div>
                    </details>
                  </section>
                ))}
                <section className="border-b border-border/40 py-2" data-testid="download-category-mushaf">
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
                        : checkingMushaf
                          ? t(language, "downloads.checking")
                          : collectionState(
                              mushafStatus
                                ? {
                                    completed: mushafStatus?.downloadedPages ?? 0,
                                    total: 604,
                                    remainingBytes: mushafBytes,
                                  }
                                : undefined,
                              true,
                            )
                    }
                    feedback={
                      mushafStatus && (
                        <>
                          <p>
                            {t(language, "downloads.mushafProgressValue", {
                              completed: formatNumerals(mushafStatus?.downloadedPages ?? 0, language),
                              total: formatNumerals(604, language),
                            })}{" "}
                            · {numeric(mushafStatus.downloadedBytes)}
                          </p>
                          {failedId === "mushaf" && <p className="text-destructive">{errorMessage}</p>}
                        </>
                      )
                    }
                    size={numeric(job?.id === "mushaf" ? job.transferredBytes : mushafStatus ? mushafBytes : undefined)}
                    completed={job?.id === "mushaf" ? job.completed : (mushafStatus?.downloadedPages ?? 0)}
                    total={604}
                    language={language}
                    direction={direction}
                    compact
                    showTransfer={false}
                    hideRemove
                    disabled={isLoading || checkingMushaf || isAnyJobActive}
                    active={job?.id === "mushaf"}
                    action={t(
                      language,
                      failedId === "mushaf"
                        ? mushafStatus?.downloadedPages
                          ? "downloads.resumeDownload"
                          : "downloads.retry"
                        : mushafStatus?.downloadedPages === 604
                          ? "downloads.downloaded"
                          : mushafStatus?.downloadedPages
                            ? "downloads.resumeResource"
                            : "downloads.downloadResource",
                    )}
                    onDownload={() =>
                      void runDownload("mushaf", mushafBytes, async (controller) => {
                        await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("mushaf") });
                      })
                    }
                    onCancel={() => cancelDownloadSession()}
                    onRemove={() => void removeResource("mushaf")}
                  />
                  <details className="group border-t border-border/40">
                    <summary
                      className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      aria-label={t(language, "downloads.manage") + " · " + t(language, "downloads.pagesTitle")}
                    >
                      {t(language, "downloads.manage")}
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <OfflineResourceRow
                      id="mushaf-management"
                      title={t(language, "downloads.pagesTitle")}
                      detail=""
                      state={t(language, "downloads.mushafProgressValue", {
                        completed: formatNumerals(mushafStatus?.downloadedPages ?? 0, language),
                        total: formatNumerals(604, language),
                      })}
                      size={numeric(mushafStatus ? mushafBytes : undefined)}
                      completed={mushafStatus?.downloadedPages ?? 0}
                      total={604}
                      language={language}
                      direction={direction}
                      disabled={isLoading || isAnyJobActive}
                      active={job?.id === "mushaf"}
                      compact
                      showTransfer={false}
                      showDownload={false}
                      action={t(language, "downloads.downloadResource")}
                      onDownload={() =>
                        void runDownload("mushaf", mushafBytes, async (controller) => {
                          await downloadMushaf({ signal: controller.signal, onProgress: updateProgress("mushaf") });
                        })
                      }
                      onCancel={() => cancelDownloadSession()}
                      onRemove={() => void removeResource("mushaf")}
                    />
                  </details>
                </section>

                <AudioFileExports
                  zikrs={allAudioZikrs}
                  preferences={audioPreferences}
                  language={language}
                  disabled={isLoading || isAnyJobActive}
                  revision={status}
                />
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
                  <Button
                    ref={archiveButtonRef}
                    variant="outline"
                    className="h-auto min-h-11 max-w-full whitespace-normal py-2"
                    disabled={isLoading || isAnyJobActive || !status || !collections.some((r) => r.byteSize > 0)}
                    aria-busy={job?.id === "archive" || session.result?.id === "archive"}
                    onClick={(event) => {
                      archiveOwnedFocus.current = document.activeElement === event.currentTarget;
                      if (job?.id === "archive") {
                        cancelDownloadSession();
                        return;
                      }
                      startArchive();
                    }}
                  >
                    {t(language, "downloads.archiveAll")}
                  </Button>
                </div>

                {/* Card 4: Technical Diagnostics in an expandable disclosure */}
                <details className="group rounded-2xl border border-border/60 bg-card p-4 transition-colors">
                  <summary className="flex min-h-11 cursor-pointer select-none flex-wrap items-center justify-between gap-2 rounded-lg text-subtitle font-semibold text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                    <span className="flex min-w-0 items-center gap-2">
                      <Database size={18} className="text-primary" aria-hidden="true" />
                      {t(language, "downloads.storageDetails")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {status?.serviceWorkerReady
                          ? t(language, "downloads.active")
                          : t(language, "downloads.inactive")}
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
                      {t(
                        language,
                        status?.serviceWorkerReady ? "downloads.appOfflineReady" : "downloads.appOfflinePending",
                      )}
                    </p>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground" role="status">
                        {t(language, "downloads.checking")}
                      </p>
                    ) : status ? (
                      <dl className="space-y-2 text-sm">
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.serviceWorker")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {status.serviceWorkerReady
                              ? t(language, "downloads.active")
                              : t(language, "downloads.inactive")}
                          </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.downloadedMushaf")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {formatNumerals(mushafStatus?.downloadedPages ?? 0, language)} /{" "}
                            {formatNumerals(604, language)}
                          </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.caches")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">{status.cacheCount}</dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.storageUsed")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {formatMegabytes(status.usageBytes, language)}
                          </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.quota")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {formatMegabytes(status.quotaBytes, language)}
                          </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">{t(language, "downloads.downloadedAudio")}</dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {status.downloadedAudioAssets} · {formatMegabytes(status.downloadedAudioBytes, language)}
                          </dd>
                        </div>
                        <div className="flex flex-wrap justify-between gap-3">
                          <dt className="min-w-0 text-muted-foreground">
                            {t(language, "downloads.downloadedMushafEstimate")}
                          </dt>
                          <dd className="min-w-0 font-medium text-foreground">
                            {mushafStatus?.downloadedPages ?? 0} ·{" "}
                            {formatMegabytes(mushafStatus?.downloadedBytes, language)}
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
            )}
          </details>
        </Card>
      </div>
    </div>
  );
}

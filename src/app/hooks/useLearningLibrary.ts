import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { readLearningState, subscribeLearningState, updateLearningState } from "../learning/learningState";
import { fetchLearningAsset, learningOfflineStatus, type LearningOfflineStatus } from "../learning/learningAssets";
import { getLearningDownload, subscribeLearningDownload } from "../learning/learningDownloads";
import type { LearningResource, PdfEdition } from "../learning/types";
import { learningEditionId } from "../learning/types";
import { isLearningResourceAvailable } from "../learning/catalogue";
import { saveFileToDevice } from "../share/shareDispatcher";

export const useLearningState = () => useSyncExternalStore(subscribeLearningState, readLearningState);
export const useLearningDownload = () => useSyncExternalStore(subscribeLearningDownload, getLearningDownload);

export function useLearningOffline(resources: LearningResource[]) {
  const job = useLearningDownload();
  const [statuses, setStatuses] = useState<Record<string, LearningOfflineStatus>>({});
  const generation = useRef(0);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  const refresh = useCallback(async () => {
    const epoch = ++generation.current;
    const entries = await Promise.all(
      resources.map(async (resource) => [learningEditionId(resource), await learningOfflineStatus(resource)] as const),
    );
    if (epoch === generation.current) setStatuses(Object.fromEntries(entries));
  }, [resources]);
  useEffect(() => {
    void refresh();
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      invalidate();
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh, job?.phase, invalidate]);
  return { statuses, refresh, job };
}

export function useLearningPdf(resource: LearningResource) {
  const [edition, setEdition] = useState<PdfEdition>("light");
  const [phase, setPhase] = useState<"idle" | "busy" | "saved" | "failed">("idle");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    setPhase("idle");
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [resource]);
  const download = async () => {
    if (controller.current) return;
    if (!isLearningResourceAvailable(resource)) {
      setPhase("failed");
      return;
    }
    const request = new AbortController();
    controller.current = request;
    setPhase("busy");
    try {
      const asset = resource.pdfs[edition];
      const bytes = await fetchLearningAsset(asset, request.signal, false);
      request.signal.throwIfAborted();
      await saveFileToDevice(
        new File([bytes], `${resource.id}${resource.language === "en" ? "-en" : ""}-${edition}.pdf`, {
          type: asset.mime,
        }),
      );
      if (!request.signal.aborted) setPhase("saved");
    } catch {
      if (!request.signal.aborted) setPhase("failed");
    } finally {
      if (controller.current === request) controller.current = null;
    }
  };
  return { edition, setEdition, phase, download };
}

export function useLearningPosition(
  resource: LearningResource,
  unitId: string | undefined,
  scroll: RefObject<HTMLElement>,
  onStorageFailure: () => void,
) {
  useEffect(() => {
    const element = scroll.current;
    if (!unitId || !element) return;
    const identity = learningEditionId(resource);
    const previous = readLearningState()[identity]?.position;
    let offset = previous?.unitId === unitId ? previous.offset : 0;
    if (!updateLearningState(identity, (state) => ({ ...state, position: { unitId, offset } }))) onStorageFailure();
    let restored = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const persist = () => {
      if (!restored) return;
      if (!updateLearningState(identity, (state) => ({ ...state, position: { unitId, offset } }))) onStorageFailure();
    };
    const frame = requestAnimationFrame(() => {
      element.scrollTop = offset * Math.max(0, element.scrollHeight - element.clientHeight);
      restored = true;
    });
    const onScroll = () => {
      if (!restored) return;
      const maximum = element.scrollHeight - element.clientHeight;
      offset = maximum > 0 ? element.scrollTop / maximum : 0;
      clearTimeout(timeout);
      timeout = setTimeout(persist, 500);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearTimeout(timeout);
        persist();
      }
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", persist);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      persist();
      element.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [resource, unitId, scroll, onStorageFailure]);
}

import { clearLearningCache, fetchLearningAsset, learningOfflineStatus } from "./learningAssets";
import { hasDownloadSpace } from "../content/downloadStorage";
import { isLearningResourceAvailable } from "./catalogue";
import { learningEditionId, type LearningResource, type LearningEditionId } from "./types";

export interface LearningDownload {
  resourceId: LearningEditionId;
  phase: "saving" | "ready" | "failed" | "cancelled";
  completed: number;
  total: number;
}
let job: LearningDownload | null = null;
let controller: AbortController | undefined;
const listeners = new Set<() => void>();
export const getLearningDownload = () => job;
export function subscribeLearningDownload(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function publish(next: LearningDownload) {
  job = next;
  for (const notify of listeners) notify();
}

/** Document-owned: changing screens never abandons a requested download. */
export async function startLearningDownload(resource: LearningResource) {
  if (job?.phase === "saving") return;
  controller = new AbortController();
  const { signal } = controller;
  const assets = [resource.pack, ...resource.images];
  const next: LearningDownload = {
    resourceId: learningEditionId(resource),
    phase: "saving",
    completed: 0,
    total: assets.length,
  };
  if (!isLearningResourceAvailable(resource)) {
    publish({ ...next, phase: "failed" });
    return;
  }
  publish(next);
  let completed = 0;
  try {
    if (!(await hasDownloadSpace(assets.reduce((sum, asset) => sum + asset.bytes, 0))))
      throw new Error("Insufficient storage");
    for (const asset of assets) {
      await fetchLearningAsset(asset, signal, true, learningEditionId(resource));
      signal.throwIfAborted();
      publish({ ...next, completed: ++completed });
    }
    if (!(await learningOfflineStatus(resource)).complete) throw new Error("Offline verification failed");
    signal.throwIfAborted();
    publish({ ...next, completed, phase: "ready" });
  } catch {
    publish({ ...next, completed, phase: signal.aborted ? "cancelled" : "failed" });
  }
}
export function cancelLearningDownload() {
  controller?.abort();
}

export async function clearLearningDownloads() {
  cancelLearningDownload();
  await clearLearningCache();
}

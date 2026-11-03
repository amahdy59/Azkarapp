import { useSyncExternalStore } from "react";
import type { AudioDownloadProgress } from "../audio/audioOfflineCache";

export type DownloadJob = {
  id: string;
  completed: number;
  total: number;
  transferredBytes?: number;
  detail?: AudioDownloadProgress;
  archive?: boolean;
};
type Result = { id: string; status: "complete" | "cancelled" | "failed"; error?: unknown };
type Snapshot = { job: DownloadJob | null; result: Result | null; revision: number };
const listeners = new Set<() => void>();
let snapshot: Snapshot = { job: null, result: null, revision: 0 };
let controller: AbortController | null = null;
let progressTimer: ReturnType<typeof setTimeout> | undefined;
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getDownloadSession = () => snapshot;
export const cancelDownloadSession = () => controller?.abort();
export function clearDownloadNotice() {
  if (!snapshot.result) return;
  snapshot = { ...snapshot, result: null };
  emit();
}
export function updateDownloadSession(job: DownloadJob) {
  if (!controller || snapshot.job?.id !== job.id) return;
  snapshot = { ...snapshot, job };
  // Preserve exact bytes while bounding React updates during fast streams.
  if (!progressTimer && document.visibilityState !== "hidden")
    progressTimer = setTimeout(() => {
      progressTimer = undefined;
      if (document.visibilityState !== "hidden") emit();
    }, 80);
}
export function useDownloadSession() {
  return useSyncExternalStore(subscribe, getDownloadSession, getDownloadSession);
}
/** A document-owned transfer outlives route components; reload requires explicit resume. */
export async function runDownloadSession(job: DownloadJob, work: (controller: AbortController) => Promise<void>) {
  if (controller) return;
  const active = new AbortController();
  controller = active;
  snapshot = { job, result: null, revision: snapshot.revision };
  emit();
  const clear = () => active.abort();
  const visible = () => {
    clearTimeout(progressTimer);
    progressTimer = undefined;
    if (document.visibilityState !== "hidden") emit();
  };
  window.addEventListener("azkar-private-data-cleared", clear);
  document.addEventListener("visibilitychange", visible);
  let result: Result;
  try {
    await work(active);
    active.signal.throwIfAborted();
    result = { id: job.id, status: "complete" };
  } catch (error) {
    result = { id: job.id, status: active.signal.aborted ? "cancelled" : "failed", error };
  } finally {
    window.removeEventListener("azkar-private-data-cleared", clear);
    document.removeEventListener("visibilitychange", visible);
    clearTimeout(progressTimer);
    progressTimer = undefined;
    controller = null;
  }
  snapshot = { job: null, result, revision: snapshot.revision + 1 };
  emit();
  return result;
}

import { useSyncExternalStore } from "react";
import type { AudioDownloadProgress } from "../audio/audioOfflineCache";

export type DownloadJob = {
  id: string;
  completed: number;
  total: number;
  transferredBytes?: number;
  detail?: AudioDownloadProgress;
  archive?: boolean;
  selection?: readonly string[];
  group?: string;
  groupIndex?: number;
  groupCount?: number;
  finishedGroups?: readonly string[];
  pageRange?: readonly [number, number];
  cancelling?: boolean;
};
type Result = {
  id: string;
  status: "complete" | "cancelled" | "failed";
  error?: unknown;
  selection?: readonly string[];
  pageRange?: readonly [number, number];
};
export type DownloadReadiness =
  | { status: "unchecked" | "busy" }
  | {
      status: "checked";
      readyGroups: number;
      totalGroups: number;
      usageBytes?: number;
      duaVoiceId: string;
      quranReciterId: string;
    };
type Snapshot = { job: DownloadJob | null; result: Result | null; revision: number; readiness: DownloadReadiness };
const listeners = new Set<() => void>();
let snapshot: Snapshot = { job: null, result: null, revision: 0, readiness: { status: "unchecked" } };
let controller: AbortController | null = null;
let progressTimer: ReturnType<typeof setTimeout> | undefined;
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getDownloadSession = () => snapshot;
/** Reuse a completed check; menu subscribers never scan files or persist a readiness claim. */
export function publishDownloadReadiness(readiness: Extract<DownloadReadiness, { status: "checked" }>) {
  if (controller) return;
  snapshot = { ...snapshot, readiness };
  emit();
}
export function invalidateDownloadReadiness() {
  snapshot = { ...snapshot, readiness: { status: controller ? "busy" : "unchecked" } };
  emit();
}
const getDownloadReadiness = () => snapshot.readiness;
export function useDownloadReadiness() {
  return useSyncExternalStore(subscribe, getDownloadReadiness, getDownloadReadiness);
}
if (typeof window !== "undefined") window.addEventListener("azkar-private-data-cleared", invalidateDownloadReadiness);
export const cancelDownloadSession = () => {
  if (!controller || controller.signal.aborted) return;
  if (snapshot.job) snapshot = { ...snapshot, job: { ...snapshot.job, cancelling: true } };
  emit();
  controller.abort();
};
export function clearDownloadNotice() {
  if (!snapshot.result) return;
  snapshot = { ...snapshot, result: null };
  emit();
}
export function updateDownloadSession(job: DownloadJob) {
  if (!controller || snapshot.job?.id !== job.id) return;
  snapshot = { ...snapshot, job: { ...snapshot.job, ...job } };
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
  snapshot = { job, result: null, revision: snapshot.revision, readiness: { status: "busy" } };
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
  snapshot = {
    job: null,
    result: { ...result, selection: job.selection, pageRange: job.pageRange },
    revision: snapshot.revision + 1,
    readiness: { status: "unchecked" },
  };
  emit();
  return result;
}

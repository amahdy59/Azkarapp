/** Optional cache work must not pull the audio catalogue into a fresh Home opening. */
export async function hasAudioCacheMaintenance(): Promise<boolean> {
  if (!("caches" in window)) return false;
  try {
    const registry: unknown = JSON.parse(localStorage.getItem("azkar.audio-downloads.v1") ?? "{}");
    if (registry && typeof registry === "object" && Object.keys(registry).length > 0) return true;
  } catch {
    // A damaged registry still needs the existing normalization boundary.
    return true;
  }
  return (await caches.keys()).some((name) => name.startsWith("azkar-audio-v"));
}

/** Leave a paint between commit and optional work, with cancellable fallbacks. */
export function scheduleIdleAfterPaint(task: () => void, { timeout = 10_000, fallbackDelay = 1500 } = {}) {
  let cancelled = false;
  let frame = 0;
  let idle = 0;
  let timer = 0;
  const run = () => {
    if (!cancelled) task();
  };
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout });
      else timer = window.setTimeout(run, fallbackDelay);
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

/** Called after the application commits; paint and idle slots give reading priority. */
export function scheduleStartupMaintenance() {
  let cancelled = false;
  const maintain = async () => {
    if (cancelled) return;
    try {
      const qcf = await import("./content/qcfMushaf");
      if (cancelled) return;
      await qcf.discardRetiredCaches();
      if (!(await hasAudioCacheMaintenance()) || cancelled) return;
      const audio = await import("./audio/audioOfflineCache");
      if (!cancelled) await audio.cleanupStaleAudioDownloads();
    } catch {
      // Offline cleanup is best-effort. Reading and retained downloads take priority.
    }
  };
  const cancelScheduled = scheduleIdleAfterPaint(() => void maintain());
  return () => {
    cancelled = true;
    cancelScheduled();
  };
}

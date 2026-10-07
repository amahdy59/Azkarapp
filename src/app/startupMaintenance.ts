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

/** Called after the application commits; a frame and idle slot give reading priority. */
export function scheduleStartupMaintenance() {
  let cancelled = false;
  let idle = 0;
  let timer = 0;
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
  const frame = requestAnimationFrame(() => {
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(() => void maintain(), { timeout: 10_000 });
    else timer = window.setTimeout(() => void maintain(), 1500);
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}

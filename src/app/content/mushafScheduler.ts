export type MushafPriority = "foreground" | "next" | "download" | "prefetch";
const rank: Record<MushafPriority, number> = { foreground: 0, next: 1, download: 2, prefetch: 3 };
type Job = {
  key: string;
  priority: MushafPriority;
  run: () => Promise<unknown>;
  reject: (error: unknown) => void;
  signal?: AbortSignal;
  cleanup: () => void;
};
const queued: Job[] = [];
const requested = new Map<string, MushafPriority>();
let running = 0;
let background = 0;
let listening = false;

function limits() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  const constrained =
    connection?.saveData ||
    connection?.effectiveType?.includes("2g") ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  return { total: constrained ? 2 : 4, background: constrained ? 1 : 2 };
}

function pump() {
  const limit = limits();
  while (running < limit.total) {
    queued.sort((a, b) => rank[a.priority] - rank[b.priority]);
    const index = queued.findIndex(
      (job) =>
        job.priority === "foreground" ||
        (background < limit.background && (!document.hidden || job.priority === "download")),
    );
    if (index < 0) return;
    const job = queued.splice(index, 1)[0]!;
    job.cleanup();
    if (job.signal?.aborted) {
      job.reject(job.signal.reason);
      continue;
    }
    running++;
    const isBackground = job.priority !== "foreground";
    if (isBackground) background++;
    void job.run().finally(() => {
      running--;
      if (isBackground) background--;
      pump();
    });
  }
}

/** Promotes shared reader/prefetch work without cancelling another consumer. */
export function promoteMushafRequest(key: string, priority: MushafPriority) {
  const previous = requested.get(key);
  if (!previous || rank[priority] < rank[previous]) requested.set(key, priority);
  for (const job of queued) if (job.key === key && rank[priority] < rank[job.priority]) job.priority = priority;
  pump();
}

/** Leaves capacity for foreground reading even during a full download. */
export function scheduleMushafRequest<T>(
  key: string,
  work: () => Promise<T>,
  priority: MushafPriority = "foreground",
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) return Promise.reject(signal.reason);
  if (!listening && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", pump);
    listening = true;
  }
  return new Promise<T>((resolve, reject) => {
    const cancel = () => {
      const index = queued.indexOf(job);
      if (index >= 0) {
        queued.splice(index, 1);
        job.cleanup();
        reject(signal?.reason);
      }
    };
    const job: Job = {
      key,
      priority: requested.get(key) ?? priority,
      signal,
      cleanup: () => signal?.removeEventListener("abort", cancel),
      reject,
      run: async () => {
        try {
          resolve(await work());
        } catch (error) {
          reject(error);
        } finally {
          requested.delete(key);
        }
      },
    };
    signal?.addEventListener("abort", cancel, { once: true });
    queued.push(job);
    pump();
  });
}

/** Only queued speculation is disposable; foreground and explicit downloads survive. */
export function trimMushafPrefetch(pages: readonly number[]) {
  const allowed = new Set(pages.flatMap((page) => [`page:${page}`, `font:${page}`]));
  for (let i = queued.length - 1; i >= 0; i--) {
    const job = queued[i]!;
    if ((job.priority === "prefetch" || job.priority === "next") && !allowed.has(job.key)) {
      queued.splice(i, 1);
      job.cleanup();
      requested.delete(job.key);
      job.reject(new DOMException("Obsolete Mushaf prefetch", "AbortError"));
    }
  }
}

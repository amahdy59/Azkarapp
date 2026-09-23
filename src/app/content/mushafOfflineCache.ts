import { FONT_CACHE_NAME, getMushafPageUrl, getQcfFontUrl, MUSHAF_CACHE_NAME } from "./qcfMushaf";

const PAGE_COUNT = 604;
const CONCURRENCY_LIMIT = 8;

function pageUrl(page: number) {
  return new URL(getMushafPageUrl(page), window.location.href).toString();
}

function fontUrl(page: number) {
  return getQcfFontUrl(page);
}

export async function getMushafDownloadStatus(): Promise<{
  downloadedPages: number;
  downloadedFonts: number;
  totalPages: number;
  isComplete: boolean;
}> {
  if (!("caches" in window)) {
    return { downloadedPages: 0, downloadedFonts: 0, totalPages: PAGE_COUNT, isComplete: false };
  }
  try {
    const pageCache = await caches.open(MUSHAF_CACHE_NAME);
    const fontCache = await caches.open(FONT_CACHE_NAME);
    const [pageKeys, fontKeys] = await Promise.all([pageCache.keys(), fontCache.keys()]);
    const pageSet = new Set<number>();
    for (const request of pageKeys) {
      const match = request.url.match(/\/data\/mushaf\/(\d+)\.json(?:\?.*)?$/);
      if (match) pageSet.add(Number(match[1]));
    }
    const fontSet = new Set<number>();
    for (const request of fontKeys) {
      const match = request.url.match(/\/p(\d+)\.woff2$/);
      if (match) fontSet.add(Number(match[1]));
    }
    let trulyReadyPages = 0;
    for (const page of pageSet) {
      if (fontSet.has(page)) {
        trulyReadyPages++;
      }
    }
    return {
      downloadedPages: trulyReadyPages,
      downloadedFonts: fontSet.size,
      totalPages: PAGE_COUNT,
      isComplete: trulyReadyPages >= PAGE_COUNT,
    };
  } catch {
    return { downloadedPages: 0, downloadedFonts: 0, totalPages: PAGE_COUNT, isComplete: false };
  }
}

export async function removeDownloadedMushaf(): Promise<void> {
  if (!("caches" in window)) return;
  await Promise.all([caches.delete(MUSHAF_CACHE_NAME), caches.delete(FONT_CACHE_NAME)]);
}

export async function downloadMushaf(
  options: { signal?: AbortSignal; onProgress?: (completed: number, total: number) => void } = {},
) {
  if (!("caches" in window)) throw new Error("Cache API unavailable");
  const [pageCache, fontCache] = await Promise.all([caches.open(MUSHAF_CACHE_NAME), caches.open(FONT_CACHE_NAME)]);

  let completed = 0;
  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  let failure: unknown;
  const fail = (error: unknown) => {
    failure ??= error;
    controller.abort();
  };
  const pages = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1);

  const downloadSinglePage = async (page: number) => {
    if (controller.signal.aborted) throw new DOMException("Download cancelled", "AbortError");

    const pUrl = pageUrl(page);
    const fUrl = fontUrl(page);

    const [hasPage, hasFont] = await Promise.all([pageCache.match(pUrl), fontCache.match(fUrl)]);

    const fetchTasks: Promise<void>[] = [];

    if (!hasPage) {
      fetchTasks.push(
        (async () => {
          const response = await fetch(pUrl, { signal: controller.signal });
          if (!response.ok) throw new Error(`Mushaf page ${page} failed: ${response.status}`);
          await pageCache.put(pUrl, response);
        })(),
      );
    }

    if (!hasFont) {
      fetchTasks.push(
        (async () => {
          const fontResponse = await fetch(fUrl, { signal: controller.signal });
          if (!fontResponse.ok) throw new Error(`Mushaf font ${page} failed: ${fontResponse.status}`);
          await fontCache.put(fUrl, fontResponse);
        })(),
      );
    }

    if (fetchTasks.length > 0) {
      // Drain sibling requests before exposing a retry/removal action to the UI.
      const results = await Promise.allSettled(
        fetchTasks.map((task) =>
          task.catch((error) => {
            fail(error);
            throw error;
          }),
        ),
      );
      const rejected = results.find((result) => result.status === "rejected");
      if (rejected?.status === "rejected") throw rejected.reason;
    }

    completed += 1;
    options.onProgress?.(completed, PAGE_COUNT);
  };

  // Run with bounded concurrency for fast parallel downloads
  let index = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, pages.length) }, async () => {
    while (index < pages.length) {
      const currentIndex = index++;
      const page = pages[currentIndex]!;
      try {
        await downloadSinglePage(page);
      } catch (error) {
        fail(error);
        break;
      }
    }
  });

  try {
    await Promise.all(workers);
    if (failure) throw failure;
  } finally {
    options.signal?.removeEventListener("abort", cancel);
  }
}

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
    const downloadedPages = pageKeys.filter((request) =>
      /\/data\/mushaf\/\d+\.json(?:\?.*)?$/.test(request.url),
    ).length;
    const downloadedFonts = fontKeys.filter((request) => /\/p\d+\.woff2$/.test(request.url)).length;
    return {
      downloadedPages,
      downloadedFonts,
      totalPages: PAGE_COUNT,
      isComplete: downloadedPages >= PAGE_COUNT && downloadedFonts >= PAGE_COUNT,
    };
  } catch {
    return { downloadedPages: 0, downloadedFonts: 0, totalPages: PAGE_COUNT, isComplete: false };
  }
}

export async function removeDownloadedMushaf(): Promise<void> {
  if (!("caches" in window)) return;
  try {
    await Promise.all([caches.delete(MUSHAF_CACHE_NAME), caches.delete(FONT_CACHE_NAME)]);
  } catch {
    /* ignore deletion errors */
  }
}

export async function downloadMushaf(
  options: { signal?: AbortSignal; onProgress?: (completed: number, total: number) => void } = {},
) {
  if (!("caches" in window)) throw new Error("Cache API unavailable");
  const [pageCache, fontCache] = await Promise.all([caches.open(MUSHAF_CACHE_NAME), caches.open(FONT_CACHE_NAME)]);

  let completed = 0;
  const pages = Array.from({ length: PAGE_COUNT }, (_, i) => i + 1);

  const downloadSinglePage = async (page: number) => {
    if (options.signal?.aborted) throw new DOMException("Download cancelled", "AbortError");

    const pUrl = pageUrl(page);
    const fUrl = fontUrl(page);

    const [hasPage, hasFont] = await Promise.all([pageCache.match(pUrl), fontCache.match(fUrl)]);

    const fetchTasks: Promise<void>[] = [];

    if (!hasPage) {
      fetchTasks.push(
        (async () => {
          const response = await fetch(pUrl, { signal: options.signal });
          if (!response.ok) throw new Error(`Mushaf page ${page} failed: ${response.status}`);
          await pageCache.put(pUrl, response);
        })(),
      );
    }

    if (!hasFont) {
      fetchTasks.push(
        (async () => {
          const fontResponse = await fetch(fUrl, { signal: options.signal });
          if (!fontResponse.ok) throw new Error(`Mushaf font ${page} failed: ${fontResponse.status}`);
          await fontCache.put(fUrl, fontResponse);
        })(),
      );
    }

    if (fetchTasks.length > 0) {
      await Promise.all(fetchTasks);
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
      await downloadSinglePage(page);
    }
  });

  await Promise.all(workers);
}

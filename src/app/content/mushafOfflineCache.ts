const MUSHAF_CACHE_NAME = "azkar-mushaf-v1";
const FONT_CACHE_NAME = "azkar-qcf-fonts-v1";
const PAGE_COUNT = 604;
const CONCURRENCY_LIMIT = 8;
const QCF_FONT_ROOT = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

function pageUrl(page: number) {
  const base = import.meta.env.BASE_URL || "/";
  return new URL(`${base.endsWith("/") ? base : `${base}/`}data/mushaf/${page}.json`, window.location.href).toString();
}

function fontUrl(page: number) {
  return `${QCF_FONT_ROOT}/p${page}.woff2`;
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
          try {
            const fontResponse = await fetch(fUrl, { signal: options.signal });
            if (fontResponse.ok) {
              await fontCache.put(fUrl, fontResponse);
            }
          } catch {
            /* Font download non-fatal for individual page; will fallback to unicode if network down */
          }
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

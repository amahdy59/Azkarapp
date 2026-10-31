import {
  FONT_CACHE_NAME,
  getMushafPageUrl,
  getQcfFontUrl,
  MUSHAF_CACHE_NAME,
  readMushafPageResponse,
  readQcfFontResponse,
} from "./qcfMushaf";
import { fetchNativeBinaryResource } from "@azkar/native-mushaf-download";

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
    const pageSet = new Set(pageKeys.map((key) => key.url));
    const fontSet = new Set(fontKeys.map((key) => key.url));
    let trulyReadyPages = 0;
    let downloadedFonts = 0;
    for (let first = 1; first <= PAGE_COUNT; first += CONCURRENCY_LIMIT) {
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY_LIMIT, PAGE_COUNT - first + 1) }, async (_, offset) => {
          const page = first + offset;
          const pUrl = pageUrl(page);
          const fUrl = new URL(fontUrl(page), window.location.href).href;
          const [hasPage, hasFont] = await Promise.all([
            pageSet.has(pUrl) && validCachedResource(pageCache, pUrl, readMushafPageResponse),
            fontSet.has(fUrl) && validCachedResource(fontCache, fUrl, readQcfFontResponse),
          ]);
          if (hasFont) downloadedFonts++;
          if (hasPage && hasFont) trulyReadyPages++;
        }),
      );
    }
    return {
      downloadedPages: trulyReadyPages,
      downloadedFonts,
      totalPages: PAGE_COUNT,
      isComplete: trulyReadyPages >= PAGE_COUNT,
    };
  } catch {
    return { downloadedPages: 0, downloadedFonts: 0, totalPages: PAGE_COUNT, isComplete: false };
  }
}

async function validCachedResource(cache: Cache, url: string, read: (response: Response) => Promise<unknown>) {
  const response = await cache.match(url);
  if (!response) return false;
  if (await read(response)) return true;
  await cache.delete(url);
  return false;
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

    const [hasPage, hasFont] = await Promise.all([
      validCachedResource(pageCache, pUrl, readMushafPageResponse),
      validCachedResource(fontCache, fUrl, readQcfFontResponse),
    ]);

    const fetchTasks: Promise<void>[] = [];

    if (!hasPage) {
      fetchTasks.push(
        (async () => {
          const response = await fetchNativeBinaryResource(pUrl, controller.signal);
          if (!response.ok) throw new Error(`Mushaf page ${page} failed: ${response.status}`);
          if (!(await readMushafPageResponse(response))) throw new Error(`Mushaf page ${page} was invalid`);
          controller.signal.throwIfAborted();
          await pageCache.put(pUrl, response);
        })(),
      );
    }

    if (!hasFont) {
      fetchTasks.push(
        (async () => {
          const fontResponse = await fetchNativeBinaryResource(fUrl, controller.signal);
          if (!fontResponse.ok) throw new Error(`Mushaf font ${page} failed: ${fontResponse.status}`);
          if (!(await readQcfFontResponse(fontResponse))) throw new Error(`Mushaf font ${page} was invalid`);
          controller.signal.throwIfAborted();
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

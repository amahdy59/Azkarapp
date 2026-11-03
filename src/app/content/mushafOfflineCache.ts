import {
  FONT_CACHE_NAME,
  getMushafPageUrl,
  getQcfFontUrl,
  MUSHAF_CACHE_NAME,
  parseMushafPage,
  readQcfFontResponse,
} from "./qcfMushaf";
import { fetchNativeBinaryResource } from "@azkar/native-mushaf-download";

import { getMushafAssetBytes, MUSHAF_SIZE_VERSION } from "./downloadStorage";
import { scheduleMushafRequest } from "./mushafScheduler";

const PAGE_COUNT = 604;
const CONCURRENCY_LIMIT = 4;

function pageUrl(page: number) {
  return new URL(getMushafPageUrl(page), window.location.href).toString();
}

function fontUrl(page: number) {
  return getQcfFontUrl(page);
}

export type MushafDownloadStatus = {
  downloadedPages: number;
  downloadedFonts: number;
  totalPages: number;
  isComplete: boolean;
  downloadedBytes?: number;
  remainingBytes?: number;
};

const summaryKey = `azkar-mushaf-summary-v2:${MUSHAF_SIZE_VERSION}:${MUSHAF_CACHE_NAME}:${FONT_CACHE_NAME}`;
let lastStatus: MushafDownloadStatus | undefined;
export function getPreviousMushafDownloadStatus() {
  if (lastStatus) return lastStatus;
  try {
    const value = JSON.parse(sessionStorage.getItem(summaryKey) ?? "null") as MushafDownloadStatus | null;
    if (
      value &&
      value.totalPages === PAGE_COUNT &&
      [value.downloadedPages, value.downloadedFonts].every((n) => Number.isInteger(n) && n >= 0 && n <= PAGE_COUNT) &&
      Number.isFinite(value.downloadedBytes) &&
      Number.isFinite(value.remainingBytes)
    )
      return value;
  } catch {
    /* The hint is optional. */
  }
  return undefined;
}

export async function getMushafDownloadStatus(signal?: AbortSignal): Promise<MushafDownloadStatus> {
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
    let downloadedBytes = 0;
    let remainingBytes = 0;
    for (let first = 1; first <= PAGE_COUNT; first += CONCURRENCY_LIMIT) {
      signal?.throwIfAborted();
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY_LIMIT, PAGE_COUNT - first + 1) }, async (_, offset) => {
          const page = first + offset;
          const pUrl = pageUrl(page);
          const fUrl = new URL(fontUrl(page), window.location.href).href;
          const [pageBytes, fontBytes] = await Promise.all([
            pageSet.has(pUrl) && validCachedResource(pageCache, pUrl, readPageBytes),
            fontSet.has(fUrl) && validCachedResource(fontCache, fUrl, readQcfFontResponse),
          ]);
          if (fontBytes) downloadedFonts++;
          if (pageBytes && fontBytes) trulyReadyPages++;
          const bytes = Number(pageBytes) + Number(fontBytes);
          downloadedBytes += bytes;
          const expected = getMushafAssetBytes(page);
          remainingBytes += (pageBytes ? 0 : expected.page) + (fontBytes ? 0 : expected.font);
        }),
      );
    }
    signal?.throwIfAborted();
    lastStatus = {
      downloadedBytes,
      remainingBytes,
      downloadedPages: trulyReadyPages,
      downloadedFonts,
      totalPages: PAGE_COUNT,
      isComplete: trulyReadyPages >= PAGE_COUNT,
    };
    try {
      sessionStorage.setItem(summaryKey, JSON.stringify(lastStatus));
    } catch {
      /* Optional hint. */
    }
    return lastStatus;
  } catch {
    signal?.throwIfAborted();
    return { downloadedPages: 0, downloadedFonts: 0, totalPages: PAGE_COUNT, isComplete: false };
  }
}

async function readPageBytes(response: Response) {
  if (response.status !== 200) return null;
  try {
    const bytes = await response.clone().arrayBuffer();
    return parseMushafPage(JSON.parse(new TextDecoder().decode(bytes))) ? bytes : null;
  } catch {
    return null;
  }
}

async function validCachedResource(
  cache: Cache,
  url: string,
  read: (response: Response) => Promise<ArrayBuffer | null>,
) {
  const response = await cache.match(url);
  if (!response) return false;
  const validated = await read(response);
  if (validated) return validated.byteLength;
  await cache.delete(url);
  return false;
}

export async function removeDownloadedMushaf(): Promise<void> {
  if (!("caches" in window)) return;
  lastStatus = undefined;
  try {
    sessionStorage.removeItem(summaryKey);
  } catch {
    /* Optional hint. */
  }
  await Promise.all([caches.delete(MUSHAF_CACHE_NAME), caches.delete(FONT_CACHE_NAME)]);
}

export async function downloadMushaf(
  options: {
    signal?: AbortSignal;
    pages?: readonly number[];
    onProgress?: (completed: number, total: number, bytes: number) => void;
  } = {},
) {
  const pages = options.pages ? [...new Set(options.pages)] : Array.from({ length: PAGE_COUNT }, (_, i) => i + 1);
  if (!pages.length || pages.some((page) => !Number.isInteger(page) || page < 1 || page > PAGE_COUNT))
    throw new RangeError("Invalid Mushaf page selection");
  if (!("caches" in window)) throw new Error("Cache API unavailable");
  const [pageCache, fontCache] = await Promise.all([caches.open(MUSHAF_CACHE_NAME), caches.open(FONT_CACHE_NAME)]);

  let completed = 0;
  let bytes = 0;
  const controller = new AbortController();
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) cancel();
  let failure: unknown;
  const fail = (error: unknown) => {
    failure ??= error;
    controller.abort();
  };

  const downloadSinglePage = async (page: number) => {
    if (controller.signal.aborted) throw new DOMException("Download cancelled", "AbortError");

    const pUrl = pageUrl(page);
    const fUrl = fontUrl(page);

    const [hasPage, hasFont] = await Promise.all([
      validCachedResource(pageCache, pUrl, readPageBytes),
      validCachedResource(fontCache, fUrl, readQcfFontResponse),
    ]);

    const fetchTasks: Promise<void>[] = [];

    if (!hasPage) {
      fetchTasks.push(
        scheduleMushafRequest(
          pUrl,
          async () => {
            const response = await fetchNativeBinaryResource(pUrl, controller.signal);
            if (!response.ok) throw new Error(`Mushaf page ${page} failed: ${response.status}`);
            const pageBytes = await readPageBytes(response);
            if (!pageBytes) throw new Error(`Mushaf page ${page} was invalid`);
            controller.signal.throwIfAborted();
            await pageCache.put(pUrl, response);
            bytes += pageBytes.byteLength;
          },
          "download",
          controller.signal,
        ),
      );
    }

    if (!hasFont) {
      fetchTasks.push(
        scheduleMushafRequest(
          fUrl,
          async () => {
            const fontResponse = await fetchNativeBinaryResource(fUrl, controller.signal);
            if (!fontResponse.ok) throw new Error(`Mushaf font ${page} failed: ${fontResponse.status}`);
            const fontBytes = await readQcfFontResponse(fontResponse);
            if (!fontBytes) throw new Error(`Mushaf font ${page} was invalid`);
            controller.signal.throwIfAborted();
            await fontCache.put(fUrl, fontResponse);
            bytes += fontBytes.byteLength;
          },
          "download",
          controller.signal,
        ),
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
    options.onProgress?.(completed, pages.length, bytes);
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

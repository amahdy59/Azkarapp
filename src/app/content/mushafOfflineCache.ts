const CACHE_NAME = "azkar-mushaf-v1";
const PAGE_COUNT = 604;

function pageUrl(page: number) {
  const base = import.meta.env.BASE_URL || "/";
  return new URL(`${base.endsWith("/") ? base : `${base}/`}data/mushaf/${page}.json`, window.location.href).toString();
}

export async function getMushafDownloadStatus(): Promise<{ downloadedPages: number; totalPages: number }> {
  if (!("caches" in window)) return { downloadedPages: 0, totalPages: PAGE_COUNT };
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  return {
    downloadedPages: keys.filter((request) => /\/data\/mushaf\/\d+\.json$/.test(request.url)).length,
    totalPages: PAGE_COUNT,
  };
}

export async function downloadMushaf(
  options: { signal?: AbortSignal; onProgress?: (completed: number, total: number) => void } = {},
) {
  if (!("caches" in window)) throw new Error("Cache API unavailable");
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  for (let page = 1; page <= PAGE_COUNT; page += 1) {
    if (options.signal?.aborted) throw new DOMException("Download cancelled", "AbortError");
    const request = new Request(pageUrl(page));
    if (!(await cache.match(request))) {
      const response = await fetch(request, { signal: options.signal });
      if (!response.ok) throw new Error(`Mushaf page ${page} failed: ${response.status}`);
      await cache.put(request, response);
    }
    completed += 1;
    options.onProgress?.(completed, PAGE_COUNT);
  }
}

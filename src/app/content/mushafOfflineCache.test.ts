import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "./mushafOfflineCache";
import { FONT_CACHE_NAME, MUSHAF_CACHE_NAME, getMushafPageUrl, getQcfFontUrl } from "./qcfMushaf";

const pageBytes = readFileSync("public/data/mushaf/1.json", "utf8");
const fontBytes = new Uint8Array(readFileSync("public/fonts/qcf-v2/2026-10-11/p42.woff2"));
function installCaches() {
  const stores = new Map<string, Map<string, Response>>();
  const open = vi.fn(async (name: string) => {
    const entries = stores.get(name) ?? new Map<string, Response>();
    stores.set(name, entries);
    const key = (url: RequestInfo | URL) =>
      new URL(url instanceof Request ? url.url : String(url), window.location.href).href;
    return {
      keys: async () => [...entries.keys()].map((url) => new Request(url)),
      match: async (url: RequestInfo | URL) => entries.get(key(url))?.clone(),
      put: vi.fn(async (url: RequestInfo | URL, response: Response) => {
        entries.set(key(url), response.clone());
      }),
      delete: vi.fn(async (url: RequestInfo | URL) => entries.delete(key(url))),
    };
  });
  const deleteFn = vi.fn(async (name: string) => stores.delete(name));
  vi.stubGlobal("caches", { open, delete: deleteFn });
  return { open, deleteFn, stores };
}

vi.mock("./nativeMushafDownload", () => ({
  fetchNativeBinaryResource: (url: string, signal?: AbortSignal) => fetch(url, { signal }),
}));

afterEach(() => vi.unstubAllGlobals());

describe("mushafOfflineCache", () => {
  it("reports cached Mushaf pages and fonts and caches every requested page and font", async () => {
    const { open, deleteFn, stores } = installCaches();
    const pageCache = await open(MUSHAF_CACHE_NAME);
    const fontCache = await open(FONT_CACHE_NAME);
    await pageCache.put(getMushafPageUrl(1), new Response(pageBytes));
    await fontCache.put(getQcfFontUrl(1), new Response(fontBytes));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => new Response(String(input).includes(".woff2") ? fontBytes : pageBytes)),
    );

    await expect(getMushafDownloadStatus()).resolves.toEqual({
      downloadedPages: 1,
      downloadedFonts: 1,
      totalPages: 604,
      isComplete: false,
    });

    stores.get(MUSHAF_CACHE_NAME)!.clear();
    stores.get(FONT_CACHE_NAME)!.clear();
    await downloadMushaf();

    // 604 pages JSON + 604 QCF font files
    expect(fetch).toHaveBeenCalledTimes(1208);
    expect(stores.get(MUSHAF_CACHE_NAME)?.size).toBe(604);
    expect(stores.get(FONT_CACHE_NAME)?.size).toBe(604);
    expect(open).toHaveBeenCalledWith(MUSHAF_CACHE_NAME);
    expect(open).toHaveBeenCalledWith(FONT_CACHE_NAME);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/data\/mushaf\/1\.json\?v=3$/), {
      signal: expect.any(AbortSignal),
    });

    await removeDownloadedMushaf();
    expect(deleteFn).toHaveBeenCalledWith(MUSHAF_CACHE_NAME);
    expect(deleteFn).toHaveBeenCalledWith(FONT_CACHE_NAME);
  });

  it("does not count invalid page or font bytes and replaces only invalid entries on retry", async () => {
    const { open } = installCaches();
    const pages = await open(MUSHAF_CACHE_NAME);
    const fonts = await open(FONT_CACHE_NAME);
    await pages.put(getMushafPageUrl(1), new Response("<html>error</html>"));
    await fonts.put(getQcfFontUrl(1), new Response(fontBytes));
    await pages.put(getMushafPageUrl(2), new Response(pageBytes));
    await fonts.put(getQcfFontUrl(2), new Response("not a font"));
    await expect(getMushafDownloadStatus()).resolves.toMatchObject({
      downloadedPages: 0,
      downloadedFonts: 1,
      isComplete: false,
    });
    expect(await pages.match(getMushafPageUrl(1))).toBeUndefined();
    expect(await fonts.match(getQcfFontUrl(2))).toBeUndefined();
    expect(await pages.match(getMushafPageUrl(2))).toBeDefined();
    expect(await fonts.match(getQcfFontUrl(1))).toBeDefined();
    const fetch = vi.fn(
      async (input: RequestInfo | URL) => new Response(String(input).includes(".woff2") ? fontBytes : pageBytes),
    );
    vi.stubGlobal("fetch", fetch);
    await downloadMushaf();
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining("/p1.woff2"), expect.anything());
    expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining("/data/mushaf/2.json"), expect.anything());
    await expect(getMushafDownloadStatus()).resolves.toMatchObject({ downloadedPages: 604, isComplete: true });
  });

  it.each(["page", "font"])("never publishes an HTTP-200 invalid %s resource", async (invalid) => {
    const { stores } = installCaches();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const isFont = String(input).includes(".woff2");
        return new Response(
          (invalid === "font") === isFont ? "<html>upstream error</html>" : isFont ? fontBytes : pageBytes,
        );
      }),
    );
    await expect(downloadMushaf()).rejects.toThrow(/was invalid/);
    expect(stores.get(invalid === "font" ? FONT_CACHE_NAME : MUSHAF_CACHE_NAME)?.size).toBe(0);
  });

  it("does not report a complete download when a required page font fails", async () => {
    vi.stubGlobal("caches", {
      open: vi.fn().mockResolvedValue({
        match: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
      }),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        return Promise.resolve(new Response("", { status: url.includes("/fonts/") ? 503 : 200 }));
      }),
    );

    await expect(downloadMushaf()).rejects.toThrow(/Mushaf font \d+ failed: 503/);
    // Only the initial eight page/font pairs may start; failure stops further work.
    expect(vi.mocked(fetch).mock.calls.length).toBeLessThanOrEqual(16);
    for (const [, options] of vi.mocked(fetch).mock.calls) {
      expect(options?.signal?.aborted).toBe(true);
    }
  });
});

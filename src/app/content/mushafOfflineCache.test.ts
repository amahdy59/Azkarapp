import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "./mushafOfflineCache";
import { FONT_CACHE_NAME, MUSHAF_CACHE_NAME } from "./qcfMushaf";

afterEach(() => vi.unstubAllGlobals());

describe("mushafOfflineCache", () => {
  it("reports cached Mushaf pages and fonts and caches every requested page and font", async () => {
    const keys = vi
      .fn()
      .mockResolvedValue([
        new Request("https://example.test/data/mushaf/1.json"),
        new Request("https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2"),
      ]);
    const match = vi.fn().mockResolvedValue(undefined);
    const put = vi.fn().mockResolvedValue(undefined);
    const deleteFn = vi.fn().mockResolvedValue(true);
    const open = vi.fn().mockResolvedValue({ keys, match, put });
    vi.stubGlobal("caches", {
      open,
      delete: deleteFn,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

    await expect(getMushafDownloadStatus()).resolves.toEqual({
      downloadedPages: 1,
      downloadedFonts: 1,
      totalPages: 604,
      isComplete: false,
    });

    await downloadMushaf();

    // 604 pages JSON + 604 QCF font files
    expect(fetch).toHaveBeenCalledTimes(1208);
    expect(put).toHaveBeenCalledTimes(1208);
    expect(open).toHaveBeenCalledWith(MUSHAF_CACHE_NAME);
    expect(open).toHaveBeenCalledWith(FONT_CACHE_NAME);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/data\/mushaf\/1\.json\?v=3$/), {
      signal: undefined,
    });

    await removeDownloadedMushaf();
    expect(deleteFn).toHaveBeenCalledWith(MUSHAF_CACHE_NAME);
    expect(deleteFn).toHaveBeenCalledWith(FONT_CACHE_NAME);
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
  });
});

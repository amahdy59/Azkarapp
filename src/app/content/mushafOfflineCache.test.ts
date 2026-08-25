import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadMushaf, getMushafDownloadStatus, removeDownloadedMushaf } from "./mushafOfflineCache";

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
    vi.stubGlobal("caches", {
      open: vi.fn().mockResolvedValue({ keys, match, put }),
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

    await removeDownloadedMushaf();
    expect(deleteFn).toHaveBeenCalledTimes(2);
  });
});

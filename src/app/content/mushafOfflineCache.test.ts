import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadMushaf, getMushafDownloadStatus } from "./mushafOfflineCache";

afterEach(() => vi.unstubAllGlobals());

describe("mushafOfflineCache", () => {
  it("reports cached Mushaf pages and caches every requested page", async () => {
    const keys = vi.fn().mockResolvedValue([new Request("https://example.test/data/mushaf/1.json")]);
    const match = vi.fn().mockResolvedValue(undefined);
    const put = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue({ keys, match, put }) });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

    await expect(getMushafDownloadStatus()).resolves.toEqual({ downloadedPages: 1, totalPages: 604 });
    await downloadMushaf();

    expect(fetch).toHaveBeenCalledTimes(604);
    expect(put).toHaveBeenCalledTimes(604);
  });
});

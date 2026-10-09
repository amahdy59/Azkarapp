import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("lossless offline release archive", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("retains every source stamp and bilingual note exactly", () => {
    const history = JSON.parse(readFileSync("src/app/releaseHistory.data.json", "utf8"));
    const bytes = readFileSync("src/app/release-history.bin");
    expect(JSON.parse(gunzipSync(bytes).toString("utf8"))).toEqual(history);
    expect(bytes.length).toBeLessThan(Buffer.byteLength(JSON.stringify(history)) / 2);
  });
  it("decodes the complete history offline and caches a single decode", async () => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new globalThis.Response(readFileSync("src/app/release-history.bin"))),
    );
    const { loadReleaseHistory } = await import("../src/app/releaseHistory.ts");
    const first = loadReleaseHistory();
    expect(loadReleaseHistory()).toBe(first);
    expect(await first).toEqual(JSON.parse(readFileSync("src/app/releaseHistory.data.json", "utf8")));
  });
  it("keeps the latest notes readable if archive decoding is unavailable", async () => {
    vi.resetModules();
    vi.stubGlobal("DecompressionStream", undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new globalThis.Response(readFileSync("src/app/release-history.bin"))),
    );
    const { loadReleaseHistory, latestBundledRelease } = await import("../src/app/releaseHistory.ts");
    expect(await loadReleaseHistory()).toEqual([latestBundledRelease]);
  });
});

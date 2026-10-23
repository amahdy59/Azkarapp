import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const native = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
  getPlatform: vi.fn(() => "web"),
  get: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: native.isNativePlatform, getPlatform: native.getPlatform },
  CapacitorHttp: { get: native.get },
}));

import { fetchMushafResource } from "./nativeMushafDownload";

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("native Mushaf downloads", () => {
  it("uses the native HTTP bridge for QCF fonts on Android", async () => {
    native.isNativePlatform.mockReturnValue(true);
    native.getPlatform.mockReturnValue("android");
    native.get.mockResolvedValue({
      status: 200,
      url: "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2",
      headers: { "content-type": "font/woff2" },
      data: btoa("font-bytes"),
    });

    const response = await fetchMushafResource("https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2");

    expect(native.get).toHaveBeenCalledWith({
      url: "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2",
      responseType: "arraybuffer",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("font/woff2");
  });

  it("keeps browser and local Mushaf requests on fetch", async () => {
    native.isNativePlatform.mockReturnValue(false);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("page", { status: 200 }));

    await fetchMushafResource("/data/mushaf/1.json");

    expect(fetchMock).toHaveBeenCalledWith("/data/mushaf/1.json", { signal: undefined });
    expect(native.get).not.toHaveBeenCalled();
  });

  it("streams hosted audio through bounded native range requests on Android", async () => {
    native.isNativePlatform.mockReturnValue(true);
    native.getPlatform.mockReturnValue("android");
    native.get.mockImplementation(({ headers }: { headers: { Range: string } }) => {
      if (headers.Range === "bytes=0-1048575")
        return Promise.resolve({
          status: 206,
          headers: { "content-type": "audio/mpeg", "content-range": "bytes 0-4/7" },
          data: btoa("audio"),
        });
      return Promise.resolve({
        status: 206,
        headers: { "content-type": "audio/mpeg", "content-range": "bytes 5-6/7" },
        data: btoa("!!"),
      });
    });

    const response = await fetchMushafResource(
      "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/duas/morning-core.mp3?sha256=test",
    );
    await expect(response.arrayBuffer()).resolves.toEqual(new TextEncoder().encode("audio!!").buffer);
    expect(native.get).toHaveBeenNthCalledWith(1, {
      url: "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/duas/morning-core.mp3?sha256=test",
      headers: { Range: "bytes=0-1048575" },
      responseType: "arraybuffer",
    });
    expect(native.get).toHaveBeenNthCalledWith(2, {
      url: "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/duas/morning-core.mp3?sha256=test",
      headers: { Range: "bytes=5-1048580" },
      responseType: "arraybuffer",
    });
  });
});

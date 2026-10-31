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
import { transferAudio } from "../audio/audioDownloadTransfer";
import type { AudioVariant } from "../audio/audioTypes";

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

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
      connectTimeout: 30_000,
      readTimeout: 30_000,
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
      connectTimeout: 30_000,
      readTimeout: 30_000,
    });
    expect(native.get).toHaveBeenNthCalledWith(2, {
      url: "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/duas/morning-core.mp3?sha256=test",
      headers: { Range: "bytes=5-1048580" },
      responseType: "arraybuffer",
      connectTimeout: 30_000,
      readTimeout: 30_000,
    });
  });

  it("preserves the native recording MIME for WAV Azkar downloads", async () => {
    native.isNativePlatform.mockReturnValue(true);
    native.getPlatform.mockReturnValue("android");
    native.get.mockResolvedValue({
      status: 206,
      headers: { "content-type": "audio/wav", "content-range": "bytes 0-3/4" },
      data: btoa("WAVE"),
    });

    const response = await fetchMushafResource(
      "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/azkar/morning/example.wav?sha256=test",
    );

    expect(response.headers.get("content-type")).toBe("audio/wav");
    await expect(response.arrayBuffer()).resolves.toEqual(new TextEncoder().encode("WAVE").buffer);
  });
  it.each(["audio/wav", "audio/mpeg", "audio/ogg", "audio/mp4"])(
    "verifies native %s transfers against real response metadata",
    async (mimeType) => {
      native.isNativePlatform.mockReturnValue(true);
      native.getPlatform.mockReturnValue("android");
      native.get.mockResolvedValue({
        status: 206,
        headers: { "Content-Type": mimeType, "Content-Range": "bytes 0-3/4" },
        data: btoa("test"),
      });
      const variant = { id: "native-format", mimeType, byteSize: 4 } as AudioVariant;
      const result = await transferAudio("https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/test.wav", variant, {
        onTransfer: vi.fn(),
      });
      expect(Array.from(new Uint8Array(result.buffer))).toEqual([116, 101, 115, 116]);
      expect(native.get).toHaveBeenCalledOnce();
    },
  );

  it("preserves native HTTP errors and Retry-After instead of presenting audio", async () => {
    native.isNativePlatform.mockReturnValue(true);
    native.getPlatform.mockReturnValue("android");
    native.get.mockResolvedValue({ status: 429, headers: { "Retry-After": "4" }, data: "" });
    const response = await fetchMushafResource("https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/test.mp3");
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("4");
  });

  it.each(["first", "following", "font"])(
    "settles cancellation during a stalled %s native request and ignores late bytes",
    async (stage) => {
      native.isNativePlatform.mockReturnValue(true);
      native.getPlatform.mockReturnValue("android");
      let release!: (value: unknown) => void;
      const pending = new Promise((resolve) => {
        release = resolve;
      });
      native.get.mockReturnValue(pending);
      if (stage === "following")
        native.get.mockResolvedValueOnce({
          status: 206,
          headers: { "content-type": "audio/mpeg", "content-range": "bytes 0-1/4" },
          data: btoa("ab"),
        });
      const controller = new AbortController();
      const url =
        stage === "font"
          ? "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p1.woff2"
          : "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/test.mp3";
      const result = fetchMushafResource(url, controller.signal).then((response) => response.arrayBuffer());
      const rejected = expect(result).rejects.toMatchObject({ name: "AbortError" });
      await vi.waitFor(() => expect(native.get).toHaveBeenCalledTimes(stage === "following" ? 2 : 1));
      controller.abort();
      await rejected;
      release({
        status: 206,
        headers: { "content-type": "audio/mpeg", "content-range": "bytes 0-3/4" },
        data: btoa("late"),
      });
      await Promise.resolve();
      expect(native.get).toHaveBeenCalledTimes(stage === "following" ? 2 : 1);
    },
  );
});

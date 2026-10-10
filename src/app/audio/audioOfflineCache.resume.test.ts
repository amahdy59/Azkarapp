import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Zikr } from "../types";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import {
  downloadAudioForZikrs,
  getAudioDownloadStatus,
  getAudioDownloadStatuses,
  removeAudioForZikrs,
} from "./audioOfflineCache";

const fixtures = vi.hoisted(() => ({
  hash: "00".repeat(32),
  urls: ["https://audio.test/one", "https://audio.test/two"],
}));
vi.mock("./resolveAudioAsset", () => ({
  getPreferredVoiceId: () => "voice",
  resolveAudioAsset: (zikr: { id: string }) => ({
    available: true,
    asset: {
      id: zikr.id,
      version: 1,
      segments: [
        {
          id: zikr.id,
          variants: [
            {
              id: zikr.id,
              voiceId: "voice",
              reviewStatus: "approved",
              byteSize: 3,
              mimeType: "audio/mpeg",
              sha256: fixtures.hash,
            },
          ],
        },
      ],
    },
    segmentsByVoice: { voice: [{ id: zikr.id, url: zikr.id === "one" ? fixtures.urls[0] : fixtures.urls[1] }] },
  }),
}));
const zikrs = [{ id: "one" }, { id: "two" }] as Zikr[];
let files: Map<string, Response>;
let fetchMock: ReturnType<typeof vi.fn>;
function response(bytes = [1, 2, 3]) {
  return new Response(new Uint8Array(bytes), { headers: { "content-type": "audio/mpeg" } });
}

beforeEach(() => {
  localStorage.clear();
  files = new Map();
  vi.stubGlobal("crypto", {
    subtle: {
      digest: vi.fn(
        async (_algorithm: string, buffer: ArrayBuffer) =>
          new Uint8Array(32).fill(new Uint8Array(buffer)[0] === 1 ? 0 : 1).buffer,
      ),
    },
  });
  vi.stubGlobal("caches", {
    open: vi.fn(async () => ({
      match: async (url: string) => files.get(url)?.clone(),
      put: async (url: string, value: Response) => {
        files.set(url, value);
      },
      delete: async (url: string) => files.delete(url),
    })),
  });
  fetchMock = vi.fn(async () => response());
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verified offline audio", () => {
  it("verifies shared recordings only once across collection and bundle readiness", async () => {
    files.set(fixtures.urls[0]!, response());
    const result = await getAudioDownloadStatuses([zikrs, [zikrs[0]!], zikrs], DEFAULT_AUDIO_PREFERENCES);
    expect(result).toEqual([
      { completed: 1, total: 2, remainingBytes: 3 },
      { completed: 1, total: 1, remainingBytes: 0 },
      { completed: 1, total: 2, remainingBytes: 3 },
    ]);
    expect(crypto.subtle.digest).toHaveBeenCalledTimes(1);
  });
  it("removes the selected cached recording without a registry while preserving unrelated audio", async () => {
    files.set(fixtures.urls[0]!, response());
    files.set(fixtures.urls[1]!, response());
    await removeAudioForZikrs([zikrs[0]!], DEFAULT_AUDIO_PREFERENCES);
    expect(files.has(fixtures.urls[0]!)).toBe(false);
    expect(files.has(fixtures.urls[1]!)).toBe(true);
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 1,
      total: 2,
      remainingBytes: 3,
    });
  });
  it("propagates a failed scoped deletion", async () => {
    vi.mocked(caches.open).mockResolvedValueOnce({
      delete: async () => {
        throw new Error("cache write failed");
      },
    } as unknown as Cache);
    await expect(removeAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toThrow("cache write failed");
  });
  it("cancellation while verifying a large file cannot publish it into the cache", async () => {
    const controller = new AbortController();
    vi.mocked(crypto.subtle.digest).mockImplementationOnce(async () => {
      controller.abort();
      return new Uint8Array(32).buffer;
    });
    await expect(
      downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES, { signal: controller.signal }),
    ).rejects.toThrow();
    expect(files.size).toBe(0);
  });
  it("quota failure rolls back new files and keeps earlier verified downloads", async () => {
    files.set(fixtures.urls[0]!, response());
    vi.mocked(caches.open).mockResolvedValueOnce({
      match: async (url: string) => files.get(url)?.clone(),
      put: async () => {
        throw new DOMException("full", "QuotaExceededError");
      },
      delete: async (url: string) => files.delete(url),
    } as unknown as Cache);
    await expect(downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toThrow("full");
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(files.has(fixtures.urls[1]!)).toBe(false);
  });
  it("resumes without fetching files whose cached bytes already pass verification", async () => {
    files.set(fixtures.urls[0]!, response());
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 1,
      total: 2,
      remainingBytes: 3,
    });
    await downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(fixtures.urls[1], expect.anything());
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 2,
      total: 2,
      remainingBytes: 0,
    });
  });
  it("does not trust registry entries or a cached file with the wrong checksum", async () => {
    localStorage.setItem("azkar.audio-downloads.v1", JSON.stringify({ one: { byteSize: 3 } }));
    files.set(fixtures.urls[0]!, response([9, 2, 3]));
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 0,
      total: 2,
      remainingBytes: 6,
    });
    await downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("a failed retry preserves previously verified files", async () => {
    files.set(fixtures.urls[0]!, response());
    fetchMock.mockRejectedValue(new Error("offline"));
    await expect(downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toThrow("offline");
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 1,
      total: 2,
      remainingBytes: 3,
    });
  });
});

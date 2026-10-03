import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Zikr } from "../types";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { downloadAudioForZikrs, getAudioDownloadStatus } from "./audioOfflineCache";

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

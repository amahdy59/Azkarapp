import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Zikr } from "../types";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { prepareAudioArchive } from "./audioArchive";
import {
  downloadAudioForZikrs,
  getAudioDownloadStatus,
  getAudioDownloadStatuses,
  removeAudioForZikrs,
  getSavedAudioFiles,
  prepareSavedAudioFile,
} from "./audioOfflineCache";

const fixtures = vi.hoisted(() => ({
  hash: "00".repeat(32),
  urls: ["https://audio.test/one", "https://audio.test/two"],
}));
vi.mock("./audioManifest", () => ({
  AUDIO_MANIFEST_VERSION: 8,
  AUDIO_CATALOG: {
    assets: {
      one: { titleArabic: "التسجيل الأول", titleEnglish: "First recording", segments: [] },
      two: { titleArabic: "التسجيل الثاني", titleEnglish: "Second recording", segments: [] },
    },
  },
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
              voiceName: "Test reciter",
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

describe("complete audio archives", () => {
  it("reuses verified files, downloads only missing audio and retains exact bytes in a deduplicated ZIP", async () => {
    files.set(fixtures.urls[0]!, response());
    const archive = await prepareAudioArchive([...zikrs, zikrs[0]!], DEFAULT_AUDIO_PREFERENCES);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(fixtures.urls[1], expect.anything());
    expect(files.size).toBe(2);
    expect(archive.name).toBe("wa-zaker-audio.zip");
    const bytes = new Uint8Array(await archive.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const names: string[] = [];
    let offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
      expect(view.getUint16(offset + 8, true)).toBe(0);
      expect(view.getUint32(offset + 14, true)).toBe(0x55bc801d);
      const size = view.getUint32(offset + 18, true);
      const length = view.getUint16(offset + 26, true);
      names.push(new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + length)));
      offset += 30 + length;
      expect([...bytes.slice(offset, offset + size)]).toEqual([1, 2, 3]);
      offset += size;
    }
    expect(names).toEqual([
      "07 - Duas & Other Azkar (أدعية وأذكار متنوعة)/01 - التسجيل الأول - Test reciter.mp3",
      "07 - Duas & Other Azkar (أدعية وأذكار متنوعة)/02 - التسجيل الثاني - Test reciter.mp3",
    ]);
    expect(view.getUint16(bytes.length - 14, true)).toBe(2);
  });
  it("cancels archive preparation without deleting completed offline files", async () => {
    files.set(fixtures.urls[0]!, response());
    files.set(fixtures.urls[1]!, response());
    const controller = new AbortController();
    await expect(
      prepareAudioArchive(zikrs, DEFAULT_AUDIO_PREFERENCES, {
        signal: controller.signal,
        onArchiveProgress: () => controller.abort(),
      }),
    ).rejects.toThrow();
    expect(files.size).toBe(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("fails rather than exporting a partial archive after a later recording fails integrity", async () => {
    fetchMock.mockResolvedValueOnce(response()).mockResolvedValueOnce(response([9, 9, 9]));
    await expect(prepareAudioArchive(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toMatchObject({ code: "integrity" });
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(files.has(fixtures.urls[1]!)).toBe(false);
  });
});

describe("verified offline audio", () => {
  it("lists only verified cached files and exports the chosen recording without network or cache removal", async () => {
    files.set(fixtures.urls[0]!, response());
    files.set(fixtures.urls[1]!, response([9, 2, 3]));
    expect(await getSavedAudioFiles(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual([
      {
        id: "one",
        titleArabic: "التسجيل الأول",
        titleEnglish: "First recording",
        voiceName: "Test reciter",
        voiceId: "voice",
        fileName: "one.mp3",
        byteSize: 3,
      },
    ]);
    const file = await prepareSavedAudioFile(zikrs, DEFAULT_AUDIO_PREFERENCES, "one");
    expect(file.name).toBe("one.mp3");
    expect(file.type).toBe("audio/mpeg");
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    await expect(prepareSavedAudioFile(zikrs, DEFAULT_AUDIO_PREFERENCES, "two")).rejects.toMatchObject({
      code: "integrity",
    });
    await expect(prepareSavedAudioFile(zikrs, DEFAULT_AUDIO_PREFERENCES, "unknown")).rejects.toMatchObject({
      code: "unsupported",
    });
  });

  it("refuses an export if the cached recording disappeared after listing", async () => {
    files.set(fixtures.urls[0]!, response());
    expect(await getSavedAudioFiles(zikrs, DEFAULT_AUDIO_PREFERENCES)).toHaveLength(1);
    files.clear();
    await expect(prepareSavedAudioFile(zikrs, DEFAULT_AUDIO_PREFERENCES, "one")).rejects.toMatchObject({
      code: "integrity",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
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
  it("quota failure keeps earlier verified downloads and never publishes the failed file", async () => {
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
    await expect(downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toMatchObject({ code: "network" });
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(await getAudioDownloadStatus(zikrs, DEFAULT_AUDIO_PREFERENCES)).toEqual({
      completed: 1,
      total: 2,
      remainingBytes: 3,
    });
  });

  it("keeps new verified files after a later failure and fetches only the missing file on retry", async () => {
    fetchMock
      .mockImplementationOnce(async () => response())
      .mockImplementationOnce(async () => new Response(null, { status: 404 }));
    await expect(downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).rejects.toMatchObject({ code: "server" });
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(files.has(fixtures.urls[1]!)).toBe(false);
    expect(JSON.parse(localStorage.getItem("azkar.audio-downloads.v1")!)).toHaveProperty("one");
    fetchMock.mockClear();
    await downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(fixtures.urls[1], expect.anything());
  });

  it("keeps completed files when cancelled between recordings", async () => {
    const controller = new AbortController();
    await expect(
      downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES, {
        signal: controller.signal,
        onDetail: (detail) => {
          if (detail.phase === "saved") controller.abort();
        },
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(files.has(fixtures.urls[0]!)).toBe(true);
    expect(files.has(fixtures.urls[1]!)).toBe(false);
  });
});

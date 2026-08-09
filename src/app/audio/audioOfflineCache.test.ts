import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadAudioForZikrs, getDownloadedAudioSummary, removeDownloadedAudio } from "./audioOfflineCache";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";

const REGISTRY_KEY = "azkar.audio-downloads.v1";

/** Minimal Cache API stand-in; jsdom ships no `caches`. */
function installCaches() {
  const deleted: string[] = [];
  const cache = {
    put: vi.fn(async () => undefined),
    delete: vi.fn(async (url: string) => {
      deleted.push(url);
      return true;
    }),
  };
  Object.defineProperty(window, "caches", {
    configurable: true,
    writable: true,
    value: {
      open: vi.fn(async () => cache),
      keys: vi.fn(async () => []),
      delete: vi.fn(async () => true),
    },
  });
  return { cache, deleted };
}

/** Makes only writes fail, the way a quota-exhausted origin behaves. */
function makeStorageFull() {
  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  });
}

describe("audio offline cache registry writes", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "caches");
  });

  it("does not fail a completed download when the registry write is rejected", async () => {
    installCaches();
    const setItem = makeStorageFull();

    // The Cache API work has already succeeded by the time the registry is
    // written, so a full origin must not turn a good download into an error.
    await expect(downloadAudioForZikrs([], DEFAULT_AUDIO_PREFERENCES)).resolves.toEqual({ assetCount: 0, byteSize: 0 });
    expect(setItem).toHaveBeenCalled();
  });

  it("does not fail a removal when the registry write is rejected", async () => {
    window.localStorage.setItem(
      REGISTRY_KEY,
      JSON.stringify({
        "asset-1": {
          assetId: "asset-1",
          assetVersion: 1,
          manifestVersion: 1,
          variantIds: ["v1"],
          urls: ["https://example.test/a.opus"],
          byteSize: 10,
          downloadedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    );
    const { deleted } = installCaches();
    makeStorageFull();

    await expect(removeDownloadedAudio(["asset-1"])).resolves.toBeUndefined();
    // The cached bytes are genuinely gone; only the bookkeeping was lost.
    expect(deleted).toEqual(["https://example.test/a.opus"]);
  });

  it("reports an empty summary when the stored registry is unreadable", () => {
    window.localStorage.setItem(REGISTRY_KEY, "{ not json");

    expect(getDownloadedAudioSummary()).toEqual({ assetCount: 0, byteSize: 0 });
  });
});

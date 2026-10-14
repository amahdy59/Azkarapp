import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanupStaleAudioDownloads,
  downloadAudioForZikrs,
  getDownloadedAudioSummary,
  removeDownloadedAudio,
  AUDIO_CACHE_NAME,
} from "./audioOfflineCache";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { ALL_AZKAR } from "../content/azkar";
import { AUDIO_CATALOG } from "./audioManifest";
import * as audioResolver from "./resolveAudioAsset";

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
  it("omits quarantined Arabic recordings without silently downloading English narration", async () => {
    installCaches();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const catalog = structuredClone(AUDIO_CATALOG);
    const asset = catalog.assets["m-hm-96"]!;
    asset.defaultVoiceId = "english-george";
    asset.segments[0]!.variants.find((variant) => variant.voiceId === "abdullah-muhammad")!.reviewStatus = "rejected";
    const resolve = audioResolver.resolveAudioAsset;
    vi.spyOn(audioResolver, "resolveAudioAsset").mockImplementation((zikr) => resolve(zikr, { catalog }));
    try {
      const zikrs = ALL_AZKAR.filter((zikr) => ["m-hm-96", "e-hm-96"].includes(zikr.id));
      expect(zikrs).toHaveLength(2);
      await expect(downloadAudioForZikrs(zikrs, DEFAULT_AUDIO_PREFERENCES)).resolves.toEqual({
        assetCount: 0,
        byteSize: 0,
      });
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
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

  it("retains the source cache when migration fails so maintenance can retry", async () => {
    const asset = Object.values(AUDIO_CATALOG.assets)[0]!;
    window.localStorage.setItem(
      REGISTRY_KEY,
      JSON.stringify({
        [asset.id]: {
          assetId: asset.id,
          assetVersion: asset.version,
          manifestVersion: 1,
          variantIds: ["v1"],
          urls: ["https://example.test/valid.opus"],
          byteSize: 100,
          downloadedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    );
    const active = {
      match: vi.fn(async () => undefined),
      put: vi.fn(async () => {
        throw new DOMException("Storage full", "QuotaExceededError");
      }),
    };
    const old = { match: vi.fn(async () => new Response("valid")) };
    const remove = vi.fn(async () => true);
    vi.stubGlobal("caches", {
      open: vi.fn(async (name: string) => (name === AUDIO_CACHE_NAME ? active : old)),
      keys: vi.fn(async () => ["azkar-audio-v1", AUDIO_CACHE_NAME]),
      delete: remove,
    });
    try {
      await cleanupStaleAudioDownloads();
      expect(active.put).toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
      expect(getDownloadedAudioSummary().assetCount).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("migrates valid recordings across manifest versions and only deletes truly stale assets", async () => {
    const validAssetId = Object.keys(AUDIO_CATALOG.assets)[0]!;
    const validAsset = AUDIO_CATALOG.assets[validAssetId]!;
    const staleAssetId = "nonexistent-asset";

    window.localStorage.setItem(
      REGISTRY_KEY,
      JSON.stringify({
        [validAssetId]: {
          assetId: validAssetId,
          assetVersion: validAsset.version,
          manifestVersion: 1, // older manifest version
          variantIds: ["v1"],
          urls: ["https://example.test/valid.opus"],
          byteSize: 100,
          downloadedAt: "2026-01-01T00:00:00.000Z",
        },
        [staleAssetId]: {
          assetId: staleAssetId,
          assetVersion: 1,
          manifestVersion: 1,
          variantIds: ["v2"],
          urls: ["https://example.test/stale.opus"],
          byteSize: 50,
          downloadedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    );

    const oldCacheStored = new Map<string, Response>([
      ["https://example.test/valid.opus", new Response("valid")],
      ["https://example.test/stale.opus", new Response("stale")],
    ]);
    const activeCacheStored = new Map<string, Response>();
    const deletedCaches: string[] = [];

    const oldCache = {
      match: vi.fn(async (url: string) => oldCacheStored.get(url)),
      delete: vi.fn(async (url: string) => {
        oldCacheStored.delete(url);
        return true;
      }),
    };
    const activeCache = {
      match: vi.fn(async (url: string) => activeCacheStored.get(url)),
      put: vi.fn(async (url: string, res: Response) => {
        activeCacheStored.set(url, res);
      }),
      delete: vi.fn(async (url: string) => {
        activeCacheStored.delete(url);
        return true;
      }),
    };

    Object.defineProperty(window, "caches", {
      configurable: true,
      writable: true,
      value: {
        open: vi.fn(async (name: string) => (name === AUDIO_CACHE_NAME ? activeCache : oldCache)),
        keys: vi.fn(async () => ["azkar-audio-v1", AUDIO_CACHE_NAME]),
        delete: vi.fn(async (name: string) => {
          deletedCaches.push(name);
          return true;
        }),
      },
    });

    await cleanupStaleAudioDownloads();

    // 1. Valid file was migrated from older cache to active cache
    expect(activeCache.put).toHaveBeenCalledWith("https://example.test/valid.opus", expect.anything());

    // 2. Old cache was deleted
    expect(deletedCaches).toEqual(["azkar-audio-v1"]);

    // 3. Registry kept the valid asset and bumped its manifestVersion to current
    const updatedRegistry = JSON.parse(window.localStorage.getItem(REGISTRY_KEY) ?? "{}");
    expect(updatedRegistry[validAssetId]).toBeDefined();
    expect(updatedRegistry[validAssetId].manifestVersion).toBe(AUDIO_CATALOG.version);

    // 4. Stale asset was removed from registry
    expect(updatedRegistry[staleAssetId]).toBeUndefined();
  });
});

import type { Zikr } from "../types";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "./audioManifest";
import type { AudioPreferences, AudioVariant } from "./audioTypes";
import { getPreferredVoiceId, resolveAudioAsset } from "./resolveAudioAsset";
import { AudioDownloadError, transferAudio, type AudioDownloadPhase } from "./audioDownloadTransfer";

export interface AudioDownloadProgress {
  phase: AudioDownloadPhase;
  completedFiles: number;
  totalFiles: number;
  fileNumber: number;
  attempt: number;
  receivedBytes: number;
  totalBytes: number;
}

export const AUDIO_CACHE_NAME = `azkar-audio-v${AUDIO_MANIFEST_VERSION}`;
const REGISTRY_KEY = "azkar.audio-downloads.v1";

interface DownloadedAssetRecord {
  assetId: string;
  assetVersion: number;
  manifestVersion: number;
  variantIds: string[];
  urls: string[];
  byteSize: number;
  downloadedAt: string;
}

type DownloadRegistry = Record<string, DownloadedAssetRecord>;

function loadRegistry(): DownloadRegistry {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REGISTRY_KEY) ?? "{}") as DownloadRegistry;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveRegistry(registry: DownloadRegistry) {
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // Every caller reaches here only after the Cache API work has already
    // succeeded, so the audio itself is downloaded (or deleted) either way.
    // Losing the bookkeeping degrades the Downloads screen's totals until the
    // next successful write; throwing would instead report a completed
    // download as a failure, and storage quota is exactly the pressure this
    // feature creates.
  }
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyDownload(buffer: ArrayBuffer, variant: AudioVariant) {
  if (buffer.byteLength !== variant.byteSize) throw new AudioDownloadError("integrity", variant.id);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  if (toHex(digest) !== variant.sha256.toLowerCase()) throw new AudioDownloadError("integrity", variant.id);
}

function getDownloadVariants(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  const variants = new Map<
    string,
    { assetId: string; assetVersion: number; variant: AudioVariant; url: string; zikr?: Zikr }
  >();
  for (const zikr of zikrs) {
    const resolution = resolveAudioAsset(zikr);
    if (!resolution.available) continue;
    const voiceId = getPreferredVoiceId(resolution, preferences);
    // Partial coverage must not substitute English narration in an Arabic
    // download (or Arabic recitation in an English narration download).
    if (
      resolution.asset.contentKind === "dua" &&
      (voiceId === "english-george") !== (preferences.duaVoiceId === "english-george")
    )
      continue;
    for (const segment of resolution.asset.segments) {
      const variant = segment.variants.find(
        (candidate) => candidate.voiceId === voiceId && candidate.reviewStatus === "approved",
      );
      const resolved = resolution.segmentsByVoice[voiceId]?.find((candidate) => candidate.id === segment.id);
      if (variant && resolved) {
        variants.set(variant.id, {
          assetId: resolution.asset.id,
          assetVersion: resolution.asset.version,
          variant,
          url: resolved.url,
          zikr,
        });
      }
    }
  }
  return [...variants.values()];
}

export function estimateAudioDownloadBytes(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  return getDownloadVariants(zikrs, preferences).reduce((total, item) => total + item.variant.byteSize, 0);
}

export interface SavedAudioFile {
  id: string;
  titleArabic: string;
  titleEnglish: string;
  voiceName: string;
  voiceId?: string;
  fileName: string;
  byteSize: number;
  category?: string;
  orderIndex?: number;
  contentKind?: string;
  surahNumber?: number;
}

function audioFileName(variant: AudioVariant) {
  const extension =
    variant.mimeType === "audio/mpeg"
      ? "mp3"
      : variant.mimeType === "audio/wav"
        ? "wav"
        : variant.mimeType === "audio/ogg"
          ? "ogg"
          : "m4a";
  return `${variant.id.replace(/[^a-zA-Z0-9_-]/g, "-")}.${extension}`;
}

/** Enumerate verified saved recordings without retaining their large byte buffers. */
export async function getSavedAudioFiles(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
): Promise<SavedAudioFile[]> {
  if (!("caches" in window)) return [];
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const files: SavedAudioFile[] = [];
  for (const item of getDownloadVariants(zikrs, preferences)) {
    if (!(await isVerifiedCachedAudio(cache, item))) continue;
    const asset = AUDIO_CATALOG.assets[item.assetId];
    if (!asset) continue;
    const file: SavedAudioFile = {
      id: item.variant.id,
      titleArabic: asset.titleArabic,
      titleEnglish: asset.titleEnglish,
      voiceName: item.variant.voiceName,
      fileName: audioFileName(item.variant),
      byteSize: item.variant.byteSize,
    };
    if (item.variant.voiceId) file.voiceId = item.variant.voiceId;
    if (item.zikr?.category) file.category = item.zikr.category;
    if (typeof item.zikr?.orderIndex === "number") file.orderIndex = item.zikr.orderIndex;
    if (asset.contentKind) file.contentKind = asset.contentKind;
    if (typeof asset.requiredQuranRange?.surah === "number") file.surahNumber = asset.requiredQuranRange.surah;
    files.push(file);
  }
  return files;
}

/** Export only the selected approved, complete recording. Never redownload or export invalid bytes. */
export async function prepareSavedAudioFile(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
  id: string,
  suggestedFileName?: string,
) {
  const item = getDownloadVariants(zikrs, preferences).find((candidate) => candidate.variant.id === id);
  if (!item || !("caches" in window)) throw new AudioDownloadError("unsupported", id);
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const response = await cache.match(item.url);
  if (
    !response ||
    response.status !== 200 ||
    response.headers.get("content-type")?.split(";")[0]?.trim() !== item.variant.mimeType
  )
    throw new AudioDownloadError("integrity", id);
  const buffer = await response.arrayBuffer();
  await verifyDownload(buffer, item.variant);
  return new File([buffer], suggestedFileName ?? audioFileName(item.variant), { type: item.variant.mimeType });
}

async function isVerifiedCachedAudio(cache: Cache, item: ReturnType<typeof getDownloadVariants>[number]) {
  const response = await cache.match(item.url);
  if (
    !response ||
    response.status !== 200 ||
    response.headers.get("content-type")?.split(";")[0]?.trim() !== item.variant.mimeType
  )
    return false;
  try {
    await verifyDownload(await response.arrayBuffer(), item.variant);
    return true;
  } catch {
    return false;
  }
}

/** Readiness comes from complete, checksummed bytes, never registry totals alone. */
export async function getAudioDownloadStatus(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  return (await getAudioDownloadStatuses([zikrs], preferences))[0]!;
}

/** Verify shared recordings once, sequentially, to bound large-file memory use. */
export async function getAudioDownloadStatuses(
  collections: readonly (readonly Zikr[])[],
  preferences: AudioPreferences,
) {
  const groups = collections.map((zikrs) => getDownloadVariants(zikrs, preferences));
  const verified = new Map<string, boolean>();
  if ("caches" in window) {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    for (const variants of groups) {
      for (const item of variants) {
        if (!verified.has(item.variant.id)) verified.set(item.variant.id, await isVerifiedCachedAudio(cache, item));
      }
    }
  }
  return groups.map((variants) => ({
    completed: variants.filter((item) => verified.get(item.variant.id)).length,
    total: variants.length,
    remainingBytes: variants.reduce(
      (sum, item) => sum + (verified.get(item.variant.id) ? 0 : item.variant.byteSize),
      0,
    ),
  }));
}

/** Remove only the selected recordings, including files whose registry write failed. */
export async function removeAudioForZikrs(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  if (!("caches" in window)) throw new Error("Offline audio is not supported in this browser.");
  const variants = getDownloadVariants(zikrs, preferences);
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const registry = loadRegistry();
  for (const item of variants) {
    await cache.delete(item.url);
    const record = registry[item.assetId];
    if (!record) continue;
    const index = record.variantIds.indexOf(item.variant.id);
    if (index < 0) continue;
    record.variantIds.splice(index, 1);
    record.urls.splice(index, 1);
    record.byteSize = Math.max(0, record.byteSize - item.variant.byteSize);
    if (record.variantIds.length === 0) delete registry[item.assetId];
  }
  saveRegistry(registry);
}

export async function downloadAudioForZikrs(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
  options: {
    signal?: AbortSignal;
    onProgress?: (completedBytes: number, totalBytes: number) => void;
    onDetail?: (progress: AudioDownloadProgress) => void;
  } = {},
) {
  if (!("caches" in window)) throw new AudioDownloadError("unsupported", "");
  const downloads = getDownloadVariants(zikrs, preferences);
  const totalBytes = downloads.reduce((total, item) => total + item.variant.byteSize, 0);
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const records = new Map<string, DownloadedAssetRecord>();
  let completedBytes = 0;
  let completedFiles = 0;
  const notify = (phase: AudioDownloadPhase, bytes = 0, attempt = 1) => {
    options.onProgress?.(completedBytes + bytes, totalBytes);
    options.onDetail?.({
      phase,
      completedFiles,
      totalFiles: downloads.length,
      fileNumber: Math.min(completedFiles + 1, downloads.length),
      attempt,
      receivedBytes: completedBytes + bytes,
      totalBytes,
    });
  };

  try {
    for (const item of downloads) {
      options.signal?.throwIfAborted();
      notify("verifying");
      const alreadyCached = await isVerifiedCachedAudio(cache, item);
      if (!alreadyCached) {
        const { buffer, headers: receivedHeaders } = await transferAudio(item.url, item.variant, {
          signal: options.signal,
          onTransfer: notify,
        });
        notify("verifying", item.variant.byteSize);
        await verifyDownload(buffer, item.variant);
        options.signal?.throwIfAborted();
        const headers = new Headers(receivedHeaders);
        headers.set("content-length", String(buffer.byteLength));
        headers.set("content-type", item.variant.mimeType);
        await cache.put(item.url, new Response(buffer, { status: 200, headers }));
      }
      completedBytes += item.variant.byteSize;
      completedFiles++;

      const record = records.get(item.assetId) ?? {
        assetId: item.assetId,
        assetVersion: item.assetVersion,
        manifestVersion: AUDIO_MANIFEST_VERSION,
        variantIds: [],
        urls: [],
        byteSize: 0,
        downloadedAt: new Date().toISOString(),
      };
      record.variantIds.push(item.variant.id);
      record.urls.push(item.url);
      record.byteSize += item.variant.byteSize;
      records.set(item.assetId, record);
      notify("saved");
    }
    options.signal?.throwIfAborted();
  } finally {
    // Each verified complete file is a checkpoint, including cancellation/failure.
    // An incomplete or corrupt response never enters the cache or registry.
    const registry = loadRegistry();
    for (const [assetId, record] of records) {
      const previous = registry[assetId];
      if (previous?.manifestVersion === AUDIO_MANIFEST_VERSION && previous.assetVersion === record.assetVersion) {
        for (let index = 0; index < previous.variantIds.length; index++) {
          const variantId = previous.variantIds[index]!;
          if (!record.variantIds.includes(variantId)) {
            const variant = AUDIO_CATALOG.assets[assetId]?.segments
              .flatMap((segment) => segment.variants)
              .find((candidate) => candidate.id === variantId);
            if (variant && previous.urls[index]) {
              record.variantIds.push(variantId);
              record.urls.push(previous.urls[index]!);
              record.byteSize += variant.byteSize;
            }
          }
        }
      }
      registry[assetId] = record;
    }
    saveRegistry(registry);
  }
  return { assetCount: records.size, byteSize: completedBytes };
}

export async function removeDownloadedAudio(assetIds?: readonly string[]) {
  if (!("caches" in window)) return;
  const registry = loadRegistry();
  const targets = assetIds ?? Object.keys(registry);
  const cache = await caches.open(AUDIO_CACHE_NAME);
  for (const assetId of targets) {
    await Promise.all((registry[assetId]?.urls ?? []).map((url) => cache.delete(url)));
    delete registry[assetId];
  }
  saveRegistry(registry);
}

export function getDownloadedAudioSummary() {
  const records = Object.values(loadRegistry());
  return {
    assetCount: records.length,
    byteSize: records.reduce((total, record) => total + record.byteSize, 0),
  };
}

export async function cleanupStaleAudioDownloads() {
  if (!("caches" in window)) return;
  const registry = loadRegistry();
  const activeCache = await caches.open(AUDIO_CACHE_NAME);
  const cacheNames = await caches.keys();
  const oldCacheNames = cacheNames.filter((name) => name.startsWith("azkar-audio-v") && name !== AUDIO_CACHE_NAME);

  let registryChanged = false;
  const migratedCacheNames: string[] = [];

  // 1. Migrate still-valid downloads from older audio caches into the active cache
  for (const oldName of oldCacheNames) {
    try {
      const oldCache = await caches.open(oldName);
      for (const record of Object.values(registry)) {
        const asset = AUDIO_CATALOG.assets[record.assetId];
        if (!asset || record.assetVersion !== asset.version) continue;
        for (const url of record.urls) {
          const cachedInActive = await activeCache.match(url);
          if (!cachedInActive) {
            const cachedInOld = await oldCache.match(url);
            if (cachedInOld) {
              await activeCache.put(url, cachedInOld);
            }
          }
        }
        if (record.manifestVersion !== AUDIO_MANIFEST_VERSION) {
          record.manifestVersion = AUDIO_MANIFEST_VERSION;
          registryChanged = true;
        }
      }
      migratedCacheNames.push(oldName);
    } catch {
      // Keep the source cache if any copy fails (for example, storage quota).
      // A later maintenance pass can retry without losing the only offline copy.
    }
  }

  // 2. Identify truly stale assets (removed from catalog or modified asset version)
  const staleIds = Object.values(registry)
    .filter((record) => {
      const asset = AUDIO_CATALOG.assets[record.assetId];
      return !asset || record.assetVersion !== asset.version;
    })
    .map((record) => record.assetId);

  if (registryChanged) {
    saveRegistry(registry);
  }

  if (staleIds.length > 0) {
    await removeDownloadedAudio(staleIds);
  }

  // 3. Remove retired older audio caches now that valid assets are migrated
  await Promise.all(migratedCacheNames.map((name) => caches.delete(name)));
}

import type { Zikr } from "../types";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "./audioManifest";
import type { AudioPreferences, AudioVariant } from "./audioTypes";
import { getPreferredVoiceId, resolveAudioAsset } from "./resolveAudioAsset";

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
  if (buffer.byteLength !== variant.byteSize) throw new Error(`Incomplete audio download: ${variant.id}`);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  if (toHex(digest) !== variant.sha256.toLowerCase()) throw new Error(`Audio checksum failed: ${variant.id}`);
}

function getDownloadVariants(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  const variants = new Map<string, { assetId: string; assetVersion: number; variant: AudioVariant; url: string }>();
  for (const zikr of zikrs) {
    const resolution = resolveAudioAsset(zikr);
    if (!resolution.available) continue;
    const voiceId = getPreferredVoiceId(resolution, preferences);
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
        });
      }
    }
  }
  return [...variants.values()];
}

export function estimateAudioDownloadBytes(zikrs: readonly Zikr[], preferences: AudioPreferences) {
  return getDownloadVariants(zikrs, preferences).reduce((total, item) => total + item.variant.byteSize, 0);
}

export async function downloadAudioForZikrs(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
  options: { signal?: AbortSignal; onProgress?: (completedBytes: number, totalBytes: number) => void } = {},
) {
  if (!("caches" in window)) throw new Error("Offline audio is not supported in this browser.");
  const downloads = getDownloadVariants(zikrs, preferences);
  const totalBytes = downloads.reduce((total, item) => total + item.variant.byteSize, 0);
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const storedUrls: string[] = [];
  const records = new Map<string, DownloadedAssetRecord>();
  let completedBytes = 0;

  try {
    for (const item of downloads) {
      options.signal?.throwIfAborted();
      const response = await fetch(item.url, { cache: "no-store", credentials: "omit", signal: options.signal });
      if (response.status !== 200 || !response.ok) throw new Error(`Audio download failed: ${item.variant.id}`);
      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();
      if (contentType !== item.variant.mimeType) throw new Error(`Unexpected audio MIME type: ${item.variant.id}`);
      const buffer = await response.arrayBuffer();
      await verifyDownload(buffer, item.variant);
      const headers = new Headers(response.headers);
      headers.set("content-length", String(buffer.byteLength));
      headers.set("content-type", item.variant.mimeType);
      await cache.put(item.url, new Response(buffer, { status: 200, headers }));
      storedUrls.push(item.url);
      completedBytes += item.variant.byteSize;
      options.onProgress?.(completedBytes, totalBytes);

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
    }
  } catch (error) {
    await Promise.all(storedUrls.map((url) => cache.delete(url)));
    throw error;
  }

  const registry = loadRegistry();
  for (const [assetId, record] of records) registry[assetId] = record;
  saveRegistry(registry);
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
  const staleIds = Object.values(registry)
    .filter((record) => {
      const asset = AUDIO_CATALOG.assets[record.assetId];
      return !asset || record.manifestVersion !== AUDIO_MANIFEST_VERSION || record.assetVersion !== asset.version;
    })
    .map((record) => record.assetId);
  await removeDownloadedAudio(staleIds);
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith("azkar-audio-v") && name !== AUDIO_CACHE_NAME)
      .map((name) => caches.delete(name)),
  );
}

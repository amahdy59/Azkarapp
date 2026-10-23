import { registerPlugin } from "@capacitor/core";
import type { LiveUpdatePlugin } from "@capawesome/capacitor-live-update";
import { isNativeAndroid } from "./platform";

// The Android implementation is discovered by Capacitor at runtime. Keeping
// the package import type-only prevents native-only code from entering the web
// bundle while preserving the same plugin contract on Android.
const LiveUpdate = registerPlugin<LiveUpdatePlugin>("LiveUpdate");

const DEFAULT_MANIFEST_URL = "https://amahdy59.github.io/Azkarapp/live-updates/manifest.json";
const REQUEST_TIMEOUT_MS = 15_000;

export interface NativeLiveUpdateManifest {
  bundleId: string;
  url: string;
  checksum?: string;
  minVersionCode?: string;
}

export function liveUpdateManifestUrl() {
  return import.meta.env.VITE_NATIVE_LIVE_UPDATE_MANIFEST_URL || DEFAULT_MANIFEST_URL;
}

export function parseLiveUpdateManifest(value: unknown): NativeLiveUpdateManifest | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.bundleId !== "string" || !candidate.bundleId || typeof candidate.url !== "string") return null;
  try {
    if (new URL(candidate.url).protocol !== "https:") return null;
  } catch {
    return null;
  }
  if (
    candidate.checksum !== undefined &&
    (typeof candidate.checksum !== "string" || !/^[a-f0-9]{64}$/i.test(candidate.checksum))
  ) {
    return null;
  }
  if (
    candidate.minVersionCode !== undefined &&
    (typeof candidate.minVersionCode !== "string" || !/^\d+$/.test(candidate.minVersionCode))
  ) {
    return null;
  }
  return {
    bundleId: candidate.bundleId,
    url: candidate.url,
    ...(candidate.checksum ? { checksum: candidate.checksum } : {}),
    ...(candidate.minVersionCode ? { minVersionCode: candidate.minVersionCode } : {}),
  };
}

async function fetchManifest(): Promise<NativeLiveUpdateManifest | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${liveUpdateManifestUrl()}?v=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return parseLiveUpdateManifest(await response.json());
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function checkForNativeLiveUpdate(): Promise<boolean> {
  if (!isNativeAndroid() || !navigator.onLine) return false;
  const manifest = await fetchManifest();
  if (!manifest) return false;

  const versionCode = (await LiveUpdate.getVersionCode()).versionCode;
  if (manifest.minVersionCode && Number(versionCode) < Number(manifest.minVersionCode)) return false;

  const current = await LiveUpdate.getCurrentBundle();
  if (current.bundleId === manifest.bundleId) return false;

  await LiveUpdate.downloadBundle({
    artifactType: "zip",
    bundleId: manifest.bundleId,
    url: manifest.url,
    ...(manifest.checksum ? { checksum: manifest.checksum } : {}),
  });
  await LiveUpdate.setNextBundle({ bundleId: manifest.bundleId });
  window.dispatchEvent(new Event("azkar-update-available"));
  return true;
}

export async function initializeNativeLiveUpdate() {
  if (!isNativeAndroid()) return;
  // Must happen before any download or bundle switch so the rollback timer can
  // distinguish a working bundle from one that failed during startup.
  await LiveUpdate.ready();
  void checkForNativeLiveUpdate().catch(() => {
    // OTA is optional. The bundled app remains the source of truth when the
    // network, manifest, or bundle is unavailable.
  });
}

export async function applyNativeLiveUpdate() {
  if (!isNativeAndroid()) return;
  await LiveUpdate.reload();
}

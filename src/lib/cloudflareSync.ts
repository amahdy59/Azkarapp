import type { AppStateSnapshot } from "../app/types";
import { buildRemoteSyncSnapshot } from "./remoteSyncSnapshot";

export const CLOUDFLARE_DEVICE_SECRET_KEY = "azkarapp.cloudflare-device-secret.v1";
export const CLOUDFLARE_DEVICE_EVENT = "azkarapp-cloudflare-device";
const API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || "https://azkarapp-api.amahdy59.workers.dev";
const VISITOR_KEY = "azkarapp.visitor-id.v1";

export function getCloudflareDeviceSecret() {
  try {
    return localStorage.getItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  } catch {
    return null;
  }
}

function updateCloudflareDeviceSecret(secret: string | null) {
  try {
    if (secret) localStorage.setItem(CLOUDFLARE_DEVICE_SECRET_KEY, secret);
    else localStorage.removeItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  } catch {
    if (secret) throw new Error("device_storage_failed");
  }
  window.dispatchEvent(new Event(CLOUDFLARE_DEVICE_EVENT));
}

async function requestJson<T extends Record<string, unknown>>(
  path: string,
  init: RequestInit = {},
  options: { auth?: "required" | "optional"; acceptUnauthorizedDelete?: boolean } = {},
): Promise<T> {
  const secret = getCloudflareDeviceSecret();
  if (options.auth === "required" && !secret) throw new Error("device_not_linked");
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (secret) headers.set("authorization", `Bearer ${secret}`);
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  if (options.acceptUnauthorizedDelete && init.method === "DELETE" && response.status === 401) return {} as T;
  const data = (await response.json().catch(() => ({}))) as T & { error?: unknown };
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : `cloudflare_sync_${response.status}`);
  }
  return data;
}

export function hasCloudflareDevice() {
  return Boolean(getCloudflareDeviceSecret());
}

export async function loadCloudflareSnapshot() {
  return requestJson<{ snapshot: AppStateSnapshot | null; revision?: number }>("/v1/sync", {}, { auth: "required" });
}

export async function saveCloudflareSnapshot(snapshot: AppStateSnapshot, revision = 0) {
  const sanitized = buildRemoteSyncSnapshot(snapshot);
  return requestJson<{ ok: boolean; revision: number; updatedAt: number }>(
    "/v1/sync",
    {
      method: "PUT",
      headers: { "if-match": String(revision) },
      body: JSON.stringify({ snapshot: sanitized }),
    },
    { auth: "required" },
  );
}

async function ensureCloudflareDevice() {
  const existing = getCloudflareDeviceSecret();
  if (existing) return existing;
  const result = await requestJson<{ secret?: unknown }>("/v1/devices", { method: "POST", body: "{}" });
  if (typeof result.secret !== "string" || !result.secret) throw new Error("device_failed");
  updateCloudflareDeviceSecret(result.secret);
  return result.secret;
}

export async function createCloudflarePairing() {
  await ensureCloudflareDevice();
  const pairing = await requestJson<{ token?: unknown; expiresIn?: unknown }>(
    "/v1/pairings",
    { method: "POST", body: "{}" },
    { auth: "required" },
  );
  if (typeof pairing.token !== "string" || !pairing.token) throw new Error("pairing_failed");
  const image = await requestJson<{ dataUrl?: unknown }>(
    `/v1/pairings/qr?token=${encodeURIComponent(pairing.token)}`,
    {},
    { auth: "required" },
  );
  if (typeof image.dataUrl !== "string" || !image.dataUrl) throw new Error("pairing_qr_failed");
  const expiresIn = typeof pairing.expiresIn === "number" && pairing.expiresIn > 0 ? pairing.expiresIn : 300;
  return { token: pairing.token, dataUrl: image.dataUrl, expiresAt: Date.now() + expiresIn * 1000 };
}

export async function claimCloudflarePairing(token: string) {
  const result = await requestJson<{ secret?: unknown }>("/v1/pairings/claim", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  if (typeof result.secret !== "string" || !result.secret) throw new Error("invalid_device");
  updateCloudflareDeviceSecret(result.secret);
}

export async function unlinkCloudflareDevice() {
  await requestJson("/v1/devices/current", { method: "DELETE" }, { auth: "required", acceptUnauthorizedDelete: true });
  updateCloudflareDeviceSecret(null);
}

function getOrCreateVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export async function sendActiveVisitorHeartbeat() {
  const result = await requestJson<{ active?: unknown }>("/v1/visitors", {
    method: "POST",
    body: JSON.stringify({ visitorId: getOrCreateVisitorId() }),
  });
  return typeof result.active === "number" && Number.isFinite(result.active) && result.active >= 0
    ? result.active
    : null;
}

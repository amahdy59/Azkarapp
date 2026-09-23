import type { AppStateSnapshot } from "../app/types";
import { buildRemoteSyncSnapshot } from "./remoteSyncSnapshot";

export const CLOUDFLARE_DEVICE_SECRET_KEY = "azkarapp.cloudflare-device-secret.v1";
export const CLOUDFLARE_DEVICE_EVENT = "azkarapp-cloudflare-device";
const API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || "https://azkarapp-api.amahdy59.workers.dev";

function deviceSecret() {
  try {
    return localStorage.getItem(CLOUDFLARE_DEVICE_SECRET_KEY);
  } catch {
    return null;
  }
}

async function request(path: string, init?: RequestInit) {
  const secret = deviceSecret();
  if (!secret) throw new Error("device_not_linked");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}`, ...init?.headers },
  });
  if (!response.ok) throw new Error(`cloudflare_sync_${response.status}`);
  return response;
}

export function hasCloudflareDevice() {
  return Boolean(deviceSecret());
}

export async function loadCloudflareSnapshot() {
  const response = await request("/v1/sync");
  return (await response.json()) as { snapshot: AppStateSnapshot | null; revision?: number };
}

export async function saveCloudflareSnapshot(snapshot: AppStateSnapshot, revision = 0) {
  const sanitized = buildRemoteSyncSnapshot(snapshot);
  const response = await request("/v1/sync", {
    method: "PUT",
    headers: { "if-match": String(revision) },
    body: JSON.stringify({ snapshot: sanitized }),
  });
  return (await response.json()) as { ok: boolean; revision: number; updatedAt: number };
}

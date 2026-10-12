/** Conservative estimate, including page JSON and QCF font; actual font sizes vary. */
export const MUSHAF_ESTIMATED_PAGE_BYTES = 224 * 1024;

export async function hasDownloadSpace(bytes: number): Promise<boolean> {
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (typeof estimate?.quota !== "number" || typeof estimate.usage !== "number") return true;
    return estimate.quota - estimate.usage >= bytes * 1.15;
  } catch {
    // Some browsers cannot estimate quota. Cache writes remain the final check.
    return true;
  }
}

export function isStorageQuotaError(error: unknown): boolean {
  return error instanceof Error && error.name === "QuotaExceededError";
}

export type DownloadPersistence = "granted" | "denied" | "unsupported";

export async function getDownloadPersistence(): Promise<DownloadPersistence> {
  if (!navigator.storage?.persist || !navigator.storage?.persisted) return "unsupported";
  try {
    return (await navigator.storage.persisted()) ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

/** Called from an explicit user gesture; browser policy decides whether to grant it. */
export async function requestDownloadPersistence(): Promise<DownloadPersistence> {
  if (!navigator.storage?.persist) return "unsupported";
  try {
    return (await navigator.storage.persist()) ? "granted" : "denied";
  } catch {
    return "unsupported";
  }
}

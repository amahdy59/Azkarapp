import sizes from "./mushafAssetSizes.json";

export const MUSHAF_SIZE_VERSION = sizes.version;

export function getMushafAssetBytes(page: number) {
  if (!Number.isInteger(page) || page < 1 || page > 604) throw new RangeError("Invalid Mushaf page");
  return { page: sizes.pageBytes[page - 1]!, font: sizes.fontBytes[page - 1]! };
}

export function getMushafDownloadBytes(first: number, last: number) {
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > 604 || first > last)
    throw new RangeError("Invalid Mushaf page range");
  let bytes = 0;
  for (let page = first; page <= last; page++) {
    const asset = getMushafAssetBytes(page);
    bytes += asset.page + asset.font;
  }
  return bytes;
}

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

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

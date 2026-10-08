import { OWNER_TIMING_PACK_SHA, type OwnerTimingPack } from "./ownerTimingPreviews";
let cached: OwnerTimingPack | null = null;

/** Optional compressed data is fetched only during listening, never precached at startup. */
export async function loadOwnerTimingPack(signal: AbortSignal): Promise<OwnerTimingPack | null> {
  if (signal.aborted || !OWNER_TIMING_PACK_SHA) return null;
  if (cached) return cached;
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`,
      { signal },
    );
    if (!response.ok || Number(response.headers.get("content-length")) > 250_000) return null;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 250_000) return null;
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== OWNER_TIMING_PACK_SHA || signal.aborted) return null;
    const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
    const decoder = new TextDecoder();
    let text = "",
      size = 0;
    try {
      while (true) {
        const item = await reader.read();
        if (item.done) break;
        size += item.value.byteLength;
        if (size > 2_000_000 || signal.aborted) {
          await reader.cancel();
          return null;
        }
        text += decoder.decode(item.value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
    const pack = JSON.parse(text + decoder.decode()) as OwnerTimingPack;
    if (
      pack.version !== 2 ||
      !Array.isArray(pack.records) ||
      pack.records.length > 400 ||
      pack.approval.reviewStatus !== "owner-preview" ||
      signal.aborted
    )
      return null;
    cached = pack;
    return pack;
  } catch {
    return null;
  }
}

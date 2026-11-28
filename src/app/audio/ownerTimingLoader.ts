import { OWNER_TIMING_PACK_SHA, type OwnerTimingPack } from "./ownerTimingPreviews";
import partitions from "./ownerTimingPartitions.json";
const timingPartitions: readonly { sha256: string; recordings: string[] }[] = partitions;
const cached = new Map<string, OwnerTimingPack>();
declare const __TIMING_ASSET_BASE__: string;

/** Additional estimates are partitioned; only the current recording's partition is read. */
export function loadOwnerTimingForRecording(sha256: string, signal: AbortSignal) {
  const matching = timingPartitions.filter((part) => part.recordings.includes(sha256));
  if (timingPartitions.length > 16 || matching.length > 1) return Promise.resolve(null);
  return loadOwnerTimingPack(signal, matching[0]?.sha256 ?? OWNER_TIMING_PACK_SHA);
}

/** Optional compressed data is fetched only during listening, never precached at startup. */
export async function loadOwnerTimingPack(
  signal: AbortSignal,
  sha256 = OWNER_TIMING_PACK_SHA,
): Promise<OwnerTimingPack | null> {
  if (signal.aborted || !/^[a-f0-9]{64}$/.test(sha256)) return null;
  const existing = cached.get(sha256);
  if (existing) return existing;
  try {
    const base = typeof __TIMING_ASSET_BASE__ === "string" ? __TIMING_ASSET_BASE__ : "/__timing-assets__/";
    const url =
      sha256 === OWNER_TIMING_PACK_SHA
        ? `${import.meta.env.BASE_URL}data/listening-timings/owner-${sha256}.bin`
        : `${base}${sha256}.bin`;
    const response = await fetch(url, { signal });
    if (!response.ok || Number(response.headers.get("content-length")) > 250_000) return null;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 250_000) return null;
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== sha256 || signal.aborted) return null;
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
    if (cached.size >= 4) cached.delete(cached.keys().next().value!);
    cached.set(sha256, pack);
    return pack;
  } catch {
    return null;
  }
}

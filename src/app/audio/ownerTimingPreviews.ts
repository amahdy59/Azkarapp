import type { ListeningTimingAnnotation } from "./listeningTimings";
import type { QuranTimingAnnotation } from "./quranTimings";
import type { TimingApproval } from "./timingApproval";

export interface PackedTimingRecord {
  v: string[];
  s: string;
  d: number;
  l: "ar" | "en";
  h?: string;
  w?: [number, number, number, number, number][];
  u?: [number, number, number][];
  q?: [string, number, number, [number, number, number][]][];
}
export interface OwnerTimingPack {
  version: 2;
  approval: TimingApproval;
  records: PackedTimingRecord[];
}
export const OWNER_TIMING_PACK_SHA = "ebd64f07100751ae2771203bf190ac4a52fade71021627cf52e8745e94bbc54c";

export function expandOwnerTiming(
  pack: OwnerTimingPack,
  record: PackedTimingRecord,
  text = "",
): ListeningTimingAnnotation | QuranTimingAnnotation {
  const common = { ...pack.approval, sha256: record.s, durationMs: record.d, unit: "milliseconds" as const };
  let previousEnd = 0;
  if (record.q)
    return {
      ...common,
      variantId: record.v[0]!,
      verses: record.q.map(([verseKey, gap, duration, words]) => {
        const startMs = previousEnd + gap,
          endMs = startMs + duration;
        previousEnd = endMs;
        let wordEnd = startMs;
        return {
          verseKey,
          startMs,
          endMs,
          words: words.map(([position, wordGap, wordDuration]) => {
            const startMs = wordEnd + wordGap,
              endMs = startMs + wordDuration;
            wordEnd = endMs;
            return { position, startMs, endMs };
          }),
        };
      }),
    };
  return {
    ...common,
    variantIds: record.v,
    language: record.l,
    transcript: text,
    textSha256: record.h!,
    words: record.w!.map(([startOffset, endOffset, occurrence, gap, duration]) => {
      const startMs = previousEnd + gap,
        endMs = startMs + duration;
      previousEnd = endMs;
      return { startOffset, endOffset, occurrence, startMs, endMs };
    }),
    unresolvedWords: record.u!.map(([startOffset, endOffset, occurrence]) => ({ startOffset, endOffset, occurrence })),
  };
}

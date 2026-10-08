import type { ResolvedAudioSegment } from "./audioTypes";

export interface QuranWordTiming {
  position: number;
  startMs: number;
  endMs: number;
}
export interface QuranVerseTiming {
  verseKey: string;
  startMs: number;
  endMs: number;
  words?: QuranWordTiming[];
}
export interface QuranTimingAnnotation {
  variantId: string;
  sha256: string;
  durationMs: number;
  unit: "milliseconds";
  source: string;
  authoredBy: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewStatus: "approved";
  verses: QuranVerseTiming[];
}

/** Authoring and runtime boundary. Approval is independent of structural validation. */
export function validateQuranTiming(annotation: QuranTimingAnnotation, segment: ResolvedAudioSegment): string[] {
  const issues: string[] = [];
  const range = segment.quranReference;
  if (!range || !segment.sha256 || annotation.variantId !== segment.variantId || annotation.sha256 !== segment.sha256)
    issues.push("Recording identity or Quran range does not match.");
  if (
    !/^[a-f0-9]{64}$/.test(annotation.sha256) ||
    annotation.unit !== "milliseconds" ||
    annotation.durationMs !== segment.durationMs
  )
    issues.push("Checksum, units or duration is invalid.");
  if (
    annotation.reviewStatus !== "approved" ||
    !annotation.source?.trim() ||
    !annotation.authoredBy?.trim() ||
    !annotation.reviewedBy?.trim() ||
    annotation.authoredBy.trim() === annotation.reviewedBy.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(annotation.reviewedAt) ||
    !Number.isFinite(Date.parse(annotation.reviewedAt))
  )
    issues.push("An independent dated review and source are required.");
  if (!Array.isArray(annotation.verses) || !annotation.verses.length) return [...issues, "Verse timings are missing."];
  let previousEnd = 0;
  let previousAyah = (range?.ayahStart ?? 1) - 1;
  for (const verse of annotation.verses) {
    const [surah, ayah] = verse.verseKey.split(":").map(Number);
    if (
      !/^\d+:\d+$/.test(verse.verseKey) ||
      surah !== range?.surah ||
      ayah !== previousAyah + 1 ||
      ayah > (range?.ayahEnd ?? 0)
    )
      issues.push("Verses must cover the recording range in order.");
    if (!validInterval(verse, previousEnd, annotation.durationMs))
      issues.push("Verse intervals overlap or exceed the recording.");
    let wordEnd = verse.startMs;
    let wordPosition = 0;
    for (const word of verse.words ?? []) {
      if (
        !Number.isInteger(word.position) ||
        word.position <= wordPosition ||
        !validInterval(word, wordEnd, verse.endMs)
      )
        issues.push("Word positions or intervals are invalid.");
      wordEnd = word.endMs;
      wordPosition = word.position;
    }
    previousEnd = verse.endMs;
    previousAyah = ayah ?? 0;
  }
  if (previousAyah !== range?.ayahEnd) issues.push("Verse coverage is incomplete.");
  return issues;
}

function validInterval(value: { startMs: number; endMs: number }, lower: number, upper: number) {
  return (
    Number.isInteger(value.startMs) &&
    Number.isInteger(value.endMs) &&
    value.startMs >= lower &&
    value.endMs > value.startMs &&
    value.endMs <= upper
  );
}

/** End-exclusive lookup deliberately returns no highlight during unannotated pauses. */
function findInterval<T extends { startMs: number; endMs: number }>(items: readonly T[], ms: number): T | null {
  let low = 0;
  let high = items.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    const item = items[mid]!;
    if (ms < item.startMs) high = mid - 1;
    else if (ms >= item.endMs) low = mid + 1;
    else return item;
  }
  return null;
}

export function getQuranPlaybackCue(annotation: QuranTimingAnnotation | null, currentTime: number) {
  const ms = currentTime * 1000; // Media time already accounts for playback speed.
  const verse = annotation && Number.isFinite(ms) ? findInterval(annotation.verses, ms) : null;
  const word = verse ? findInterval(verse.words ?? [], ms) : null;
  return {
    verseKey: verse?.verseKey ?? null,
    word: word && verse ? { verseKey: verse.verseKey, position: word.position } : null,
  };
}

/** No recording has reviewed timings yet. Register only independently reviewed exact-file annotations here. */
export const QURAN_TIMING_CATALOG: readonly QuranTimingAnnotation[] = [];

export function resolveQuranTiming(segment: ResolvedAudioSegment | null, catalog = QURAN_TIMING_CATALOG) {
  if (!segment) return null;
  const candidates = catalog.filter(
    (annotation) => annotation.variantId === segment.variantId && annotation.sha256 === segment.sha256,
  );
  return candidates.length === 1 && !validateQuranTiming(candidates[0]!, segment).length ? candidates[0]! : null;
}

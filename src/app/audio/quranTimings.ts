import type { ResolvedAudioSegment } from "./audioTypes";
import { validTimingApproval, type TimingApproval } from "./timingApproval";

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
export interface QuranTimingAnnotation extends TimingApproval {
  variantId: string;
  sha256: string;
  durationMs: number;
  unit: "milliseconds";
  source: string;
  authoredBy: string;
  reviewedBy: string;
  reviewedAt: string;
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
  if (!validTimingApproval(annotation)) issues.push("An independent dated review and source are required.");
  const preview = annotation.reviewStatus === "owner-preview";
  if (!Array.isArray(annotation.verses) || !annotation.verses.length) return [...issues, "Verse timings are missing."];
  let previousEnd = 0;
  let previousAyah = (range?.ayahStart ?? 1) - 1;
  for (const verse of annotation.verses) {
    const [surah = 0, ayah = 0] = verse.verseKey.split(":").map(Number);
    if (
      !/^\d+:\d+$/.test(verse.verseKey) ||
      surah !== range?.surah ||
      (preview ? ayah <= previousAyah : ayah !== previousAyah + 1) ||
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
  if (!preview && previousAyah !== range?.ayahEnd) issues.push("Verse coverage is incomplete.");
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

/** Latest interval to begin. Its end still bounds the actual highlight. */
function findStartedInterval<T extends { startMs: number }>(items: readonly T[], ms: number): T | undefined {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (ms < items[mid]!.startMs) high = mid;
    else low = mid + 1;
  }
  return items[low - 1];
}

export function getQuranPlaybackCue(annotation: QuranTimingAnnotation | null, currentTime: number) {
  const ms = currentTime * 1000; // Media time already accounts for playback speed.
  const started = annotation && Number.isFinite(ms) ? findStartedInterval(annotation.verses, ms) : undefined;
  const verse = started && ms < started.endMs ? started : undefined;
  const word = verse?.words && findStartedInterval(verse.words, ms);
  return {
    followVerseKey: started?.verseKey ?? null,
    verseKey: verse?.verseKey ?? null,
    verseHasWords: Boolean(verse?.words?.length),
    word: word && verse && ms < word.endMs ? { verseKey: verse.verseKey, position: word.position } : null,
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

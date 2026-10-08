import type { ResolvedAudioSegment } from "./audioTypes";
import { validTimingApproval, type TimingApproval } from "./timingApproval";

export interface ListeningWordTiming {
  startOffset: number;
  endOffset: number;
  startMs: number;
  endMs: number;
  occurrence: number;
}
export interface ListeningTimingAnnotation extends TimingApproval {
  variantIds: string[];
  sha256: string;
  durationMs: number;
  language: "ar" | "en";
  transcript: string;
  textSha256: string;
  unit: "milliseconds";
  source: string;
  authoredBy: string;
  reviewedBy: string;
  reviewedAt: string;
  words: ListeningWordTiming[];
  /** Explicitly reviewed display tokens absent from this recording (e.g. printed verse numbers). */
  unspokenWords?: Pick<ListeningWordTiming, "startOffset" | "endOffset" | "occurrence">[];
  /** Missing model boundaries are explicit preview gaps, never declared unspoken. */
  unresolvedWords?: Pick<ListeningWordTiming, "startOffset" | "endOffset" | "occurrence">[];
}

/** Exact display wording is required. A translation of the spoken words is not an alignment. */
export function validateListeningTiming(
  annotation: ListeningTimingAnnotation,
  segment: ResolvedAudioSegment,
  text: string,
  language: "ar" | "en",
) {
  const issues: string[] = [];
  if (
    !annotation.variantIds?.includes(segment.variantId) ||
    annotation.sha256 !== segment.sha256 ||
    !/^[a-f0-9]{64}$/.test(annotation.sha256) ||
    annotation.durationMs !== segment.durationMs ||
    annotation.unit !== "milliseconds" ||
    annotation.language !== language ||
    (segment.voiceId === "english-george" ? "en" : "ar") !== language ||
    annotation.transcript !== text ||
    !/^[a-f0-9]{64}$/.test(annotation.textSha256)
  )
    issues.push("Recording, language or exact transcript differs.");
  if (!validTimingApproval(annotation)) issues.push("Dated review or explicit owner preview acceptance is required.");
  const tokens = [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)];
  const repetitions = segment.embeddedRepetitions ?? 1;
  const unspoken = annotation.unspokenWords ?? [];
  const unresolved = annotation.unresolvedWords ?? [];
  if (annotation.reviewStatus !== "owner-preview" && unresolved.length)
    issues.push("Reviewed timings cannot contain unresolved words.");
  if (
    !Array.isArray(annotation.words) ||
    !Array.isArray(unspoken) ||
    !Array.isArray(unresolved) ||
    annotation.words.length + unspoken.length + unresolved.length !== tokens.length * repetitions ||
    !tokens.length ||
    !annotation.words.length
  )
    return [...issues, "Complete word occurrences are required."];
  const coverage = [...annotation.words, ...unspoken, ...unresolved].sort(
    (a, b) => a.occurrence - b.occurrence || a.startOffset - b.startOffset,
  );
  for (let occurrence = 0; occurrence < repetitions; occurrence++) {
    if (!annotation.words.some((word) => word.occurrence === occurrence))
      issues.push("Each embedded repetition must have spoken words.");
  }
  for (let index = 0; index < coverage.length; index++) {
    const word = coverage[index]!;
    const token = tokens[index % tokens.length]!;
    if (
      word.startOffset !== token.index ||
      word.endOffset !== token.index + token[0].length ||
      word.occurrence !== Math.floor(index / tokens.length)
    )
      issues.push("Every display word requires an explicit spoken or unspoken review.");
  }
  let previousEnd = 0;
  let previousOccurrence = 0,
    previousOffset = -1;
  for (const word of annotation.words) {
    if (
      word.occurrence < previousOccurrence ||
      (word.occurrence === previousOccurrence && word.startOffset <= previousOffset) ||
      !Number.isInteger(word.startMs) ||
      !Number.isInteger(word.endMs) ||
      word.startMs < previousEnd ||
      word.endMs <= word.startMs ||
      word.endMs > annotation.durationMs
    )
      issues.push("Word boundaries, repetitions or intervals are invalid.");
    previousEnd = word.endMs;
    previousOccurrence = word.occurrence;
    previousOffset = word.startOffset;
  }
  return issues;
}

/** Populated only by an independent review. Draft model output never enters the app. */
export const LISTENING_TIMING_CATALOG: readonly ListeningTimingAnnotation[] = [];

export function resolveListeningTiming(
  segment: ResolvedAudioSegment | null,
  text: string,
  language: "ar" | "en",
  catalog = LISTENING_TIMING_CATALOG,
) {
  if (!segment) return null;
  const candidates = catalog.filter(
    (item) => item.variantIds.includes(segment.variantId) && item.transcript === text && item.language === language,
  );
  return candidates.length === 1 && !validateListeningTiming(candidates[0]!, segment, text, language).length
    ? candidates[0]!
    : null;
}

/** Native media time includes playback speed. Silence and the exact end have no cue. */
export function getListeningWordCue(annotation: ListeningTimingAnnotation | null, seconds: number) {
  if (!annotation || !Number.isFinite(seconds)) return null;
  const ms = seconds * 1000;
  let low = 0,
    high = annotation.words.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const word = annotation.words[middle]!;
    if (ms < word.startMs) high = middle - 1;
    else if (ms >= word.endMs) low = middle + 1;
    else return word;
  }
  return null;
}

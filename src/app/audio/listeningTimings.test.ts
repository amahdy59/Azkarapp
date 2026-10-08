import { describe, expect, it } from "vitest";
import {
  getListeningWordCue,
  resolveListeningTiming,
  validateListeningTiming,
  type ListeningTimingAnnotation,
} from "./listeningTimings";
import type { ResolvedAudioSegment } from "./audioTypes";

const segment: ResolvedAudioSegment = {
  id: "s",
  variantId: "v",
  voiceId: "english-george",
  voiceName: "George",
  sourceName: "Source",
  attribution: "Source",
  url: "/audio.mp3",
  mimeType: "audio/mpeg",
  sha256: "a".repeat(64),
  durationMs: 2000,
};
const approved: ListeningTimingAnnotation = {
  variantIds: ["v"],
  sha256: segment.sha256!,
  durationMs: 2000,
  language: "en",
  transcript: "Allah, protect me.",
  textSha256: "b".repeat(64),
  unit: "milliseconds",
  source: "reviewed-source",
  authoredBy: "Author",
  reviewedBy: "Reviewer",
  reviewedAt: "2026-10-08",
  reviewStatus: "approved",
  words: [
    { startOffset: 0, endOffset: 5, occurrence: 0, startMs: 100, endMs: 400 },
    { startOffset: 7, endOffset: 14, occurrence: 0, startMs: 500, endMs: 1000 },
    { startOffset: 15, endOffset: 17, occurrence: 0, startMs: 1200, endMs: 1500 },
  ],
};
describe("exact-recording listening word cues", () => {
  it("requires exact spoken language, identity, wording and unique independent approval", () => {
    expect(resolveListeningTiming(segment, approved.transcript, "en", [approved])).toBe(approved);
    for (const changed of [
      { sha256: "c".repeat(64) },
      { durationMs: 2001 },
      { variantIds: ["different"] },
      { reviewedBy: "Author" },
      { reviewedAt: "invalid" },
      { reviewedAt: "2026-02-31" },
      { source: "" },
      { textSha256: "invalid" },
      { unit: "seconds" },
      { reviewStatus: "draft" },
    ]) {
      expect(
        resolveListeningTiming(segment, approved.transcript, "en", [
          { ...approved, ...changed } as ListeningTimingAnnotation,
        ]),
      ).toBeNull();
    }
    expect(resolveListeningTiming(segment, approved.transcript + " ", "en", [approved])).toBeNull();
    expect(resolveListeningTiming(segment, approved.transcript, "ar", [approved])).toBeNull();
    expect(
      resolveListeningTiming({ ...segment, voiceId: "abdullah-muhammad" }, approved.transcript, "en", [approved]),
    ).toBeNull();
    expect(resolveListeningTiming(segment, approved.transcript, "en", [approved, approved])).toBeNull();
    expect(resolveListeningTiming(null, approved.transcript, "en")).toBeNull();
  });
  it("has no cue during silence, exact ends, invalid time or missing timings; seeking uses media time", () => {
    for (const time of [0, 0.4, 1, 1.5, 2, -1, NaN, Infinity]) expect(getListeningWordCue(approved, time)).toBeNull();
    expect(getListeningWordCue(approved, 0.1)).toBe(approved.words[0]);
    expect(getListeningWordCue(approved, 0.9)).toBe(approved.words[1]);
    expect(getListeningWordCue(approved, 1.2)).toBe(approved.words[2]);
    expect(getListeningWordCue(null, 0.1)).toBeNull();
  });
  it("rejects missing, overlapping, reordered, fractional or out-of-bounds words", () => {
    for (const changed of [
      { startMs: -1 },
      { endMs: 2001 },
      { startMs: 400.1 },
      { endMs: 100 },
      { startOffset: 1 },
      { endOffset: 6 },
      { occurrence: 1 },
    ]) {
      expect(
        validateListeningTiming(
          { ...approved, words: [{ ...approved.words[0]!, ...changed }, ...approved.words.slice(1)] },
          segment,
          approved.transcript,
          "en",
        ).length,
      ).toBeGreaterThan(0);
    }
    expect(
      validateListeningTiming({ ...approved, words: approved.words.slice(1) }, segment, approved.transcript, "en")
        .length,
    ).toBeGreaterThan(0);
    expect(
      validateListeningTiming({ ...approved, words: [] }, segment, approved.transcript, "en").length,
    ).toBeGreaterThan(0);
    expect(
      validateListeningTiming(
        { ...approved, words: [approved.words[1]!, approved.words[0]!, approved.words[2]!] },
        segment,
        approved.transcript,
        "en",
      ).length,
    ).toBeGreaterThan(0);
  });
  it("maps embedded repetition occurrences to unchanged UTF-16 Arabic words", () => {
    const text = "🤲 بِسْمِ اللَّهِ";
    const repeated = { ...segment, voiceId: "abdullah-muhammad", embeddedRepetitions: 2 };
    const words = [0, 1].flatMap((occurrence) => [
      { startOffset: 3, endOffset: 9, startMs: 100 + occurrence * 800, endMs: 400 + occurrence * 800, occurrence },
      { startOffset: 10, endOffset: 17, startMs: 500 + occurrence * 800, endMs: 800 + occurrence * 800, occurrence },
    ]);
    const timing = { ...approved, transcript: text, language: "ar" as const, words };
    expect(validateListeningTiming(timing, repeated, text, "ar")).toEqual([]);
    expect(getListeningWordCue(timing, 0.9)?.occurrence).toBe(1);
  });
  it("requires explicit review of printed tokens absent from the recording and never highlights them", () => {
    const text = "Allah 1";
    const timing = {
      ...approved,
      transcript: text,
      words: [{ ...approved.words[0]!, startOffset: 0, endOffset: 5 }],
      unspokenWords: [{ startOffset: 6, endOffset: 7, occurrence: 0 }],
    };
    expect(validateListeningTiming(timing, segment, text, "en")).toEqual([]);
    expect(getListeningWordCue(timing, 0.2)?.startOffset).toBe(0);
    expect(getListeningWordCue(timing, 0.5)).toBeNull();
    expect(validateListeningTiming({ ...timing, unspokenWords: [] }, segment, text, "en").length).toBeGreaterThan(0);
    expect(
      validateListeningTiming(
        { ...timing, unspokenWords: [{ startOffset: 0, endOffset: 5, occurrence: 0 }] },
        segment,
        text,
        "en",
      ).length,
    ).toBeGreaterThan(0);
    expect(validateListeningTiming({ ...timing, words: [] }, segment, text, "en").length).toBeGreaterThan(0);
  });
});

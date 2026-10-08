import { describe, expect, it } from "vitest";
import {
  getQuranPlaybackCue,
  resolveQuranTiming,
  validateQuranTiming,
  type QuranTimingAnnotation,
} from "./quranTimings";
import type { ResolvedAudioSegment } from "./audioTypes";

// Synthetic alignment exists only in tests; it is never a production recording annotation.
const segment: ResolvedAudioSegment = {
  id: "test",
  variantId: "test",
  sha256: "a".repeat(64),
  quranReference: { surah: 67, ayahStart: 1, ayahEnd: 2 },
  voiceId: "test",
  voiceName: "Test",
  sourceName: "Test",
  attribution: "Test",
  url: "/test.mp3",
  durationMs: 5000,
  mimeType: "audio/mpeg",
};
const annotation: QuranTimingAnnotation = {
  variantId: "test",
  sha256: "a".repeat(64),
  durationMs: 5000,
  unit: "milliseconds",
  source: "Synthetic test fixture",
  authoredBy: "Fixture author",
  reviewedBy: "Fixture reviewer",
  reviewedAt: "2026-10-08",
  reviewStatus: "approved",
  verses: [
    {
      verseKey: "67:1",
      startMs: 200,
      endMs: 2000,
      words: [
        { position: 1, startMs: 200, endMs: 600 },
        { position: 2, startMs: 700, endMs: 1800 },
      ],
    },
    { verseKey: "67:2", startMs: 2500, endMs: 4900 },
  ],
};

describe("reviewed Quran timing boundary", () => {
  it("ships no alignment and resolves only a unique reviewed exact-file match", () => {
    expect(resolveQuranTiming(segment)).toBeNull();
    expect(validateQuranTiming(annotation, segment)).toEqual([]);
    expect(resolveQuranTiming(segment, [annotation])).toBe(annotation);
    expect(resolveQuranTiming(segment, [annotation, annotation])).toBeNull();
    expect(resolveQuranTiming({ ...segment, sha256: "b".repeat(64) }, [annotation])).toBeNull();
    expect(resolveQuranTiming(null)).toBeNull();
  });
  it.each([
    { unit: "seconds" },
    { durationMs: 6000 },
    { sha256: "invalid" },
    { variantId: "other" },
    { reviewStatus: "pending" },
    { source: "" },
    { reviewedBy: "Fixture author" },
    { authoredBy: "" },
    { reviewedAt: "invalid" },
    { verses: [] },
    { verses: [{ verseKey: "67:2", startMs: 200, endMs: 1000 }] },
    { verses: [{ verseKey: "18:1", startMs: 200, endMs: 1000 }] },
    { verses: [{ verseKey: "67:1", startMs: -1, endMs: 6000 }] },
    {
      verses: [
        { verseKey: "67:1", startMs: 0, endMs: 3000 },
        { verseKey: "67:2", startMs: 2000, endMs: 4900 },
      ],
    },
    {
      verses: [{ ...annotation.verses[0]!, words: [{ position: 0, startMs: 0, endMs: 3000 }] }, annotation.verses[1]!],
    },
  ])("rejects invalid identity, review, range or intervals: %j", (patch) => {
    expect(validateQuranTiming({ ...annotation, ...patch } as QuranTimingAnnotation, segment).length).toBeGreaterThan(
      0,
    );
  });
  it("fails closed without the approved segment range or checksum", () => {
    expect(resolveQuranTiming({ ...segment, quranReference: undefined }, [annotation])).toBeNull();
    expect(resolveQuranTiming({ ...segment, sha256: undefined }, [annotation])).toBeNull();
  });
  it("reconciles seeks, end-exclusive boundaries and gaps using media seconds", () => {
    expect(getQuranPlaybackCue(annotation, 0.199).verseKey).toBeNull();
    expect(getQuranPlaybackCue(annotation, 0.2).word?.position).toBe(1);
    expect(getQuranPlaybackCue(annotation, 0.6).word).toBeNull();
    expect(getQuranPlaybackCue(annotation, 0.7).word?.position).toBe(2);
    expect(getQuranPlaybackCue(annotation, 2).verseKey).toBeNull();
    expect(getQuranPlaybackCue(annotation, 3).verseKey).toBe("67:2");
    expect(getQuranPlaybackCue(annotation, 0.4).verseKey).toBe("67:1");
    expect(getQuranPlaybackCue(annotation, 5).verseKey).toBeNull();
    expect(getQuranPlaybackCue(annotation, NaN).verseKey).toBeNull();
    expect(getQuranPlaybackCue(null, 1).verseKey).toBeNull();
  });
});

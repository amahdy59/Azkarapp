import { webcrypto, createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { loadReviewedListeningTiming, loadReviewedQuranTiming } from "./listeningTimingLoader";
import type { ResolvedAudioSegment } from "./audioTypes";
import type { ReviewedTimingFile } from "./reviewedTimingFiles";
const text = "Allah";
const digest = createHash("sha256").update(text).digest("hex");
const segment = {
  variantId: "v",
  sha256: "a".repeat(64),
  durationMs: 1000,
  voiceId: "english-george",
} as ResolvedAudioSegment;
const file: ReviewedTimingFile = {
  kind: "listening",
  variantIds: ["v"],
  sha256: segment.sha256!,
  annotationSha256: "c".repeat(64),
  textSha256: digest,
  language: "en",
};
const annotation = {
  variantIds: ["v"],
  sha256: segment.sha256,
  durationMs: 1000,
  language: "en",
  textSha256: digest,
  transcript: text,
  unit: "milliseconds",
  source: "test only",
  authoredBy: "Author",
  reviewedBy: "Reviewer",
  reviewedAt: "2026-10-08",
  reviewStatus: "approved",
  words: [{ startOffset: 0, endOffset: 5, occurrence: 0, startMs: 100, endMs: 800 }],
};
file.annotationSha256 = createHash("sha256").update(JSON.stringify(annotation)).digest("hex");
afterEach(() => vi.unstubAllGlobals());
it("requests only the exact recording/transcript file; missing, ambiguous and aborted registrations have no cue", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(annotation)));
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  expect(await loadReviewedListeningTiming(segment, text, "en", signal, [])).toBeNull();
  expect(await loadReviewedListeningTiming(segment, text + ".", "en", signal, [file])).toBeNull();
  expect(await loadReviewedListeningTiming(segment, text, "ar", signal, [file])).toBeNull();
  expect(await loadReviewedListeningTiming(segment, text, "en", signal, [file, file])).toBeNull();
  const aborted = new AbortController();
  aborted.abort();
  expect(await loadReviewedListeningTiming(segment, text, "en", aborted.signal, [file])).toBeNull();
  expect(fetcher).not.toHaveBeenCalled();
  expect(await loadReviewedListeningTiming(segment, text, "en", signal, [file])).toEqual(annotation);
  expect(fetcher.mock.calls[0]![0]).toContain(`listening-${segment.sha256}-${file.annotationSha256}.json`);
});
it("rejects offline failures, oversized, malformed, draft or swapped content", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const response of [
    new Response("", { status: 404 }),
    new Response("bad json"),
    new Response("{}", { headers: { "content-length": "750001" } }),
    new Response("x".repeat(750001)),
    new Response(JSON.stringify({ ...annotation, reviewStatus: "draft" })),
    new Response(JSON.stringify({ ...annotation, sha256: "b".repeat(64) })),
  ]) {
    fetcher.mockResolvedValue(response);
    expect(await loadReviewedListeningTiming(segment, text, "en", new AbortController().signal, [file])).toBeNull();
  }
  fetcher.mockRejectedValue(new Error("offline"));
  expect(await loadReviewedListeningTiming(segment, text, "en", new AbortController().signal, [file])).toBeNull();
});
it("loads Quran intervals against the frozen range and rejects changed reciters or timing identities", async () => {
  vi.stubGlobal("crypto", webcrypto);
  const quranSegment = {
    ...segment,
    voiceId: "abdullah-muhammad",
    quranReference: { surah: 67, ayahStart: 1, ayahEnd: 1 },
  };
  const quranFile: ReviewedTimingFile = { ...file, kind: "quran", language: "ar", textSha256: undefined };
  const quranAnnotation = { ...annotation, variantId: "v", verses: [{ verseKey: "67:1", startMs: 0, endMs: 1000 }] };
  quranFile.annotationSha256 = createHash("sha256").update(JSON.stringify(quranAnnotation)).digest("hex");
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(quranAnnotation)));
  vi.stubGlobal("fetch", fetcher);
  expect(await loadReviewedQuranTiming(quranSegment, new AbortController().signal, [quranFile])).toEqual(
    quranAnnotation,
  );
  expect(
    await loadReviewedQuranTiming({ ...quranSegment, sha256: "b".repeat(64) }, new AbortController().signal, [
      quranFile,
    ]),
  ).toBeNull();
  expect(await loadReviewedQuranTiming(quranSegment, new AbortController().signal, [])).toBeNull();
  expect(await loadReviewedQuranTiming(quranSegment, new AbortController().signal, [quranFile, quranFile])).toBeNull();
  fetcher.mockResolvedValue(new Response(JSON.stringify({ ...quranAnnotation, reviewStatus: "draft" })));
  expect(await loadReviewedQuranTiming(quranSegment, new AbortController().signal, [quranFile])).toBeNull();
});

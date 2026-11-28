import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { alignmentJobSha256, packEstimatedRecord } from "./pack-additional-timing-previews.mjs";
const text = "بِهِۦ لَهُۥ";
const candidate = {
  text,
  textSha256: createHash("sha256").update(text).digest("hex"),
  tokens: [
    { text: "بِهِۦ", startOffset: 0, endOffset: 5 },
    { text: "لَهُۥ", startOffset: 6, endOffset: 11 },
  ],
};
const job = {
  sha256: "a".repeat(64),
  durationMs: 1000,
  language: "ar",
  embeddedRepetitions: 1,
  variants: [{ variantId: "one" }, { variantId: "same-bytes-alias" }],
  candidates: [candidate],
};
const draft = {
  status: "draft",
  pipelineVersion: 4,
  jobSha256: alignmentJobSha256(job),
  sha256: job.sha256,
  durationMs: 1000,
  decodedDurationMs: 1000,
  language: "ar",
};
const aligned = {
  textSha256: candidate.textSha256,
  transcript: text,
  words: candidate.tokens.map((token, index) => ({
    ...token,
    occurrence: 0,
    startMs: 100 + index * 400,
    endMs: 300 + index * 400,
    acousticScore: 0.8,
    flags: [],
  })),
};
describe("additional exact-recording estimates", () => {
  it("preserves display offsets and same-byte aliases while omitting uncertain words", () => {
    const value = packEstimatedRecord(job, draft, {
      ...aligned,
      words: [aligned.words[0], { ...aligned.words[1], flags: ["unusual-duration"] }],
    });
    expect(value.record.v).toEqual(["one", "same-bytes-alias"]);
    expect(value.record.w).toEqual([[0, 5, 0, 100, 200]]);
    expect(value.record.u).toEqual([[6, 11, 0]]);
    expect(value.unresolved).toBe(1);
    expect(
      packEstimatedRecord(job, draft, {
        ...aligned,
        words: aligned.words.map((word) => ({ ...word, acousticScore: 0.1 })),
      }),
    ).toBeNull();
  });
  it("refuses stale identities, changed wording and unverified duration", () => {
    for (const changed of [
      { ...draft, sha256: "b".repeat(64) },
      { ...draft, jobSha256: "0".repeat(64) },
      { ...draft, pipelineVersion: 3 },
      { ...draft, durationNeedsReview: true },
      { ...draft, decodedDurationMs: 2000 },
    ])
      expect(() => packEstimatedRecord(job, changed, aligned)).toThrow(/mismatched/);
    expect(() => packEstimatedRecord(job, draft, { ...aligned, transcript: text + "." })).toThrow();
  });
  it("retains Quran semantic gaps rather than filling flagged intervals", () => {
    const tokens = candidate.tokens.map((token, index) => ({ ...token, verseKey: "1:1", position: index + 1 }));
    const qjob = { ...job, candidates: [{ ...candidate, tokens }] };
    const qdraft = { ...draft, jobSha256: alignmentJobSha256(qjob) };
    const qcandidate = {
      ...aligned,
      words: tokens.map((token, index) => ({ ...aligned.words[index], ...token, flags: index ? ["anchor-seam"] : [] })),
    };
    const value = packEstimatedRecord(qjob, qdraft, qcandidate);
    expect(value.record.q).toEqual([["1:1", 100, 200, [[1, 0, 200]]]]);
    expect(value.unresolved).toBe(1);
  });
});

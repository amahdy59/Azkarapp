import assert from "node:assert/strict";
import { test } from "vitest";
import { collectAlignmentJobs, tokenizeAlignmentText } from "./listening-alignment-inputs.mjs";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const variant = {
  id: "v",
  voiceId: "english-george",
  sha256: "a".repeat(64),
  durationMs: 1000,
  byteSize: 100,
  relativePath: "x.mp3",
  reviewStatus: "approved",
};
const asset = {
  id: "a",
  reviewStatus: "approved",
  normalizedTextHash: "identity",
  segments: [{ id: "s", transcriptArabic: "Arabic", variants: [variant] }],
};

test("model normalization retains exact UTF-16 offsets and canonical text", () => {
  const text = "🌿 O Allah’s well-being!";
  const tokens = tokenizeAlignmentText(text, "en");
  assert.deepEqual(
    tokens.map((t) => t.alignmentText),
    ["O", "ALLAH'S", "WELLBEING"],
  );
  assert.ok(tokens.every((t) => text.slice(t.startOffset, t.endOffset) === t.text));
  const arabic = tokenizeAlignmentText("أَعُوذُ بِٱللَّهِ", "ar");
  assert.deepEqual(
    arabic.map((t) => t.alignmentText),
    ["أعوذ", "بالله"],
  );
  assert.equal(arabic[0].text, "أَعُوذُ");
});
test("preserves distinct reviewed English candidates instead of choosing by Arabic identity", () => {
  const jobs = collectAlignmentJobs(
    { assets: { a: asset } },
    [
      { id: "one", arabicText: "Arabic", translation: "I seek forgiveness." },
      { id: "two", arabicText: "Arabic", translation: "I ask for forgiveness." },
    ],
    () => "identity",
  );
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].candidates.length, 2);
  assert.equal(jobs[0].status, "unreviewed-input");
});
test("deduplicates identical bytes and refuses contradictory duration/repetition metadata", () => {
  const duplicate = { ...asset, id: "b", segments: [{ ...asset.segments[0], variants: [{ ...variant, id: "copy" }] }] };
  const collect = (b) => collectAlignmentJobs({ assets: { a: asset, b } }, [], () => "identity");
  assert.equal(collect(duplicate)[0].variants.length, 2);
  assert.equal(collect(duplicate)[0].candidates.length, 0);
  duplicate.segments[0].variants[0].embeddedRepetitions = 3;
  assert.throws(() => collect(duplicate), /Conflicting metadata/);
});
test("keeps exact Arabic display candidates alongside the segment transcript", () => {
  const arabic = {
    ...asset,
    segments: [{ ...asset.segments[0], variants: [{ ...variant, voiceId: "abdullah-muhammad" }] }],
  };
  const jobs = collectAlignmentJobs(
    { assets: { a: arabic } },
    [{ id: "display", arabicText: "Arábic" }],
    () => "identity",
  );
  assert.deepEqual(
    jobs[0].candidates.map((value) => value.text),
    ["Arabic", "Arábic"],
  );
});
test("uses Quran semantic coordinates across page splits and omits rejected variants", () => {
  const quran = {
    ...asset,
    segments: [
      {
        ...asset.segments[0],
        quranReference: { surah: 1, ayahStart: 1, ayahEnd: 1 },
        variants: [
          { ...variant, voiceId: "arabic" },
          { ...variant, id: "bad", reviewStatus: "rejected" },
        ],
      },
    ],
  };
  const jobs = collectAlignmentJobs(
    { assets: { quran } },
    [],
    () => "identity",
    new Map([
      [
        "1:1",
        [
          { position: 1, text: "بِسْمِ" },
          { position: 2, text: "اللَّهِ" },
        ],
      ],
    ]),
  );
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].variants.length, 1);
  assert.deepEqual(
    jobs[0].candidates[0].tokens.map((t) => [t.verseKey, t.position]),
    [
      ["1:1", 1],
      ["1:1", 2],
    ],
  );
  assert.throws(
    () => collectAlignmentJobs({ assets: { quran } }, [], () => "identity", new Map([["2:1", []]])),
    /Missing canonical/,
  );
});
test("identical approved recordings have consistent decoded duration and repetition metadata", () => {
  const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
  const byChecksum = new Map();
  for (const source of Object.values(AUDIO_CATALOG.assets))
    for (const segment of source.segments)
      for (const recording of segment.variants) {
        if (recording.reviewStatus !== "approved") continue;
        const metadata = {
          byteSize: recording.byteSize,
          durationMs: recording.durationMs,
          embeddedRepetitions: recording.embeddedRepetitions ?? 1,
        };
        if (byChecksum.has(recording.sha256))
          assert.deepEqual(metadata, byChecksum.get(recording.sha256), recording.id);
        byChecksum.set(recording.sha256, metadata);
      }
});

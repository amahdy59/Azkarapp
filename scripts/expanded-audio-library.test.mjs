import { describe, it } from "vitest";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { Buffer } from "node:buffer";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const { normalizeArabicForAudioMatching, createArabicTextFingerprint } = loadTypeScriptModule(
  "src/app/audio/arabicMatching.ts",
);
const { collectMushafSurahText } = loadTypeScriptModule("src/app/audio/mushafAudioIntegrity.ts");
const { SURAHS } = loadTypeScriptModule("src/app/content/surahInfo.ts");
const evidence = JSON.parse(fs.readFileSync("docs/audio/expanded-library/evidence.json", "utf8"));
const mushaf = JSON.parse(fs.readFileSync("src/app/audio/mushafAudio.data.json", "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
describe("automatically verified expanded recording library", () => {
  it("packs the exact source registry without changing any recording or content identity", () => {
    const { MUSHAF_AUDIO_PACK } = loadTypeScriptModule("src/app/audio/mushafAudioPack.ts");
    assert.deepEqual(JSON.parse(gunzipSync(Buffer.from(MUSHAF_AUDIO_PACK, "base64")).toString()), mushaf);
    const { AUDIO_WAVEFORM_PACK } = loadTypeScriptModule("src/app/audio/audioWaveformPack.ts");
    const original = JSON.parse(fs.readFileSync("src/app/audio/audioWaveforms.json", "utf8"));
    assert.deepEqual(Object.keys(AUDIO_WAVEFORM_PACK).sort(), Object.keys(original).sort());
    for (const [checksum, values] of Object.entries(original))
      assert.deepEqual([...Buffer.from(AUDIO_WAVEFORM_PACK[checksum], "base64")], values);
  });
  it("pins source evidence and never represents deferred listening as completed", () => {
    assert.equal(evidence.sourceCatalogueSha256, hash(fs.readFileSync("docs/audio/opendua-pilot/catalogue.json")));
    assert.match(evidence.verification, /Human listening review is deferred/);
    for (const recording of evidence.recordings) {
      assert.equal(recording.fullDecodePassed, true);
      assert.match(recording.sha256, /^[a-f0-9]{64}$/);
      assert.ok(recording.durationMs > 300);
      assert.ok(recording.byteSize > 1000);
      assert.ok(
        recording.sourceUrl.startsWith(
          recording.kind === "quran" ? "https://cdn.mp3quran.net/audio/" : "https://audio.opendua.org/hisn/v0.0.2/",
        ),
      );
    }
  });
  it("matches each new dua segment's complete source transcript with the displayed registry text", () => {
    for (const mapping of evidence.duaMappings) {
      const asset = AUDIO_CATALOG.assets[mapping.assetId];
      assert.ok(asset, mapping.assetId);
      const segment = mapping.segmentId
        ? asset.segments.find((item) => item.id === mapping.segmentId)
        : asset.segments[0];
      assert.equal(
        normalizeArabicForAudioMatching(mapping.sourceTranscript),
        normalizeArabicForAudioMatching(segment.transcriptArabic),
      );
      assert.equal(mapping.normalizedTranscriptHash, segment.normalizedTranscriptHash);
      assert.ok(
        segment.variants.some(
          (variant) => variant.sha256 === mapping.sha256 && variant.voiceId === "opendua-muhammad-jumah",
        ),
      );
    }
  });
  it("covers every Mushaf surah with complete exact semantic text and separately identified recordings", () => {
    assert.deepEqual(
      mushaf.map((item) => item.surah),
      SURAHS.map((item) => item.number),
    );
    for (const record of mushaf) {
      assert.equal(record.verseCount, SURAHS[record.surah - 1].versesCount);
      const pages = record.pages.map((range) =>
        JSON.parse(fs.readFileSync(`public/data/mushaf/${range.page}.json`, "utf8")),
      );
      assert.equal(
        createArabicTextFingerprint(collectMushafSurahText(record.surah, record.verseCount, pages)),
        record.textHash,
      );
      assert.ok(record.variants.length >= 1);
      assert.equal(new Set(record.variants.map((variant) => variant.voiceId)).size, record.variants.length);
      for (const variant of record.variants) {
        const original = evidence.recordings.find((item) => item.sha256 === variant.sha256);
        assert.ok(original);
        assert.equal(original.surah, record.surah);
        assert.equal(original.verseCount, record.verseCount);
        assert.equal(variant.byteSize, original.byteSize);
        assert.equal(variant.durationMs, original.durationMs);
      }
    }
  });
});

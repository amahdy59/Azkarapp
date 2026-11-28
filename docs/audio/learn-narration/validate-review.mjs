/** Authoring-only integrity checks. No synthesis, network request or upload. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import process from "node:process";
import { URL } from "node:url";
import { loadTypeScriptModule } from "../../../scripts/load-typescript-module.mjs";

const data = JSON.parse(readFileSync(new URL("./script-draft.ar.json", import.meta.url), "utf8"));
const review = readFileSync(new URL("./SCRIPT_REVIEW.ar.md", import.meta.url), "utf8");
const notes = readFileSync(new URL("./REVIEW_NOTES.ar.md", import.meta.url), "utf8");
const sha = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const { IN_PRAYER_AZKAR } = loadTypeScriptModule("src/app/content/inPrayerSupplications.ts");
const { RESTROOM_AZKAR } = loadTypeScriptModule("src/app/content/azkarCore.ts");
const canonical = new Map([...IN_PRAYER_AZKAR, ...RESTROOM_AZKAR].map((item) => [item.id, item]));
assert.equal(data.status, "draft-for-owner-and-source-review");
assert.equal(data.language, "ar");
assert.equal(data.direction, "rtl");
assert.equal(data.revision, 2);
assert.equal(data.productionNotesDocument, "REVIEW_NOTES.ar.md");
assert(!review.includes("للمراجع، لا يُقرأ"), "Production notes must be separate from the narration review");
for (const field of ["generationAllowed", "uploadAllowed", "appIntegrationAllowed"]) {
  assert.equal(data[field], false, `${field} must remain held during this checkpoint`);
}
const ids = new Set(data.clips.map((item) => item.id));
const sourceIds = new Set(data.sources.map((item) => item.id));
assert.equal(ids.size, data.clips.length, "Duplicate clip identity");
assert.equal(sourceIds.size, data.sources.length, "Duplicate source identity");
assert.equal(new Set(data.stages.map((item) => item.id)).size, data.stages.length, "Duplicate stage identity");
for (const item of data.clips) {
  assert.equal(item.status, "draft-for-review");
  assert.equal(item.productionReady, false);
  assert.equal(item.transcriptSha256, sha(item.spokenText), `Transcript hash mismatch: ${item.id}`);
  assert(item.spokenText.trim(), `Empty spoken text: ${item.id}`);
  for (const line of item.spokenText.split("\n"))
    assert(review.includes(`> ${line}`), `Review document differs: ${item.id}`);
  for (const id of item.sourceIds) assert(sourceIds.has(id), `Unknown source: ${id}`);
  if (item.existingContent) {
    const record = canonical.get(item.existingContent.id);
    assert(record, `Missing canonical record: ${item.existingContent.id}`);
    assert.equal(item.spokenText, record.arabicText, `Canonical wording changed: ${item.id}`);
    assert.equal(item.existingContent.exactTextSha256, sha(record.arabicText));
    assert.equal(item.existingContent.existingRepetitionCount, record.repetitionCount);
  }
  if (item.comparisonToExistingContent) {
    const record = canonical.get(item.comparisonToExistingContent.id);
    assert.equal(item.comparisonToExistingContent.originalText, record.arabicText);
    assert.notEqual(item.spokenText, record.arabicText, "A new variant must disclose its changed wording");
    assert.notEqual(item.id, `say-${record.id}`, "Do not reuse a canonical identity for different words");
    assert(
      data.reviewIssues.some((issue) => issue.clipIds.includes(item.id)),
      "New variant lacks a review note",
    );
  }
  if (item.role === "quran-recitation") {
    assert.equal(item.plannedProvider, "existing-reviewed-reciter-recording");
    const original = JSON.parse(readFileSync(item.sourceFile, "utf8"));
    for (const verse of item.verses) {
      const row = original.find((record) => record.k === verse.key);
      assert(row, `Missing Quran verse: ${verse.key}`);
      assert.equal(
        verse.text,
        row.w
          .filter((word) => word[2] === 0)
          .map((word) => word[3])
          .join(" "),
      );
    }
    assert.equal(item.spokenText, item.verses.map((verse) => verse.text).join("\n"));
    const expected = item.id === "quran-1" ? 7 : 4;
    assert.equal(item.verses.length, expected, "Incomplete selected surah");
  } else {
    assert.equal(item.plannedProvider, "heygen");
    assert(item.spokenText.length <= 10_000, `Speech input exceeds the documented limit: ${item.id}`);
  }
  if (item.role === "explanation" || (item.role === "feedback" && item.sourceIds.length)) {
    assert.equal(item.editorialParaphrase, true, "Instructional prose must be distinguishable from quotation");
    assert(item.sourceIds.length, `Teaching claim has no source: ${item.id}`);
  }
}
for (const item of data.stages) {
  for (const id of [item.explanationClipId, ...item.additionalClipIds])
    assert(ids.has(id), `Unknown stage clip: ${id}`);
  assert(notes.includes(item.visualDirectionNotSpoken), `Missing scene direction: ${item.id}`);
  assert(notes.includes(item.reviewerNoteNotSpoken), `Missing content note: ${item.id}`);
  assert(notes.includes(item.evidenceNoteNotSpoken), `Missing evidence explanation: ${item.id}`);
  assert(review.includes(`<a id="${item.id}"></a>`), `Missing review stage: ${item.id}`);
  for (const clipId of item.additionalClipIds) {
    assert(review.includes(`](#${clipId})`), `Missing review audio link: ${clipId}`);
  }
}
for (const source of data.sources) {
  assert(notes.includes(source.url), `Missing source from the evidence ledger: ${source.id}`);
}
for (const group of data.sequenceGroups) {
  assert(group.stageIds.length > 1, "A paired demonstration needs more than one stage");
  for (const stageId of group.stageIds) assert(data.stages.some((item) => item.id === stageId));
  for (const sourceId of group.sourceIds) assert(sourceIds.has(sourceId));
  assert(notes.includes(group.explanationNotSpoken));
}
for (const evidence of data.evidenceHighlights) {
  assert(evidence.sourceIds.length, "Direct quotations need identified sources");
  assert(notes.includes(`> ${evidence.quote}`), "Evidence quotation missing from the notes");
  for (const stageId of evidence.stageIds) assert(data.stages.some((item) => item.id === stageId));
  for (const sourceId of evidence.sourceIds) assert(sourceIds.has(sourceId));
}
const targets = data.clips.filter((item) => item.plannedProvider === "heygen");
assert.equal(data.inventory.clips, data.clips.length);
assert.equal(data.inventory.stages, data.stages.length);
assert.equal(data.inventory.heygenClipsAfterApproval, targets.length);
assert.equal(
  data.inventory.plannedHeygenCharacters,
  targets.reduce((sum, item) => sum + item.spokenText.length, 0),
);
assert.equal(data.inventory.canonicalTextsPreserved, data.clips.filter((item) => item.existingContent).length);
assert.equal(data.inventory.quranAssetsToResolve, data.clips.filter((item) => item.role === "quran-recitation").length);
assert.equal(data.inventory.generatedAudioFiles, 0);
assert.equal(data.inventory.r2UploadedObjects, 0);
for (const text of [JSON.stringify(data), review, notes]) {
  assert(!/sk_V2_[A-Za-z0-9_-]+/.test(text), "Credential-like value in authoring package");
  assert(!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text), "Private key in authoring package");
}
process.stdout.write(
  `${JSON.stringify({ result: "PASS", stages: data.stages.length, clips: data.clips.length, canonicalTextsPreserved: data.inventory.canonicalTextsPreserved, quranVersesPreserved: data.clips.filter((item) => item.verses).reduce((sum, item) => sum + item.verses.length, 0), generationHeld: true, uploadHeld: true, credentialsFound: false })}\n`,
);

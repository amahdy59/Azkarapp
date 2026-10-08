import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { gzipSync } from "node:zlib";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { REVIEWED_TIMING_FILES, reviewedTimingFilename } = loadTypeScriptModule("src/app/audio/reviewedTimingFiles.ts");
const { OWNER_TIMING_PACK_SHA: previousPackSha } = loadTypeScriptModule("src/app/audio/ownerTimingPreviews.ts");
const records = [];
let approval;
for (const file of REVIEWED_TIMING_FILES.filter((value) => value.ownerPreview)) {
  const location = path.join("public/data/listening-timings", reviewedTimingFilename(file));
  const value = JSON.parse(await fs.readFile(location, "utf8"));
  const { reviewStatus, source, authoredBy, reviewedBy, reviewedAt, acceptedBy, acceptedAt } = value;
  approval ??= {
    reviewStatus,
    source:
      "Offline exact-recording CTC alignment; owner accepted estimates for testing, full listening review pending",
    authoredBy,
    reviewedBy,
    reviewedAt,
    acceptedBy,
    acceptedAt,
  };
  if (
    reviewStatus !== "owner-preview" ||
    acceptedBy !== approval.acceptedBy ||
    acceptedAt !== approval.acceptedAt ||
    !source
  )
    throw new Error("Preview provenance differs.");
  records.push(
    value.verses
      ? {
          v: [value.variantId],
          s: value.sha256,
          d: value.durationMs,
          l: "ar",
          q: value.verses.map((verse) => [
            verse.verseKey,
            verse.startMs,
            verse.endMs,
            verse.words.map((word) => [word.position, word.startMs, word.endMs]),
          ]),
        }
      : {
          v: value.variantIds,
          s: value.sha256,
          d: value.durationMs,
          l: value.language,
          h: value.textSha256,
          w: value.words.map((word) => [word.startOffset, word.endOffset, word.occurrence, word.startMs, word.endMs]),
          u: value.unresolvedWords.map((word) => [word.startOffset, word.endOffset, word.occurrence]),
        },
  );
}
if (!records.length) throw new Error("No owner-authorized previews to pack.");
// Lossless deltas preserve every original millisecond while avoiding repeated long timestamps.
for (const record of records) {
  let previousEnd = 0;
  if (record.q)
    record.q = record.q.map(([key, start, end, words]) => {
      let wordEnd = start;
      const tuple = [
        key,
        start - previousEnd,
        end - start,
        words.map(([position, start, end]) => {
          const result = [position, start - wordEnd, end - start];
          wordEnd = end;
          return result;
        }),
      ];
      previousEnd = end;
      return tuple;
    });
  else
    record.w = record.w.map(([startOffset, endOffset, occurrence, start, end]) => {
      const tuple = [startOffset, endOffset, occurrence, start - previousEnd, end - start];
      previousEnd = end;
      return tuple;
    });
}
const bytes = gzipSync(JSON.stringify({ version: 2, approval, records }), { level: 9 });
const sha = crypto.createHash("sha256").update(bytes).digest("hex");
await fs.writeFile(path.join("public/data/listening-timings", `owner-${sha}.bin`), bytes);
const sourceFile = "src/app/audio/ownerTimingPreviews.ts";
await fs.writeFile(
  sourceFile,
  (await fs.readFile(sourceFile, "utf8")).replace(
    /OWNER_TIMING_PACK_SHA = "[^"]*"/,
    `OWNER_TIMING_PACK_SHA = "${sha}"`,
  ),
);
const indexFile = "src/app/audio/reviewedTimingFiles.ts";
await fs.writeFile(
  indexFile,
  (await fs.readFile(indexFile, "utf8")).replace(
    /export const REVIEWED_TIMING_FILES:[\s\S]*?\n\];/,
    `export const REVIEWED_TIMING_FILES: readonly ReviewedTimingFile[] = ${JSON.stringify(REVIEWED_TIMING_FILES.filter((file) => !file.ownerPreview))};`,
  ),
);
// Only remove the exact generated preview names just encoded; reviewed originals remain.
for (const file of REVIEWED_TIMING_FILES.filter((value) => value.ownerPreview)) {
  const name = reviewedTimingFilename(file);
  if (!/^(listening|quran)-[a-f0-9]{64}-[a-f0-9]{64}\.json$/.test(name)) throw new Error("Invalid preview file name.");
  await fs.unlink(path.join("public/data/listening-timings", name));
}
if (/^[a-f0-9]{64}$/.test(previousPackSha) && previousPackSha !== sha) {
  // The exact superseded generated asset is recoverable from Git; retain all reviewed files.
  await fs.rm(path.join("public/data/listening-timings", `owner-${previousPackSha}.bin`), { force: true });
}
console.log(
  `Packed ${records.length} owner-accepted annotation candidates into ${bytes.length} optional bytes. Exact transcript digests retained; display text is reused from the app.`,
);

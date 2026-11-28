/** Additive, bounded owner estimates. Existing reviewed/preview data stays intact. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { Buffer } from "node:buffer";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

export function alignmentJobSha256(value) {
  const canonical = (item) =>
    Array.isArray(item)
      ? `[${item.map(canonical).join(", ")}]`
      : item && typeof item === "object"
        ? `{${Object.keys(item)
            .sort()
            .map((key) => `${JSON.stringify(key)}: ${canonical(item[key])}`)
            .join(", ")}}`
        : JSON.stringify(item);
  return crypto.createHash("sha256").update(canonical(value)).digest("hex");
}

export function packEstimatedRecord(job, draft, candidate) {
  const input = job.candidates.find((value) => value.textSha256 === candidate.textSha256);
  if (
    !input ||
    input.text !== candidate.transcript ||
    draft.jobSha256 !== alignmentJobSha256(job) ||
    draft.status !== "draft" ||
    draft.pipelineVersion !== 4 ||
    draft.durationNeedsReview ||
    draft.sha256 !== job.sha256 ||
    draft.durationMs !== job.durationMs ||
    draft.language !== job.language ||
    draft.decodedDurationMs == null ||
    Math.abs(draft.decodedDurationMs - job.durationMs) > 250
  )
    throw new Error("Stale, failed or mismatched exact-recording draft");
  if (crypto.createHash("sha256").update(input.text).digest("hex") !== input.textSha256)
    throw new Error("Transcript digest differs");
  const expected = Array.from({ length: job.embeddedRepetitions }, (_, occurrence) =>
    input.tokens.map((token) => ({ ...token, occurrence })),
  ).flat();
  const spoken = [],
    unresolved = [];
  let end = 0;
  for (const token of expected) {
    const matching = candidate.words.filter(
      (word) => word.occurrence === token.occurrence && word.startOffset === token.startOffset,
    );
    const word = matching[0];
    if (
      matching.length === 1 &&
      word.text === token.text &&
      word.endOffset === token.endOffset &&
      word.position === token.position &&
      word.verseKey === token.verseKey &&
      Number.isInteger(word.startMs) &&
      Number.isInteger(word.endMs) &&
      word.startMs >= end &&
      word.endMs > word.startMs &&
      word.endMs <= job.durationMs &&
      word.acousticScore >= 0.65 &&
      word.flags?.length === 0
    ) {
      spoken.push({ ...token, startMs: word.startMs, endMs: word.endMs });
      end = word.endMs;
    } else unresolved.push([token.startOffset, token.endOffset, token.occurrence]);
  }
  if (!spoken.length) return null;
  const record = {
    v: [...new Set(job.variants.map((variant) => variant.variantId))],
    s: job.sha256,
    d: job.durationMs,
    l: job.language,
  };
  if (expected.every((word) => word.verseKey && word.position)) {
    const verses = [];
    for (const word of spoken) {
      let verse = verses.at(-1);
      if (verse?.[0] !== word.verseKey) {
        verse = [word.verseKey, word.startMs, word.endMs, []];
        verses.push(verse);
      }
      verse[2] = word.endMs;
      verse[3].push([word.position, word.startMs, word.endMs]);
    }
    let verseEnd = 0;
    record.q = verses.map(([key, start, end, words]) => {
      let wordEnd = start;
      const value = [
        key,
        start - verseEnd,
        end - start,
        words.map(([position, start, end]) => {
          const value = [position, start - wordEnd, end - start];
          wordEnd = end;
          return value;
        }),
      ];
      verseEnd = end;
      return value;
    });
  } else {
    record.h = input.textSha256;
    record.u = unresolved;
    let previousEnd = 0;
    record.w = spoken.map((word) => {
      const value = [
        word.startOffset,
        word.endOffset,
        word.occurrence,
        word.startMs - previousEnd,
        word.endMs - word.startMs,
      ];
      previousEnd = word.endMs;
      return value;
    });
  }
  return { record, aligned: spoken.length, unresolved: unresolved.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [jobsFile, draftsDirectory, acceptedBy, acceptedAt] = process.argv.slice(2);
  if (!acceptedBy || !/^\d{4}-\d{2}-\d{2}$/.test(acceptedAt ?? ""))
    throw new Error("Supply jobs, drafts, owner and acceptance date");
  const { jobs } = JSON.parse(fs.readFileSync(jobsFile, "utf8"));
  const indexFile = "src/app/audio/ownerTimingPartitions.json";
  const partitions = JSON.parse(fs.readFileSync(indexFile, "utf8"));
  const { OWNER_TIMING_PACK_SHA } = loadTypeScriptModule("src/app/audio/ownerTimingPreviews.ts");
  const old = JSON.parse(
    gunzipSync(fs.readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`)),
  );
  const existing = new Set([
    ...old.records.map((record) => record.s),
    ...partitions.flatMap((part) => part.recordings),
  ]);
  const records = [],
    report = [];
  for (const job of jobs) {
    if (existing.has(job.sha256)) continue;
    const file = path.join(draftsDirectory, job.sha256 + ".json");
    if (!fs.existsSync(file)) {
      report.push({ sha256: job.sha256, status: "not-generated" });
      continue;
    }
    const draft = JSON.parse(fs.readFileSync(file, "utf8"));
    if (draft.status !== "draft") {
      report.push({ sha256: job.sha256, status: draft.status });
      continue;
    }
    for (const candidate of draft.candidates) {
      const value = packEstimatedRecord(job, draft, candidate);
      if (value) {
        records.push(value.record);
        report.push({
          sha256: job.sha256,
          textSha256: candidate.textSha256,
          aligned: value.aligned,
          unresolved: value.unresolved,
          jobSha256: draft.jobSha256,
          model: draft.model,
        });
      }
    }
  }
  const approval = {
    reviewStatus: "owner-preview",
    source: "Exact-recording offline CTC estimates; uncertain/flagged words omitted; full listening review pending",
    authoredBy: "Offline alignment authoring",
    reviewedBy: "",
    reviewedAt: "",
    acceptedBy,
    acceptedAt,
  };
  // A recording's transcript alternatives remain together in one partition.
  const groups = [];
  for (const record of records) {
    let group = groups.at(-1);
    if (!group || (group.length >= 100 && group.at(-1).s !== record.s)) {
      group = [];
      groups.push(group);
    }
    group.push(record);
  }
  for (const group of groups) {
    const text = JSON.stringify({ version: 2, approval, records: group });
    const bytes = gzipSync(text, { level: 9 });
    if (group.length > 400 || Buffer.byteLength(text) > 2_000_000 || bytes.length > 250_000)
      throw new Error("Partition exceeds existing limits");
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    fs.mkdirSync("docs/audio/timing-assets", { recursive: true });
    fs.writeFileSync(`docs/audio/timing-assets/${sha256}.bin`, bytes);
    partitions.push({ sha256, recordings: [...new Set(group.map((record) => record.s))] });
  }
  if (partitions.length > 16) throw new Error("Too many timing partitions");
  fs.writeFileSync(indexFile, JSON.stringify(partitions, null, 2) + "\n");
  fs.writeFileSync(
    path.join(draftsDirectory, "registration.json"),
    JSON.stringify({ acceptedBy, acceptedAt, records: records.length, report }, null, 2) + "\n",
  );
  console.log(`Added ${records.length} estimates in ${groups.length} bounded partitions; existing packs retained.`);
}

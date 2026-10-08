/** Explicit owner batch acceptance; does not manufacture independent listening review. */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import prettier from "prettier";
import { Buffer } from "node:buffer";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const [jobsFile, draftsDirectory, acceptedBy, acceptedAt] = process.argv.slice(2);
if (!acceptedBy || !/^\d{4}-\d{2}-\d{2}$/.test(acceptedAt ?? ""))
  throw new Error("Supply jobs, draft directory, owner name and acceptance date.");
const { REVIEWED_TIMING_FILES, reviewedTimingFilename } = loadTypeScriptModule("src/app/audio/reviewedTimingFiles.ts");
const { jobs } = JSON.parse(await fs.readFile(jobsFile, "utf8"));
const entries = [...REVIEWED_TIMING_FILES.filter((file) => !file.ownerPreview)];
for (const file of REVIEWED_TIMING_FILES.filter((file) => file.ownerPreview)) {
  const filename = reviewedTimingFilename(file);
  if (!/^(listening|quran)-[a-f0-9]{64}-[a-f0-9]{64}\.json$/.test(filename))
    throw new Error("Invalid generated file identity.");
  await fs.unlink(path.join("public/data/listening-timings", filename));
}
const report = [];
await fs.mkdir("public/data/listening-timings", { recursive: true });
for (const job of jobs) {
  const draft = JSON.parse(await fs.readFile(path.join(draftsDirectory, job.sha256 + ".json"), "utf8"));
  if (
    draft.status !== "draft" ||
    draft.pipelineVersion !== 3 ||
    draft.sha256 !== job.sha256 ||
    draft.durationMs !== job.durationMs ||
    draft.language !== job.language
  )
    throw new Error("Stale or invalid draft identity.");
  for (const candidate of draft.candidates) {
    const input = job.candidates.find((value) => value.textSha256 === candidate.textSha256);
    if (
      !input ||
      candidate.transcript !== input.text ||
      crypto.createHash("sha256").update(candidate.transcript).digest("hex") !== candidate.textSha256
    )
      throw new Error("Transcript identity differs.");
    const expected = Array.from({ length: job.embeddedRepetitions }, (_, occurrence) =>
      input.tokens.map((token) => ({ ...token, occurrence })),
    ).flat();
    const mapped = new Map(candidate.words.map((word) => [`${word.occurrence}:${word.startOffset}`, word]));
    const spoken = [],
      unresolved = [];
    let end = 0;
    for (const token of expected) {
      const word = mapped.get(`${token.occurrence}:${token.startOffset}`);
      if (
        word &&
        word.endOffset === token.endOffset &&
        Number.isInteger(word.startMs) &&
        Number.isInteger(word.endMs) &&
        word.startMs >= end &&
        word.endMs > word.startMs &&
        word.endMs <= job.durationMs
      ) {
        spoken.push({ ...token, startMs: word.startMs, endMs: word.endMs });
        end = word.endMs;
      } else
        unresolved.push({ startOffset: token.startOffset, endOffset: token.endOffset, occurrence: token.occurrence });
    }
    if (!spoken.length) {
      report.push({ sha256: job.sha256, status: "no-usable-boundaries" });
      continue;
    }
    const metadata = {
      sha256: job.sha256,
      durationMs: job.durationMs,
      unit: "milliseconds",
      source: `${draft.model.id}@${draft.model.revision}; owner accepted generated estimates for app testing; full listening review pending`,
      authoredBy: "Offline alignment authoring",
      reviewStatus: "owner-preview",
      reviewedBy: "",
      reviewedAt: "",
      acceptedBy,
      acceptedAt,
    };
    const quran = expected.every((word) => word.verseKey && word.position);
    const annotations = quran
      ? job.variants.map((variant) => {
          const verses = [];
          for (const word of spoken) {
            let verse = verses.at(-1);
            if (verse?.verseKey !== word.verseKey) {
              verse = { verseKey: word.verseKey, startMs: word.startMs, endMs: word.endMs, words: [] };
              verses.push(verse);
            }
            verse.endMs = word.endMs;
            verse.words.push({ position: word.position, startMs: word.startMs, endMs: word.endMs });
          }
          return { ...metadata, variantId: variant.variantId, verses };
        })
      : [
          {
            ...metadata,
            variantIds: [...new Set(job.variants.map((variant) => variant.variantId))],
            language: job.language,
            transcript: candidate.transcript,
            textSha256: candidate.textSha256,
            unresolvedWords: unresolved,
            words: spoken.map(({ startOffset, endOffset, occurrence, startMs, endMs }) => ({
              startOffset,
              endOffset,
              occurrence,
              startMs,
              endMs,
            })),
          },
        ];
    for (const annotation of annotations) {
      const ids = quran ? [annotation.variantId] : annotation.variantIds;
      if (
        entries.some(
          (file) =>
            file.sha256 === job.sha256 &&
            file.variantIds.some((id) => ids.includes(id)) &&
            (quran ? file.kind === "quran" : file.textSha256 === candidate.textSha256),
        )
      )
        continue;
      const bytes = await prettier.format(JSON.stringify(annotation), {
        ...(await prettier.resolveConfig("public/release-notes.json")),
        parser: "json",
      });
      if (Buffer.byteLength(bytes) > 750000) throw new Error("Annotation exceeds bounded file size.");
      const entry = {
        kind: quran ? "quran" : "listening",
        variantIds: ids,
        sha256: job.sha256,
        annotationSha256: crypto.createHash("sha256").update(bytes).digest("hex"),
        language: job.language,
        ...(!quran ? { textSha256: candidate.textSha256 } : {}),
        ownerPreview: true,
      };
      await fs.writeFile(path.join("public/data/listening-timings", reviewedTimingFilename(entry)), bytes);
      entries.push(entry);
    }
    report.push({
      sha256: job.sha256,
      textSha256: candidate.textSha256,
      aligned: spoken.length,
      unresolved: unresolved.length,
      concerns: candidate.concerns,
      decodedDurationMs: draft.decodedDurationMs,
      durationMs: job.durationMs,
    });
  }
}
const indexFile = "src/app/audio/reviewedTimingFiles.ts";
const source = await fs.readFile(indexFile, "utf8");
await fs.writeFile(
  indexFile,
  await prettier.format(
    source.replace(
      /export const REVIEWED_TIMING_FILES:[\s\S]*?\n\];/,
      `export const REVIEWED_TIMING_FILES: readonly ReviewedTimingFile[] = ${JSON.stringify(entries)};`,
    ),
    { ...(await prettier.resolveConfig(indexFile)), parser: "typescript" },
  ),
);
await fs.mkdir("output", { recursive: true });
await fs.writeFile(
  "output/owner-preview-registration.json",
  JSON.stringify({ acceptedBy, acceptedAt, recordings: jobs.length, files: entries.length, report }, null, 2),
);
console.log(
  `Registered ${entries.length} timing files for ${jobs.length} recordings; independent review status preserved separately.`,
);

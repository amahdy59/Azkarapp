import fs from "node:fs/promises";
import path from "node:path";
const [jobsPath, draftsDirectory, outputPath] = process.argv.slice(2);
if (!outputPath)
  throw new Error("Usage: node scripts/report-listening-alignment.mjs jobs.json drafts-directory coverage.json");
const { jobs } = JSON.parse(await fs.readFile(jobsPath, "utf8"));
const rows = [];
for (const job of jobs) {
  const row = {
    sha256: job.sha256,
    language: job.language,
    variants: job.variants.map((v) => v.variantId),
    durationMs: job.durationMs,
    status: "missing",
    completeCandidates: 0,
    flaggedWords: 0,
  };
  try {
    const draft = JSON.parse(await fs.readFile(path.join(draftsDirectory, job.sha256 + ".json"), "utf8"));
    const current =
      draft.pipelineVersion === 3 &&
      draft.sha256 === job.sha256 &&
      draft.language === job.language &&
      draft.durationMs === job.durationMs &&
      JSON.stringify(draft.variants) === JSON.stringify(job.variants) &&
      JSON.stringify(draft.inputDigests) === JSON.stringify(job.candidates.map((c) => c.textSha256));
    if (!current) row.status = "stale";
    else if (draft.status === "failed") {
      row.status = "failed";
      row.error = draft.error;
    } else {
      row.completeCandidates = draft.candidates.filter(
        (candidate) =>
          candidate.alignedOccurrences === candidate.expectedOccurrences &&
          !candidate.concerns.length &&
          !draft.durationNeedsReview,
      ).length;
      row.flaggedWords = draft.candidates.reduce((sum, candidate) => sum + candidate.flaggedOccurrences, 0);
      row.status = row.completeCandidates ? "draft-complete" : "draft-partial";
      row.durationNeedsReview = Boolean(draft.durationNeedsReview);
      row.concerns = draft.candidates.map((candidate) => ({
        textSha256: candidate.textSha256,
        aligned: candidate.alignedOccurrences,
        expected: candidate.expectedOccurrences,
        concerns: candidate.concerns,
      }));
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      row.status = "failed";
      row.error = String(error);
    }
  }
  rows.push(row);
}
const counts = Object.fromEntries(
  ["missing", "stale", "failed", "draft-complete", "draft-partial"].map((status) => [
    status,
    rows.filter((row) => row.status === status).length,
  ]),
);
const report = {
  generatedAt: new Date().toISOString(),
  recordings: jobs.length,
  approvedVariants: jobs.reduce((sum, job) => sum + job.variants.length, 0),
  uniqueDurationHours: jobs.reduce((sum, job) => sum + job.durationMs, 0) / 3600000,
  counts,
  independentlyReviewedRecordings: 0,
  note: "All model output is unreviewed. Complete means structural candidate coverage, not verified accuracy or approval.",
  rows,
};
await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify({
    recordings: report.recordings,
    approvedVariants: report.approvedVariants,
    counts,
    independentlyReviewedRecordings: 0,
  }),
);

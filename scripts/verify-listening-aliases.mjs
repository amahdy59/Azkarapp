import fs from "node:fs/promises";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";
const { fetch, AbortSignal } = globalThis;
const [jobsPath, reportPath] = process.argv.slice(2);
if (!jobsPath || !reportPath) throw new Error("Usage: node scripts/verify-listening-aliases.mjs jobs.json report.json");
const { jobs } = JSON.parse(await fs.readFile(jobsPath, "utf8"));
const results = [];
for (const job of jobs) {
  for (const relativePath of new Set(
    job.variants.map((variant) => variant.relativePath).filter((value) => value && value !== job.relativePath),
  )) {
    try {
      const response = await fetch(new URL(relativePath, "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/"), {
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== job.byteSize || crypto.createHash("sha256").update(bytes).digest("hex") !== job.sha256)
        throw new Error("Hosted alias differs from approved recording bytes");
      results.push({ sha256: job.sha256, relativePath, status: "verified", byteSize: bytes.length });
    } catch (error) {
      results.push({ sha256: job.sha256, relativePath, status: "failed", error: String(error) });
    }
  }
}
await fs.writeFile(reportPath, JSON.stringify(results, null, 2) + "\n");
console.log(
  `Verified ${results.filter((item) => item.status === "verified").length}/${results.length} additional hosted recording aliases.`,
);
if (results.some((item) => item.status !== "verified")) process.exitCode = 1;

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";
const { fetch, AbortSignal } = globalThis;

const [jobsPath, cachePath] = process.argv.slice(2);
if (!jobsPath || !cachePath)
  throw new Error("Usage: node scripts/cache-listening-recordings.mjs jobs.json cache-directory");
const { jobs } = JSON.parse(await fs.readFile(jobsPath, "utf8"));
const directory = path.resolve(cachePath, "audio");
await fs.mkdir(directory, { recursive: true });
const results = [];
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    const target = path.join(directory, job.sha256 + path.extname(job.relativePath));
    try {
      let bytes;
      try {
        bytes = await fs.readFile(target);
      } catch {
        /* First download. */
      }
      if (!bytes) {
        const response = await fetch(
          new URL(job.relativePath, "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/"),
          { signal: AbortSignal.timeout(900000) },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        bytes = Buffer.from(await response.arrayBuffer());
      }
      if (bytes.length !== job.byteSize || crypto.createHash("sha256").update(bytes).digest("hex") !== job.sha256)
        throw new Error("Approved checksum or byte size differs");
      await fs.writeFile(target, bytes);
      results.push({ sha256: job.sha256, status: "verified", byteSize: bytes.length });
      console.log(`${results.length}/${jobs.length} verified ${job.variants[0].variantId}`);
    } catch (error) {
      results.push({ sha256: job.sha256, status: "failed", error: String(error) });
      console.error(`Failed ${job.variants[0].variantId}: ${error}`);
    }
  }
}
await Promise.all([worker(), worker(), worker()]);
await fs.writeFile(path.resolve(cachePath, "recording-verification.json"), JSON.stringify(results, null, 2) + "\n");
if (results.some((result) => result.status === "failed")) process.exitCode = 1;

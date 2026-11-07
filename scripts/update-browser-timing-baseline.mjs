import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeBrowserTimings } from "./report-browser-timings.mjs";
import { BROWSER_PARTITIONS } from "./browser-partitions.mjs";

/** Scheduling data only. Never use timings to remove tests or accept a release. */
export function buildBrowserTimingBaseline(reports, { commit, run }) {
  if (!/^[a-f0-9]{40}$/.test(commit) || !Number.isSafeInteger(run) || run <= 0)
    throw new Error("Supply the successful exact commit and numeric Quality run id.");
  if (reports.length !== BROWSER_PARTITIONS.length) throw new Error("Supply every required browser shard report.");
  const files = new Map();
  const projects = new Set();
  let tests = 0;
  for (const report of reports) {
    const summary = summarizeBrowserTimings(report);
    if (
      summary.unexpected ||
      summary.errors.length ||
      !summary.tests.length ||
      report.stats.expected + report.stats.flaky + report.stats.skipped !== summary.tests.length
    )
      throw new Error("Cannot refresh timings from failed, incomplete or empty reports.");
    const shard = new Map();
    for (const test of summary.tests) {
      if (
        !["expected", "flaky", "skipped"].includes(test.status) ||
        (test.status !== "skipped" && !test.attempts) ||
        !test.project ||
        !Number.isFinite(test.durationMs) ||
        test.durationMs < 0
      )
        throw new Error("Invalid browser timing result.");
      const file = test.file.split(/[\\/]/).at(-1);
      const key = `${test.project}:${file}`;
      if (files.has(key)) throw new Error(`Duplicate browser project/file across shards: ${key}.`);
      const entry = shard.get(key) ?? { project: test.project, file, tests: 0, durationMs: 0 };
      entry.tests++;
      entry.durationMs += test.durationMs;
      shard.set(key, entry);
      projects.add(test.project);
      tests++;
    }
    for (const [key, entry] of shard) files.set(key, entry);
  }
  const required = new Set(BROWSER_PARTITIONS.flatMap((partition) => partition.projects.split(",")));
  if (projects.size !== required.size || [...required].some((project) => !projects.has(project)))
    throw new Error("Timing reports do not cover every required browser project.");
  return {
    commit,
    run,
    tests,
    files: [...files.values()].sort((a, b) => a.project.localeCompare(b.project) || a.file.localeCompare(b.file)),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [commit, run, ...filenames] = process.argv.slice(2);
    const reports = await Promise.all(filenames.map(async (filename) => JSON.parse(await readFile(filename, "utf8"))));
    const baseline = buildBrowserTimingBaseline(reports, { commit, run: Number(run) });
    await writeFile("scripts/browser-timing-baseline.json", JSON.stringify(baseline, null, 2) + "\n");
    console.log(`Refreshed scheduling timings for ${baseline.tests} tests from Quality ${baseline.run}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BROWSER_PARTITIONS } from "./browser-partitions.mjs";
import { scheduleBrowserTests } from "./schedule-browser-tests.mjs";

export function browserInventory(report) {
  if (!Array.isArray(report.suites)) throw new Error("Expected Playwright inventory JSON.");
  const ids = [];
  function visit(suites) {
    for (const suite of suites) {
      for (const spec of suite.specs ?? []) {
        if (!spec.id) throw new Error("Missing test identity.");
        for (const test of spec.tests ?? []) ids.push(`${test.projectName}:${spec.id}`);
      }
      visit(suite.suites ?? []);
    }
  }
  visit(report.suites);
  return ids;
}

/** Prove sharding changes scheduling, never the set of release assertions. */
export function verifyBrowserShards(full, shards) {
  const expected = browserInventory(full);
  const actual = shards.flatMap(browserInventory);
  if (expected.length === 0 || shards.length === 0) throw new Error("An empty inventory cannot prove coverage.");
  if (new Set(expected).size !== expected.length || new Set(actual).size !== actual.length) {
    throw new Error("Duplicate test identities in the full or sharded inventory.");
  }
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((id) => !actualSet.has(id));
  const extra = actual.filter((id) => !expectedSet.has(id));
  if (missing.length || extra.length)
    throw new Error(`Shard coverage mismatch: ${missing.length} missing, ${extra.length} extra.`);
  return { tests: expected.length, shardCounts: shards.map((report) => browserInventory(report).length) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let [fullPath, ...shardPaths] = process.argv.slice(2);
    if (fullPath === "--collect") {
      const require = createRequire(import.meta.url);
      const cli = path.join(path.dirname(require.resolve("@playwright/test/package.json")), "cli.js");
      const directory = "output/browser-inventory";
      await mkdir(directory, { recursive: true });
      const filenames = [];
      await mkdir("output/browser-schedule", { recursive: true });
      let schedule;
      for (let shard = 0; shard <= BROWSER_PARTITIONS.length; shard += 1) {
        const filename = path.resolve(directory, `${shard}.json`);
        const partition = BROWSER_PARTITIONS[shard - 1];
        const selection = partition
          ? [
              `--test-list=output/browser-schedule/${partition.name}.txt`,
              ...partition.projects.split(",").map((project) => `--project=${project}`),
            ]
          : [];
        const args = [cli, "test", "--list", "--reporter=json", ...selection];
        const result = spawnSync(process.execPath, args, {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
          env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: filename },
        });
        if (result.error || result.status !== 0) {
          throw new Error(`Inventory collection failed for shard ${shard}: ${result.error?.message ?? result.stderr}`);
        }
        filenames.push(filename);
        if (shard === 0) {
          const baseline = JSON.parse(await readFile("scripts/browser-timing-baseline.json", "utf8"));
          schedule = scheduleBrowserTests(JSON.parse(await readFile(filename, "utf8")), baseline);
          for (const entry of schedule) {
            await writeFile(`output/browser-schedule/${entry.name}.txt`, entry.files.join("\n") + "\n");
          }
          await writeFile("output/browser-schedule/summary.json", JSON.stringify(schedule, null, 2) + "\n");
        }
      }
      [fullPath, ...shardPaths] = filenames;
    }
    if (!fullPath || shardPaths.length === 0)
      throw new Error("Supply a full inventory followed by every shard inventory.");
    const reports = await Promise.all(
      [fullPath, ...shardPaths].map(async (filename) => JSON.parse(await readFile(filename, "utf8"))),
    );
    console.log(JSON.stringify(verifyBrowserShards(reports[0], reports.slice(1))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

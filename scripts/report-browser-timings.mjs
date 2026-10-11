import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Include every attempt: retries consume time even when the final attempt passes. */
export function summarizeBrowserTimings(report) {
  if (
    !Array.isArray(report.suites) ||
    !report.stats ||
    !["duration", "unexpected", "flaky", "skipped"].every(
      (name) => Number.isFinite(report.stats[name]) && report.stats[name] >= 0,
    )
  ) {
    throw new Error("Expected a Playwright JSON report with suites and stats.");
  }
  const tests = [];
  function visit(suites, parents = []) {
    for (const suite of suites) {
      const titles = [...parents, suite.title].filter(Boolean);
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          const results = test.results ?? [];
          tests.push({
            title: [...titles, spec.title].join(" > "),
            file: spec.file ?? suite.file ?? titles[0] ?? "unknown",
            project: test.projectName,
            status: test.status,
            durationMs: results.reduce((total, result) => total + (result.duration ?? 0), 0),
            attempts: results.length,
          });
        }
      }
      visit(suite.suites ?? [], titles);
    }
  }
  visit(report.suites);
  tests.sort((a, b) => b.durationMs - a.durationMs || a.title.localeCompare(b.title));
  function groupBy(key) {
    const groups = new Map();
    for (const test of tests) {
      const name = test[key];
      const group = groups.get(name) ?? { name, tests: 0, durationMs: 0, attempts: 0, retriedTests: 0 };
      group.tests += 1;
      group.durationMs += test.durationMs;
      group.attempts += test.attempts;
      if (test.attempts > 1) group.retriedTests += 1;
      groups.set(name, group);
    }
    return [...groups.values()].sort((a, b) => b.durationMs - a.durationMs || a.name.localeCompare(b.name));
  }
  return {
    wallTimeMs: report.stats.duration,
    tests,
    projects: groupBy("project"),
    files: groupBy("file"),
    retried: tests.filter((test) => test.attempts > 1),
    unexpected: report.stats.unexpected,
    flaky: report.stats.flaky,
    skipped: report.stats.skipped,
    errors: report.errors ?? [],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const filename = process.argv[2] ?? "output/e2e-results.json";
    const summary = summarizeBrowserTimings(JSON.parse(await readFile(filename, "utf8")));
    console.log(
      `Browser wall time: ${(summary.wallTimeMs / 1000).toFixed(1)}s; ${summary.unexpected} failed, ${summary.flaky} flaky, ${summary.skipped} skipped, ${summary.errors.length} run errors.`,
    );
    console.log("Slowest tests (total time across attempts):");
    for (const test of summary.tests.slice(0, 10)) {
      console.log(
        `${(test.durationMs / 1000).toFixed(1)}s  [${test.project}] ${test.title} (${test.status}, ${test.attempts} attempts)`,
      );
    }
    console.log("Browser totals (test time, not elapsed wall time):");
    for (const group of summary.projects) {
      console.log(
        `${(group.durationMs / 1000).toFixed(1)}s  ${group.name}: ${group.tests} tests, ${group.attempts} attempts`,
      );
    }
    console.log("Most expensive files:");
    for (const group of summary.files.slice(0, 10)) {
      console.log(`${(group.durationMs / 1000).toFixed(1)}s  ${group.name}: ${group.tests} tests`);
    }
    if (summary.retried.length > 0) {
      console.log("Retried tests:");
      for (const test of summary.retried) console.log(`[${test.project}] ${test.title}`);
    }
    for (const error of summary.errors) console.error(error.message ?? "Browser runner error");
    process.exitCode = summary.unexpected > 0 || summary.errors.length > 0 ? 1 : 0;
  } catch (error) {
    console.error(`Cannot read browser timings: ${error.message}. Run browser tests first or supply a report path.`);
    process.exitCode = 1;
  }
}

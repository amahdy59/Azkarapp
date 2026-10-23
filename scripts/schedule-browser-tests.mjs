import { BROWSER_PARTITIONS } from "./browser-partitions.mjs";

/** Keep each project/file intact, including serial suites and shared hooks. */
export function scheduleBrowserTests(report, baseline, partitions = BROWSER_PARTITIONS) {
  const groups = new Map();
  function visit(suites) {
    for (const suite of suites) {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          const file = spec.file ?? suite.file;
          if (!file || !test.projectName) throw new Error("Missing browser scheduling identity.");
          const key = `${test.projectName}:${file}`;
          const group = groups.get(key) ?? { project: test.projectName, file, tests: 0 };
          group.tests += 1;
          groups.set(key, group);
        }
      }
      visit(suite.suites ?? []);
    }
  }
  if (!Array.isArray(report.suites)) throw new Error("Expected Playwright inventory JSON.");
  visit(report.suites);
  if (!groups.size) throw new Error("Cannot schedule an empty browser inventory.");
  const timings = new Map(baseline.files.map((entry) => [`${entry.project}:${entry.file}`, entry]));
  const schedule = partitions.map((partition) => ({ ...partition, files: [], tests: 0, durationMs: 0 }));
  const weighted = [...groups.values()].map((group) => {
    const recorded = timings.get(`${group.project}:${group.file}`);
    const peers = baseline.files.filter((entry) => entry.project === group.project);
    const perTest = recorded
      ? recorded.durationMs / recorded.tests
      : peers.reduce((sum, entry) => sum + entry.durationMs, 0) / peers.reduce((sum, entry) => sum + entry.tests, 0);
    return { ...group, durationMs: group.tests * (Number.isFinite(perTest) && perTest > 0 ? perTest : 5_000) };
  });
  weighted.sort(
    (a, b) => b.durationMs - a.durationMs || `${a.project}:${a.file}`.localeCompare(`${b.project}:${b.file}`),
  );
  for (const group of weighted) {
    const candidates = schedule.filter((partition) => partition.projects.split(",").includes(group.project));
    if (!candidates.length) throw new Error(`No browser partition for ${group.project}.`);
    candidates.sort((a, b) => a.durationMs - b.durationMs || a.name.localeCompare(b.name));
    const target = candidates[0];
    target.files.push(`[${group.project}] › ${group.file}`);
    target.tests += group.tests;
    target.durationMs += group.durationMs;
  }
  if (schedule.some((partition) => !partition.tests)) throw new Error("A browser partition has no tests.");
  return schedule.map((partition) => ({ ...partition, files: partition.files.sort() }));
}

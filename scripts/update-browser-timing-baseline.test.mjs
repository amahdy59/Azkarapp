import { expect, test } from "vitest";
import { buildBrowserTimingBaseline } from "./update-browser-timing-baseline.mjs";
import { BROWSER_PARTITIONS } from "./browser-partitions.mjs";

const identity = { commit: "a".repeat(40), run: 123 };
function reports() {
  return BROWSER_PARTITIONS.map((partition, index) => {
    const projects = partition.projects.split(",");
    return {
      stats: { duration: 2000, expected: projects.length, unexpected: 0, flaky: 0, skipped: 0 },
      suites: [
        {
          title: `file-${index}.spec.ts`,
          file: `file-${index}.spec.ts`,
          specs: [
            {
              title: "works",
              tests: projects.map((projectName) => ({
                projectName,
                status: "expected",
                results: [{ duration: 1000 }],
              })),
            },
          ],
        },
      ],
    };
  });
}

test("rebalances with complete CI measurements, retaining retry cost and deterministic ordering", () => {
  const source = reports();
  source[0].suites[0].specs[0].tests[0].results.push({ duration: 500 });
  const baseline = buildBrowserTimingBaseline(source, identity);
  expect(baseline.tests).toBe(10);
  expect(baseline.files.find((entry) => entry.file === "file-0.spec.ts").durationMs).toBe(1500);
  expect(buildBrowserTimingBaseline([...source].reverse(), identity)).toEqual(baseline);
});

test("rejects incomplete, failed, empty, duplicate or missing-project data", () => {
  expect(() => buildBrowserTimingBaseline(reports().slice(1), identity)).toThrow("every required");
  const failed = reports();
  failed[0].stats.unexpected = 1;
  expect(() => buildBrowserTimingBaseline(failed, identity)).toThrow("failed");
  const empty = reports();
  empty[0].suites = [];
  expect(() => buildBrowserTimingBaseline(empty, identity)).toThrow("empty");
  const duplicate = reports();
  duplicate[1] = duplicate[0];
  expect(() => buildBrowserTimingBaseline(duplicate, identity)).toThrow("Duplicate");
  const missing = reports();
  missing.at(-1).suites[0].specs[0].tests[0].projectName = "unknown";
  expect(() => buildBrowserTimingBaseline(missing, identity)).toThrow("every required browser project");
  const notExecuted = reports();
  notExecuted[0].suites[0].specs[0].tests[0].results = [];
  expect(() => buildBrowserTimingBaseline(notExecuted, identity)).toThrow("Invalid");
  expect(() => buildBrowserTimingBaseline(reports(), { commit: "main", run: 123 })).toThrow("exact commit");
});

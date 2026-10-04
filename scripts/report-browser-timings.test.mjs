import { expect, test } from "vitest";
import { summarizeBrowserTimings } from "./report-browser-timings.mjs";

test("ranks nested tests across projects and counts failed retry attempts", () => {
  const report = {
    stats: { duration: 9000, unexpected: 1, flaky: 1, skipped: 1 },
    suites: [
      {
        title: "reader.spec.ts",
        suites: [
          {
            title: "offline",
            specs: [
              {
                title: "persists progress",
                tests: [
                  {
                    projectName: "chromium",
                    status: "flaky",
                    results: [{ duration: 4000 }, { duration: 2000 }],
                  },
                  { projectName: "webkit", status: "unexpected", results: [{ duration: 5000 }] },
                ],
              },
              { title: "optional", tests: [{ projectName: "chromium", status: "skipped", results: [] }] },
            ],
          },
        ],
      },
    ],
  };
  const summary = summarizeBrowserTimings(report);
  expect(summary.wallTimeMs).toBe(9000);
  expect(summary.tests.map(({ durationMs }) => durationMs)).toEqual([6000, 5000, 0]);
  expect(summary.retried).toEqual([
    {
      title: "reader.spec.ts > offline > persists progress",
      project: "chromium",
      status: "flaky",
      durationMs: 6000,
      attempts: 2,
    },
  ]);
  expect(summary).toMatchObject({ unexpected: 1, flaky: 1, skipped: 1 });
});

test("handles an empty run and rejects unrelated JSON instead of reporting success", () => {
  expect(
    summarizeBrowserTimings({ suites: [], stats: { duration: 0, unexpected: 0, flaky: 0, skipped: 0 } }).tests,
  ).toEqual([]);
  expect(() => summarizeBrowserTimings({})).toThrow("Expected a Playwright JSON report");
  expect(() => summarizeBrowserTimings({ suites: [], stats: {} })).toThrow("Expected a Playwright JSON report");
});

test("retains global runner errors when no individual test could start", () => {
  const errors = [{ message: "Preview server failed to start" }];
  const summary = summarizeBrowserTimings({
    suites: [],
    stats: { duration: 1000, unexpected: 0, flaky: 0, skipped: 0 },
    errors,
  });
  expect(summary.tests).toEqual([]);
  expect(summary.errors).toEqual(errors);
});

import { expect, test } from "vitest";
import { scheduleBrowserTests } from "./schedule-browser-tests.mjs";

const inventory = (files, projectName = "chromium") => ({
  suites: [
    {
      specs: files.flatMap(([file, tests]) =>
        Array.from({ length: tests }, () => ({ file, tests: [{ projectName }] })),
      ),
    },
  ],
});
const partitions = [
  { name: "one", projects: "chromium" },
  { name: "two", projects: "chromium" },
];
const baseline = {
  files: [
    { project: "chromium", file: "slow.spec.ts", tests: 2, durationMs: 100 },
    { project: "chromium", file: "medium.spec.ts", tests: 1, durationMs: 60 },
    { project: "chromium", file: "fast.spec.ts", tests: 1, durationMs: 40 },
  ],
};

test("balances recorded duration while keeping entire spec files together", () => {
  const report = inventory([
    ["slow.spec.ts", 2],
    ["medium.spec.ts", 1],
    ["fast.spec.ts", 1],
  ]);
  const result = scheduleBrowserTests(report, baseline, partitions);
  expect(result.map((entry) => entry.durationMs)).toEqual([100, 100]);
  expect(result.map((entry) => entry.tests)).toEqual([2, 2]);
  expect(result[0].files).toEqual(["[chromium] › slow.spec.ts"]);
  expect(
    scheduleBrowserTests(
      inventory([
        ["fast.spec.ts", 1],
        ["medium.spec.ts", 1],
        ["slow.spec.ts", 2],
      ]),
      baseline,
      partitions,
    ),
  ).toEqual(result);
});

test("includes new tests and files using recorded per-test costs", () => {
  const result = scheduleBrowserTests(
    inventory([
      ["slow.spec.ts", 3],
      ["new.spec.ts", 1],
    ]),
    baseline,
    partitions,
  );
  expect(result.map((entry) => entry.durationMs)).toEqual([150, 50]);
  expect(result.flatMap((entry) => entry.files)).toContain("[chromium] › new.spec.ts");
});

test("keeps projects isolated and rejects unsupported or empty inventories", () => {
  expect(() => scheduleBrowserTests(inventory([["a", 1]], "other"), baseline, partitions)).toThrow(
    "No browser partition",
  );
  expect(() => scheduleBrowserTests(inventory([]), baseline, partitions)).toThrow("empty browser inventory");
  expect(() => scheduleBrowserTests(inventory([["a", 1]]), baseline, partitions)).toThrow("no tests");
  expect(() => scheduleBrowserTests({}, baseline, partitions)).toThrow("inventory JSON");
  expect(() => scheduleBrowserTests(inventory([[null, 1]]), baseline, partitions)).toThrow(
    "Missing browser scheduling identity",
  );
  expect(scheduleBrowserTests(inventory([["a", 1]]), { files: [] }, partitions.slice(0, 1))[0].durationMs).toBe(5_000);
});

import { expect, test } from "vitest";
import { featureBrowserArguments } from "./run-feature-browser-tests.mjs";

test("selects persistence regressions and forwards engine or test filters without shell interpolation", () => {
  expect(featureBrowserArguments("persistence", ["--project=desktop-firefox-smoke", "--grep", "reload"])).toEqual([
    "test",
    "e2e/audio-integrity\\.spec\\.ts",
    "e2e/reading-reliability\\.spec\\.ts",
    "e2e/offline-core\\.spec\\.ts",
    "--project=desktop-firefox-smoke",
    "--grep",
    "reload",
  ]);
});
test("maps feature patterns to Playwright file regular expressions", () => {
  const filters = featureBrowserArguments("quran")
    .slice(1)
    .map((pattern) => new RegExp(pattern));
  expect(filters.some((pattern) => pattern.test("e2e/quran-translation.spec.ts"))).toBe(true);
  expect(filters.some((pattern) => pattern.test("e2e/mushaf-fallback.spec.ts"))).toBe(true);
  expect(filters.some((pattern) => pattern.test("e2e/settings-experience.spec.ts"))).toBe(false);
});
test("fails on missing, unknown or prototype names instead of silently selecting an empty suite", () => {
  for (const feature of [undefined, "unknown", "toString", "__proto__"]) {
    expect(() => featureBrowserArguments(feature)).toThrow("Choose a feature");
  }
});

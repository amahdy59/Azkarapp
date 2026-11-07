import { expect, test } from "vitest";
import { featureBrowserArguments } from "./run-feature-browser-tests.mjs";

test("shared configuration pills are covered by each owning screen feature", () => {
  for (const feature of ["quran", "progress", "controls", "settings"]) {
    const patterns = featureBrowserArguments(feature)
      .slice(1)
      .map((pattern) => new RegExp(pattern));
    expect(patterns.some((pattern) => pattern.test("e2e/button-family-consistency.spec.ts"))).toBe(true);
  }
});

test("includes final-touch download/chart/control coverage in each affected feature selection", () => {
  for (const feature of ["quran", "audio", "progress", "controls", "settings"]) {
    const filters = featureBrowserArguments(feature)
      .slice(1)
      .map((pattern) => new RegExp(pattern));
    expect(filters.some((pattern) => pattern.test("e2e/final-touch-quality.spec.ts"))).toBe(true);
  }
});

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

test("focused sharing includes both image exports and offline ayah recovery", () => {
  const filters = featureBrowserArguments("sharing")
    .slice(1)
    .map((pattern) => new RegExp(pattern));
  for (const filename of ["ayah-image-sharing.spec.ts", "ayah-sharing-offline.spec.ts", "sharing-refinement.spec.ts"]) {
    expect(filters.some((pattern) => pattern.test(`e2e/${filename}`))).toBe(true);
  }
  expect(filters.some((pattern) => pattern.test("e2e/settings-experience.spec.ts"))).toBe(false);
});

test("focused Progress includes trends, responsive layouts, recordings and heading reflow", () => {
  const filters = featureBrowserArguments("progress")
    .slice(1)
    .map((pattern) => new RegExp(pattern));
  for (const filename of [
    "progress-trends.spec.ts",
    "progress-responsive.spec.ts",
    "shared-card-finish.spec.ts",
    "quiet-garden.spec.ts",
    "settings-progress-clarity.spec.ts",
    "manual-checklist.spec.ts",
  ])
    expect(filters.some((pattern) => pattern.test(`e2e/${filename}`))).toBe(true);
  expect(filters.some((pattern) => pattern.test("e2e/audio-integrity.spec.ts"))).toBe(false);
});

test("focused controls includes shared geometry and keyboard behavior without the entire reader suite", () => {
  const filters = featureBrowserArguments("controls")
    .slice(1)
    .map((pattern) => new RegExp(pattern));
  for (const filename of [
    "navigation-motion.spec.ts",
    "progress-compact-panels.spec.ts",
    "responsive.spec.ts",
    "shared-card-finish.spec.ts",
    "narrow-layout.spec.ts",
    "overlay-geometry.spec.ts",
    "settings-experience.spec.ts",
  ])
    expect(filters.some((pattern) => pattern.test(`e2e/${filename}`))).toBe(true);
  expect(filters.some((pattern) => pattern.test("e2e/reader-microinteractions.spec.ts"))).toBe(false);
});

test("audio and Quran focus groups both retain continuous listening and paired meaning regressions", () => {
  for (const feature of ["audio", "quran"]) {
    const filters = featureBrowserArguments(feature)
      .slice(1)
      .map((pattern) => new RegExp(pattern));
    for (const filename of ["audio-surah-stream.spec.ts", "quran-listening.spec.ts", "quran-translation.spec.ts"])
      expect(filters.some((pattern) => pattern.test(`e2e/${filename}`))).toBe(true);
  }
});

test("Home and reminders focus groups include the current behavior and controls retain new shared recipes", () => {
  for (const [feature, filenames] of Object.entries({
    home: [
      "home-prayer-motion.spec.ts",
      "home-time-actions.spec.ts",
      "motion-control-polish.spec.ts",
      "compact-icon-feedback.spec.ts",
      "todays-path.spec.ts",
      "reminder-responsive.spec.ts",
    ],
    reminders: [
      "first-use-calm-controls.spec.ts",
      "reminder-responsive.spec.ts",
      "contextual-reminder-plan.spec.ts",
      "pwa-update-flow.spec.ts",
    ],
    controls: ["first-use-calm-controls.spec.ts", "compact-icon-feedback.spec.ts"],
  })) {
    const patterns = featureBrowserArguments(feature)
      .slice(1)
      .map((pattern) => new RegExp(pattern));
    for (const filename of filenames) expect(patterns.some((pattern) => pattern.test(`e2e/${filename}`))).toBe(true);
    expect(patterns.some((pattern) => pattern.test("e2e/audio-integrity.spec.ts"))).toBe(false);
  }
});

test("reminder selection includes readiness and data-safety recovery", () => {
  const filters = featureBrowserArguments("reminders")
    .slice(1)
    .map((pattern) => new RegExp(pattern));
  expect(filters.some((pattern) => pattern.test("e2e/settings-readiness-surfaces.spec.ts"))).toBe(true);
});

test("Settings hover and existing focus contracts stay together in owning feature selections", () => {
  for (const feature of ["controls", "settings"]) {
    const patterns = featureBrowserArguments(feature)
      .slice(1)
      .map((pattern) => new RegExp(pattern));
    for (const spec of ["settings-row-hover.spec.ts", "focus-highlight-surfaces.spec.ts"])
      expect(patterns.some((pattern) => pattern.test(`e2e/${spec}`))).toBe(true);
  }
});

import { defineConfig } from "vitest/config";

import { ISOLATED_SUITES } from "./src/test/isolatedSuites";

const ALL_SUITES = ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"];

/**
 * Suite speed (this machine, 16 cores): 3 m 34 s on the stock `forks` pool with
 * per-file isolation, 1 m 49 s on worker threads, 33 s once the threads share a
 * module registry. Nearly all of it was environment and import cost paid once
 * per file — 918 s of accumulated worker time against 306 s of actual tests.
 */
const shared = {
  testTimeout: 15000,
  environment: "jsdom" as const,
  pool: "threads" as const,
  setupFiles: ["./src/test/setup.ts"],
};

export default defineConfig({
  test: {
    projects: [
      {
        test: { ...shared, name: "shared-registry", include: ALL_SUITES, exclude: ISOLATED_SUITES, isolate: false },
      },
      {
        test: { ...shared, name: "isolated", include: ISOLATED_SUITES, isolate: true },
      },
    ],
    coverage: {
      provider: "v8",
      clean: false,
      cleanOnRerun: false,
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        "src/app/{state,progress,theme}.ts": {
          statements: 80,
          branches: 80,
          functions: 90,
          lines: 80,
          perFile: true,
        },
        "src/app/gardenViews.ts": { 100: true },
        "src/app/content/prayerCalculation.ts": {
          statements: 60,
          branches: 45,
          functions: 60,
          lines: 70,
        },
        "src/lib/auth.ts": {
          statements: 15,
          branches: 15,
          functions: 9,
          lines: 15,
        },
      },
    },
  },
});

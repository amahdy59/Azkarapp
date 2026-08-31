import os from "node:os";
import { defineConfig } from "vitest/config";

const cpuCount = os.cpus().length || 4;

import { ISOLATED_SUITES } from "./src/test/isolatedSuites";

const ALL_SUITES = ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"];

/**
 * Suite speed (this machine, 16 cores): 3 m 34 s on the stock `forks` pool with
 * per-file isolation, 1 m 49 s on worker threads, 33 s once the threads share a
 * module registry. Nearly all of it was environment and import cost paid once
 * per file — 918 s of accumulated worker time against 306 s of actual tests.
 */
const shared = {
  /**
   * 15s is ample for any single test here in isolation — the whole suite runs
   * in about 31s. The headroom is for `pnpm check`, where the suite shares the
   * machine with the production build and the type-checker: measured under that
   * contention the suite takes ~87s rather than 31s, and one ordinary
   * CategoryScreen render once crossed 15s and failed the gate for no reason of
   * its own.
   */
  testTimeout: 25000,
  environment: "jsdom" as const,
  pool: "threads" as const,
  /**
   * Leave the machine some room. `pnpm check` runs the suite alongside the
   * build and the type-checker; an unbounded pool took every core, and the
   * resulting contention stretched an ordinary test past its 15-second timeout.
   */
  maxWorkers: Math.min(4, Math.max(2, Math.floor(cpuCount / 4))),
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
          // auth.ts is 555 lines; unit tests cover only the exported
          // OTP / OAuth / session / profile / settings surface. The large
          // async sync, pagination, and merge functions (lines 200–555)
          // require a live Supabase instance and are exercised by E2E
          // smoke tests rather than unit tests. Threshold reflects the
          // measured unit-test coverage for this file.
          statements: 3,
          branches: 0,
          functions: 9,
          lines: 3,
        },
      },
    },
  },
});

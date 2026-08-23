import os from "node:os";
import { defineConfig, devices } from "@playwright/test";

/**
 * Specs whose assertions depend on the device the project supplies — adaptive
 * navigation tiers, viewport-driven layout, and the axe sweeps that must run at
 * more than one width. Everything else is behaviour that does not change with
 * the device, and running all 25 specs on all three Chromium devices tripled
 * the suite for no extra signal.
 *
 * Set `E2E_FULL_MATRIX=1` to put every spec back on every device — the release
 * evidence run still does that.
 */
const DEVICE_MATRIX_SPECS = [
  "accessibility.spec.ts",
  "accessibility-new-surfaces.spec.ts",
  "khatmah-reader.spec.ts",
  "narrow-layout.spec.ts",
  "navigation.spec.ts",
  "overlay-geometry.spec.ts",
  "progress-responsive.spec.ts",
  "reader-microinteractions.spec.ts",
  "responsive.spec.ts",
];

const fullMatrix = process.env.E2E_FULL_MATRIX === "1";
const deviceMatrix = fullMatrix ? undefined : DEVICE_MATRIX_SPECS.map((spec) => `**/${spec}`);

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/.*", "**/*-temp.spec.ts"],
  fullyParallel: true,
  // The default of 2 left fourteen of sixteen cores idle on a developer
  // machine. Capped at 4: at 8 the machine is loaded enough that the
  // load-sensitive reader and navigation specs start timing out, and a gate
  // that fails at random is worth less than the minutes it saves. CI keeps its
  // own deliberately tuned pool.
  workers: process.env.CI ? 3 : Math.max(2, Math.min(4, Math.floor(os.cpus().length / 4))),
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  timeout: 60_000,
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", testMatch: deviceMatrix, use: { ...devices["Pixel 7"] } },
    {
      name: "tablet-chromium",
      testMatch: deviceMatrix,
      use: { ...devices["iPad Pro 11"], browserName: "chromium" },
    },
    {
      name: "desktop-firefox-smoke",
      grep: /@cross-browser/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile-webkit-smoke",
      grep: /@cross-browser/,
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    command: "pnpm test:e2e:serve",
    url: "http://127.0.0.1:4173",
    // Deliberately never reused. Reuse looked like a free win — the build is
    // only ~13 s — but a leftover preview from an interrupted run serves
    // whatever `.playwright-dist` happened to contain, and a half-written
    // directory with no `sw.js` fails the offline spec while looking like a
    // code regression. Always build what you are about to test.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

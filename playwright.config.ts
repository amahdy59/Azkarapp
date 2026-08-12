import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/.*", "**/*-temp.spec.ts"],
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" } },
    {
      name: "tablet-chromium",
      use: { ...devices["iPad Pro 11"], browserName: "chromium", channel: process.env.CI ? undefined : "chrome" },
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
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

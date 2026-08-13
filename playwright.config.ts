import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/.*", "**/*-temp.spec.ts"],
  fullyParallel: true,
  workers: process.env.CI ? 3 : 2,
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
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    {
      name: "tablet-chromium",
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
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

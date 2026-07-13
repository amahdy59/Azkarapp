import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 3,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    reducedMotion: "reduce",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" } },
    {
      name: "tablet-chromium",
      use: { ...devices["iPad Pro 11"], browserName: "chromium", channel: process.env.CI ? undefined : "chrome" },
    },
  ],
  webServer: {
    command: "corepack pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
});

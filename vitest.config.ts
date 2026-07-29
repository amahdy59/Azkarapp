import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
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

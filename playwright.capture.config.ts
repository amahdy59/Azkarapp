import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/** Explicit captures are separate from assertion-bearing CI inventory. */
export default defineConfig({
  ...base,
  testIgnore: ["**/.*", "**/*-temp.spec.ts"],
  testMatch: ["**/evidence-capture.spec.ts", "**/baseline-capture.spec.ts"],
  projects: [{ name: "capture-chromium", use: { browserName: "chromium" } }],
});

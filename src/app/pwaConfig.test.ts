import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA update policy", () => {
  it("keeps the service worker on the user-controlled prompt strategy", () => {
    const viteConfig = readFileSync("vite.config.ts", "utf8");
    const appEntry = readFileSync("src/main.tsx", "utf8");

    expect(viteConfig).toMatch(/registerType:\s*["']prompt["']/);
    expect(appEntry).toContain("onNeedRefresh()");
    expect(appEntry).toContain('new Event("azkar-update-available")');
  });
});

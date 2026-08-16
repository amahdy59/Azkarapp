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

  it("asks the browser to look for a new worker instead of waiting for a navigation", () => {
    const appEntry = readFileSync("src/main.tsx", "utf8");

    // The prompt strategy only ever fires if something calls update(). Browsers
    // check on navigation, and an installed PWA is resumed rather than
    // navigated, so without these the notice can go unseen for days.
    expect(appEntry).toContain("onRegisteredSW(");
    expect(appEntry).toContain("registration.update()");
    expect(appEntry).toMatch(/visibilitychange/);
    expect(appEntry).toMatch(/addEventListener\(\s*["']online["']/);
  });
});

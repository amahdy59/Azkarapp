import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = readFileSync("capacitor.config.ts", "utf8");
const mark = readFileSync("android/app/src/main/res/drawable/widget_mark.xml", "utf8");
const webMark = readFileSync("public/azkar-icon.svg", "utf8");

describe("Android notification branding", () => {
  it("uses a single-color version of the app mark as the native status-bar icon", () => {
    expect(config).toMatch(/LocalNotifications:\s*\{[\s\S]*smallIcon:\s*["']widget_mark["']/);
    expect(mark).toContain("<vector");
    const paths = [...webMark.matchAll(/<path d="([^"]+)"/g)];
    expect(paths).toHaveLength(2);
    for (const [, path] of paths) {
      expect(mark).toContain(`android:fillColor="#F4E5C6" android:pathData="${path}"`);
    }
  });
});

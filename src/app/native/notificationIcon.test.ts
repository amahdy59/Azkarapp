import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = readFileSync("capacitor.config.ts", "utf8");
const launcherMark = readFileSync("android/app/src/main/res/drawable/widget_mark.xml", "utf8");
const launcherIcon = readFileSync("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", "utf8");

describe("Android notification branding", () => {
  it("uses the supplied artwork for adaptive launcher icons", () => {
    expect(launcherIcon).toContain('android:drawable="@drawable/app_icon"');
  });

  it("uses the launcher foreground mark as the native status-bar icon", () => {
    expect(config).toMatch(/LocalNotifications:\s*\{[\s\S]*smallIcon:\s*["']widget_mark["']/);
    expect(launcherMark).toContain("<vector");
    expect(launcherMark).toContain('android:fillColor="#F4E5C6"');
  });
});

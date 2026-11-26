import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

describe("retained Quran recording permission and acceptance", () => {
  it("pins the actual provider copying permission outside ignored local output", () => {
    const manifest = JSON.parse(readFileSync("docs/audio/quran-reciter-pilot/manifest.json", "utf8"));
    const bytes = readFileSync("docs/audio/quran-reciter-pilot/provider-permission.html");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(manifest.permissionSha256);
    const text = bytes
      .toString("utf8")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    expect(text).toContain("we allow any visitor or developer to copy any material or use any link");
    expect(manifest.permissionUrl).toBe("https://www.mp3quran.net/eng/privacy");
  });
});

import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("local audio gate", () => {
  it("validates the real catalog without requesting any hosted recording", () => {
    const preload = `globalThis.fetch = () => { process.exit(97); };`;
    const output = execFileSync(
      process.execPath,
      [
        "--import",
        `data:text/javascript,${encodeURIComponent(preload)}`,
        "scripts/validate-audio-manifest.mjs",
        "--local",
      ],
      { encoding: "utf8", timeout: 20_000, env: { ...process.env, VITE_AUDIO_BASE_URL: "https://offline.invalid" } },
    );
    expect(output).toContain("local metadata; hosted probes required separately");
    expect(output).toContain("approved mappings");
  });

  it("rejects unknown options instead of silently omitting hosted validation", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/validate-audio-manifest.mjs", "--offline"], { stdio: "pipe" }),
    ).toThrow();
  });
});

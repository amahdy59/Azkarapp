import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { describe, expect, it } from "vitest";

function check(files) {
  const directory = mkdtempSync(join(tmpdir(), "azkar-motion-"));
  try {
    for (const [name, content] of Object.entries(files)) writeFileSync(join(directory, name), content);
    return spawnSync(
      process.execPath,
      [fileURLToPath(new URL("./check-motion-rules.mjs", import.meta.url)), directory],
      { encoding: "utf8" },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("motion rules", () => {
  it("rejects a later ambient loop even when an earlier reduced-motion rule exists", () => {
    const result = check({
      "hero.css":
        "@media (prefers-reduced-motion: reduce) { img { animation: none; } }\nimg { animation: breathe 45s ease-in-out infinite; }",
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("no-infinite-animation");
  });
  it("rejects JSX layout transitions and Motion targets", () => {
    const result = check({
      "progress.tsx":
        'const a = <div className="transition-[width]" style={{width: "20%"}} />; const b = <motion.div animate={{ height: 50 }} />;',
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("JSX className");
    expect(result.stdout).toContain("JSX animate");
  });
  it("accepts static geometry, transform movement and the functional waveform exception", () => {
    const result = check({
      "progress.tsx":
        'const a = <div className="transition-colors" style={{width: "20%"}} />; const b = <motion.div animate={{ scaleX: 1 }} />;',
      "media.css": ".bar { animation: waveform 1s ease-in-out infinite; }",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("no issues found");
  });
});

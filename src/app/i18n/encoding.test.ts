import { describe, expect, it } from "vitest";
import ar from "./ar";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

/** Sequences that only appear when UTF-8 Arabic has been decoded as Latin-1. */
const MOJIBAKE = /[\u00d8\u00d9\u00da\u00c3\u00c2][\u0080-\u00bf]/;

function collectStrings(value: unknown, path = "", out: Array<[string, string]> = []) {
  if (typeof value === "string") {
    out.push([path, value]);
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectStrings(child, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
}

describe("Arabic copy encoding", () => {
  const entries = collectStrings(ar);

  it("has no mojibake from a Latin-1 round trip", () => {
    // A grouping label shipped as "Ø£Ø°ÙØ§Ø± Ø§ÙÙÙÙ" once because a script
    // wrote the file through unicode_escape. Tests passed because they only
    // asserted on English.
    const corrupted = entries.filter(([, text]) => MOJIBAKE.test(text));
    expect(corrupted.map(([path]) => path)).toEqual([]);
  });

  it("keeps Arabic script in Arabic copy", () => {
    const arabic = /[\u0600-\u06ff]/;
    // A handful of values are legitimately Latin (language names, codes), so
    // this asserts the overwhelming majority rather than every entry.
    const withArabic = entries.filter(([, text]) => arabic.test(text));
    expect(withArabic.length / entries.length).toBeGreaterThan(0.8);
  });
});

describe("source-file Arabic encoding", () => {
  // Arabic is written inline in components as well as in the i18n bundles, and
  // the same Latin-1 round trip corrupted ProgressViews.tsx after this guard
  // was first added for ar.ts alone. Scan the whole tree instead.
  // This file documents the corruption by example, so it excludes itself.
  const files = globSync("src/**/*.{ts,tsx}", { cwd: process.cwd() }).filter(
    (file) => !file.split(/[\\/]/).join("/").endsWith("i18n/encoding.test.ts"),
  );

  it("finds no mojibake in any source file", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      text.split("\n").forEach((line, index) => {
        if (MOJIBAKE.test(line)) offenders.push(`${file}:${index + 1}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});

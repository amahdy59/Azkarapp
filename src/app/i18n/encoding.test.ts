import { describe, expect, it } from "vitest";
import ar from "./ar";

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

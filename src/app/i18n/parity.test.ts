import { describe, expect, it } from "vitest";
import en from "./en";
import ar from "./ar";

/**
 * Phase 09 requires "Arabic/English copy is complete".
 *
 * This compares the actual imported objects rather than parsing the source.
 * A regex pass over the files reported 36 false missing keys because it did not
 * handle single-quoted strings — a parser is the wrong tool when the real
 * objects are right there.
 */
function keyPaths(value: unknown, prefix = "", out: string[] = []): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      keyPaths(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.push(prefix);
  }
  return out;
}

describe("i18n bundle parity", () => {
  const enKeys = new Set(keyPaths(en));
  const arKeys = new Set(keyPaths(ar));

  it("has an Arabic string for every English key", () => {
    expect([...enKeys].filter((key) => !arKeys.has(key))).toEqual([]);
  });

  it("has an English string for every Arabic key", () => {
    expect([...arKeys].filter((key) => !enKeys.has(key))).toEqual([]);
  });

  it("has no empty strings in either bundle", () => {
    const empties: string[] = [];
    for (const [label, bundle] of [
      ["en", en],
      ["ar", ar],
    ] as const) {
      const walk = (value: unknown, path = ""): void => {
        if (typeof value === "string") {
          if (value.trim() === "") empties.push(`${label}.${path}`);
        } else if (value && typeof value === "object") {
          for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key);
        }
      };
      walk(bundle);
    }
    expect(empties).toEqual([]);
  });
});

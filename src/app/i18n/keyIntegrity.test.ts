import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { t } from ".";

const appRoot = join(process.cwd(), "src", "app");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : (path.endsWith(".tsx") || path.endsWith(".ts")) && !path.includes(".test.")
        ? [path]
        : [];
  });
}

/**
 * `t()` accepts `(string & {})` so call sites can build keys dynamically, which
 * also means a typo compiles cleanly and ships the raw key to the user — that
 * is how `nav.progress` ended up as the Progress screen's document title.
 */
describe("i18n key integrity", () => {
  it("resolves every literal key passed to t()", () => {
    const unresolved: string[] = [];

    for (const path of sourceFiles(appRoot)) {
      const source = readFileSync(path, "utf8");
      const file = relative(process.cwd(), path);
      for (const match of source.matchAll(/\bt\(\s*[A-Za-z_$][\w.$]*\s*,\s*"([^"]+)"/g)) {
        const key = match[1]!;
        // A key that resolves to itself was never found in the dictionary.
        if (t("en", key) === key && t("ar", key) === key) {
          unresolved.push(`${file}: ${key}`);
        }
      }
    }

    expect(unresolved).toEqual([]);
  });
});

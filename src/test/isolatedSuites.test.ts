import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ISOLATED_SUITES } from "./isolatedSuites";

const SOURCE_ROOT = path.resolve("src");
const MOCK_CALL = `vi.${"mock"}(`;

function collectSuites(directory: string, found: string[] = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSuites(entryPath, found);
    else if (/\.test\.tsx?$/.test(entry.name)) found.push(entryPath);
  }
  return found;
}

describe("test isolation policy", () => {
  it("lists every suite that mocks a module, so the shared registry never has to serve two mocks", () => {
    const mocking = collectSuites(SOURCE_ROOT)
      .filter((file) => path.resolve(file) !== path.resolve(SOURCE_ROOT, "test/isolatedSuites.test.ts"))
      .filter((file) => readFileSync(file, "utf8").includes(MOCK_CALL))
      .map((file) => path.relative(process.cwd(), file).split(path.sep).join("/"))
      .sort();

    expect(mocking.filter((suite) => !ISOLATED_SUITES.includes(suite))).toEqual([]);
  });

  it("names only suites that still exist", () => {
    const present = new Set(
      collectSuites(SOURCE_ROOT).map((file) => path.relative(process.cwd(), file).split(path.sep).join("/")),
    );
    expect(ISOLATED_SUITES.filter((suite) => !present.has(suite))).toEqual([]);
  });
});

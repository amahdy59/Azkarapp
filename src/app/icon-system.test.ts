import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = join(process.cwd(), "src", "app");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : path.endsWith(".tsx") || path.endsWith(".ts")
        ? [path]
        : [];
  });
}

describe("icon design-system contract", () => {
  it("routes product icons through the Untitled UI adapter", () => {
    const violations = sourceFiles(appRoot)
      .filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"))
      .flatMap((path) => {
        const source = readFileSync(path, "utf8");
        const file = relative(process.cwd(), path);
        const problems: string[] = [];

        if (/from\s+["'](?:lucide-react|@mui\/icons-material)/.test(source)) {
          problems.push(`${file}: non-Untitled icon-library import`);
        }

        if (path !== join(appRoot, "components", "icons.ts") && source.includes("@untitledui/icons")) {
          problems.push(`${file}: bypasses the central icon adapter`);
        }

        return problems;
      });

    expect(violations).toEqual([]);
  });

  it("uses previous navigation rather than reset in the reader header", () => {
    const reader = readFileSync(join(appRoot, "screens", "ReaderScreen.tsx"), "utf8");
    const backLabel = 'aria-label={t(language, "common.back")}';
    const backButtonStart = reader.indexOf(backLabel);
    expect(backButtonStart).toBeGreaterThanOrEqual(0);
    const header = reader.slice(backButtonStart, reader.indexOf("<p", backButtonStart));

    expect(header).toContain("<ArrowPrevious");
    expect(header).not.toContain("RotateCcw");
  });
});

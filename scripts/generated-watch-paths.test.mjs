import { expect, test } from "vitest";
import { ignoreGeneratedWatchPath } from "./generated-watch-paths.ts";

test.each(["/workspace/Azkarapp", "C:/Users/Ahmed/My Project", "C:\\Users\\Ahmed\\My Project"])(
  "ignores generated roots and descendants without ignoring application edits: %s",
  (root) => {
    const ignored = ignoreGeneratedWatchPath(root);
    for (const folder of [
      "output",
      "coverage",
      "test-results",
      "playwright-report",
      "blob-report",
      ".playwright-dist",
      ".playwright-update",
      ".playwright-cli",
    ]) {
      expect(ignored(`${root}/${folder}`)).toBe(true);
      expect(ignored(`${root}/${folder}/deep/result.json`)).toBe(true);
    }
    for (const filename of [
      "src/app/screens/ReaderScreen.tsx",
      "public/release-notes.json",
      "e2e/ayah-image-sharing.spec.ts",
      "scripts/browser-partitions.mjs",
      "output-source.ts",
      "src/output/view.tsx",
      "README.md",
    ]) {
      expect(ignored(`${root}/${filename}`)).toBe(false);
    }
    expect(ignored(`${root}-other/output/report.json`)).toBe(false);
    expect(ignored(root)).toBe(false);
  },
);

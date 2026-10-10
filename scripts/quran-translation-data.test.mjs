import { readFileSync, readdirSync } from "node:fs";
import { expect, it } from "vitest";
import { SURAHS } from "../src/app/content/surahInfo.ts";

it("stores exactly one nonempty English meaning for each canonical Quran verse", () => {
  const root = "public/data/translations/en";
  expect(readdirSync(root).filter((file) => file.endsWith(".json"))).toHaveLength(114);
  let verseCount = 0;
  for (const surah of SURAHS) {
    const data = JSON.parse(readFileSync(`${root}/${surah.number}.json`, "utf8"));
    expect(Object.keys(data)).toEqual(Array.from({ length: surah.versesCount }, (_, index) => String(index + 1)));
    for (const text of Object.values(data)) {
      expect(typeof text).toBe("string");
      expect(text.trim().length).toBeGreaterThan(0);
    }
    verseCount += Object.keys(data).length;
  }
  expect(verseCount).toBe(6236);
});

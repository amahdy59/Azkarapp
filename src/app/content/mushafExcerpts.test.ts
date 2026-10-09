import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MUSHAF_EXCERPTS, excerptActiveWord, excerptWordMapping, selectMushafExcerpt } from "./mushafExcerpts";
import { QURAN_PASSAGES } from "./quranPassages";
import type { MushafWordToken } from "../components/MushafPageViewer";
import type { MushafVerseData } from "./qcfMushaf";

const passageNames = ["ayatAlKursi", "lastTwoAlBaqarah", "alKafirun", "alIkhlas", "alFalaq", "anNas"] as const;
describe("canonical Mushaf excerpts", () => {
  for (const [index, [key, range]] of Object.entries(MUSHAF_EXCERPTS).entries()) {
    it(`selects only complete original verses and maps every source word for ${key}`, () => {
      const page = JSON.parse(readFileSync(`public/data/mushaf/${range.page}.json`, "utf8")) as MushafVerseData[];
      const lines: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
      for (const verse of page)
        for (const [position, line, isEnd, text, qcfCode] of verse.w)
          lines[line - 1]!.push({ verseKey: verse.k, position, isEnd, text, qcfCode });
      const selected = selectMushafExcerpt(lines, range.from, range.to);
      expect(selected.flat()).toEqual(
        page
          .filter((verse) => {
            const [surah, ayah] = verse.k.split(":").map(Number);
            return (
              surah === Number(range.from.split(":")[0]) &&
              ayah! >= Number(range.from.split(":")[1]) &&
              ayah! <= Number(range.to.split(":")[1])
            );
          })
          .flatMap((verse) =>
            verse.w.map(([position, , isEnd, text, qcfCode]) => ({
              verseKey: verse.k,
              position,
              isEnd,
              text,
              qcfCode,
            })),
          ),
      );
      const transcript = QURAN_PASSAGES[passageNames[index]!].arabicText;
      const mapping = excerptWordMapping(selected, transcript);
      expect(mapping).not.toBeNull();
      const last = mapping!.at(-1)!;
      expect(excerptActiveWord(mapping!, { ...last, startMs: 0, endMs: 1000, occurrence: 1 })).toEqual({
        verseKey: range.to,
        position: last.word.position,
      });
      expect(excerptWordMapping(selected, transcript + " extra")).toBeNull();
      expect(excerptActiveWord(mapping!, null)).toBeNull();
    });
  }
});

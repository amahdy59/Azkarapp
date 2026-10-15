import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MUSHAF_EXCERPTS,
  QURAN_EVIDENCE_EXCERPTS,
  excerptActiveWord,
  excerptWordMapping,
  selectMushafExcerpt,
} from "./mushafExcerpts";
import { QURAN_DHIKR_EVIDENCE } from "./zikrBenefits";
import { WIRD_QURAN_EVIDENCE } from "./wirdBenefits";
import { QURAN_PASSAGES } from "./quranPassages";
import { QURAN_IMRAN_PASSAGE } from "./quranImranPassage";
import { RELEVANT_NOW_VERSES } from "./relevantNowVerses";
import { getAzkarByCategory } from "./azkar";
import type { MushafWordToken } from "../components/MushafPageViewer";
import type { MushafVerseData } from "./qcfMushaf";

const passages = [
  QURAN_PASSAGES.ayatAlKursi,
  QURAN_PASSAGES.lastTwoAlBaqarah,
  QURAN_PASSAGES.alKafirun,
  QURAN_PASSAGES.alIkhlas,
  QURAN_PASSAGES.alFalaq,
  QURAN_PASSAGES.anNas,
  QURAN_IMRAN_PASSAGE,
];
describe("canonical Mushaf excerpts", () => {
  it("maps the reliance dhikr to only its unchanged quoted words in 9:129", () => {
    const range = QURAN_EVIDENCE_EXCERPTS["quran-009-129-excerpt"]!;
    const { lines } = readExcerptPages(range);
    const selected = selectMushafExcerpt(lines, range.from, range.to);
    for (const category of ["morning", "evening"] as const) {
      const zikr = getAzkarByCategory(category).find((item) => item.id.endsWith("hm-83"))!;
      const mapping = excerptWordMapping(selected, zikr.arabicText, true);
      expect(mapping, JSON.stringify({ text: zikr.arabicText, key: zikr.canonicalKey })).not.toBeNull();
      expect(mapping![0]!.word.position).toBeGreaterThan(1);
      expect(mapping!.every((item) => item.word.verseKey === "9:129" && !item.word.isEnd)).toBe(true);
      expect(mapping!.at(-1)!.endOffset).toBe(zikr.arabicText.length - 1);
      expect(excerptWordMapping(selected, zikr.arabicText + " extra", true)).toBeNull();
      expect(zikr.repetitionCount).toBe(7);
    }
  });
  it("maps existing evidence quotations only within their explicit cited verses", () => {
    for (const item of [...QURAN_DHIKR_EVIDENCE, ...WIRD_QURAN_EVIDENCE]) {
      const range = QURAN_EVIDENCE_EXCERPTS[item.id]!;
      const { lines } = readExcerptPages(range);
      const selected = selectMushafExcerpt(lines, range.from, range.to);
      expect(selected.length, item.id).toBeGreaterThan(0);
      const mapping = excerptWordMapping(selected, item.text.ar, true);
      expect(mapping, item.id).not.toBeNull();
      expect(excerptWordMapping(selected, item.text.ar + " extra", true)).toBeNull();
    }
  });
  for (const [index, [key, range]] of Object.entries(MUSHAF_EXCERPTS).entries()) {
    it(`selects only complete original verses and maps every source word for ${key}`, () => {
      const { page, lines } = readExcerptPages(range);
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
      const transcript = passages[index]!.arabicText;
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

function readExcerptPages(range: { page: number; endPage?: number }) {
  const pages = [range.page, ...(range.endPage ? [range.endPage] : [])].map(
    (number) => JSON.parse(readFileSync(`public/data/mushaf/${number}.json`, "utf8")) as MushafVerseData[],
  );
  const lines = pages.flatMap((page) => {
    const rows: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
    for (const verse of page)
      for (const [position, line, isEnd, text, qcfCode] of verse.w)
        rows[line - 1]!.push({ verseKey: verse.k, position, isEnd, text, qcfCode });
    return rows;
  });
  return { page: pages.flat(), lines };
}

it("maps all eighteen Home Quran passages against their explicit canonical ranges", () => {
  for (const verse of RELEVANT_NOW_VERSES) {
    const range = QURAN_EVIDENCE_EXCERPTS[`home-quran-${verse.id}`]!;
    const { lines } = readExcerptPages(range);
    expect(excerptWordMapping(selectMushafExcerpt(lines, range.from, range.to), verse.arabic), verse.id).not.toBeNull();
  }
});

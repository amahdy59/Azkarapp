import { describe, expect, it } from "vitest";
import {
  paginateQuranWords,
  portionForWord,
  readingWordsFromMushaf,
  readingWordsFromText,
} from "./quranReadingPortions";

describe("enlarged Quran portions", () => {
  it("keeps entire rendered lines together and includes every word once", () => {
    const boxes = [0, 0, 50, 50, 100, 150].map((top) => ({ top, bottom: top + 45 }));
    const portions = paginateQuranWords(boxes, 100);
    expect(portions).toEqual([
      [0, 4],
      [4, 6],
    ]);
    expect(portions.flatMap(([start, end]) => boxes.slice(start, end))).toEqual(boxes);
    expect(portionForWord(portions, 3)).toBe(0);
    expect(portionForWord(portions, 4)).toBe(1);
    expect(paginateQuranWords([], 100)).toEqual([]);
  });
  it("reconstructs Quran passage bytes including pause signs and markers", () => {
    const text = "  بِسْمِ ٱللَّهِ ۖ\nٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ﴿١﴾  ";
    expect(
      readingWordsFromText(text)
        .map((word) => word.text)
        .join(""),
    ).toBe(text);
  });
  it("preserves canonical identities, text, marker and per-page glyphs", () => {
    const words = [
      { verseKey: "1:2", position: 1, text: "ٱلْحَمْدُ", isEnd: 0, qcfCode: "ﱆ" },
      { verseKey: "1:2", position: 5, text: "٢", isEnd: 1, qcfCode: "ﱊ" },
    ];
    expect(readingWordsFromMushaf(words, 1, true)).toEqual([
      {
        id: "1:2:1",
        verseKey: "1:2",
        text: words[0]!.text,
        glyph: "ﱆ",
        fontFamily: "qcf-v2-page-1",
        endAyah: undefined,
      },
      { id: "1:2:5", verseKey: "1:2", text: "٢", glyph: "ﱊ", fontFamily: "qcf-v2-page-1", endAyah: "2" },
    ]);
    expect(readingWordsFromMushaf(words, 1, false).every((word) => word.glyph === undefined)).toBe(true);
  });
});

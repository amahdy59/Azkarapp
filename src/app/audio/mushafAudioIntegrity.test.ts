import { describe, expect, it } from "vitest";
import { collectMushafSurahText, verifyMushafSurahText } from "./mushafAudioIntegrity";
import { createArabicTextFingerprint } from "./arabicMatching";
import type { MushafVerseData } from "../content/qcfMushaf";

const page: MushafVerseData[] = [
  {
    k: "112:1",
    w: [
      [1, 1, 0, "قُلْ", "glyph"],
      [2, 1, 0, "هُوَ", "glyph"],
    ],
  },
  { k: "113:1", w: [[1, 2, 0, "unrelated"]] },
];
describe("Mushaf audio semantic boundary", () => {
  it("reconstructs complete split words in canonical order, excluding glyphs and adjacent surahs", () => {
    const continuation: MushafVerseData[] = [
      {
        k: "112:1",
        w: [
          [2, 1, 0, "هُوَ"],
          [3, 1, 0, "ٱللَّهُ"],
          [4, 1, 0, "أَحَدٌ"],
          [5, 1, 1, "١"],
        ],
      },
    ];
    const text = collectMushafSurahText(112, 1, [page, continuation]);
    expect(text).toBe("قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾");
    expect(
      verifyMushafSurahText(
        { surah: 112, verseCount: 1, textHash: createArabicTextFingerprint(text), pages: [], variants: [] },
        [page, continuation],
      ),
    ).toBe(text);
  });
  it("rejects missing verses, missing words, conflicting copies and a changed transcript", () => {
    expect(() => collectMushafSurahText(112, 2, [page])).toThrow("Incomplete Quran verse");
    expect(() => collectMushafSurahText(112, 1, [[{ k: "112:1", w: [[2, 1, 0, "هُوَ"]] }]])).toThrow(
      "Incomplete Quran word",
    );
    expect(() => collectMushafSurahText(112, 1, [page, [{ k: "112:1", w: [[1, 1, 0, "changed"]] }]])).toThrow(
      "Conflicting Quran word",
    );
    expect(() =>
      verifyMushafSurahText({ surah: 112, verseCount: 1, textHash: "wrong", pages: [], variants: [] }, [page]),
    ).toThrow("transcript mismatch");
  });
});

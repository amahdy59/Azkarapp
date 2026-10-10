import { describe, expect, it } from "vitest";
import { searchSurahs } from "./surahInfo";

describe("searchSurahs", () => {
  it("returns all surahs on empty query", () => {
    expect(searchSurahs("").length).toBe(114);
    expect(searchSurahs("   ").length).toBe(114);
  });

  it("finds by surah number", () => {
    const res = searchSurahs("2");
    expect(res).toHaveLength(1);
    expect(res[0]?.nameArabic).toBe("البقرة");
  });

  it("normalizes Arabic letters (alif with hamza variants and ta marbuta)", () => {
    // Search with bare alif 'الاسراء' finds 'الإسراء'
    const israa = searchSurahs("الاسراء");
    expect(israa.some((s) => s.number === 17)).toBe(true);

    // Search with ha 'البقره' finds 'البقرة'
    const baqarah = searchSurahs("البقره");
    expect(baqarah.some((s) => s.number === 2)).toBe(true);

    // Search with bare alif 'عمران' finds 'آل عمران'
    const imran = searchSurahs("عمران");
    expect(imran.some((s) => s.number === 3)).toBe(true);
  });

  it("finds by English name", () => {
    const res = searchSurahs("baqarah");
    expect(res.some((s) => s.number === 2)).toBe(true);

    const fatihah = searchSurahs("fatihah");
    expect(fatihah.some((s) => s.number === 1)).toBe(true);
  });
});

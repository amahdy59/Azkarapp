import { describe, expect, it } from "vitest";
import { matchesSearch, normalizeSearchText } from "./searchNormalization";

describe("normalizeSearchText", () => {
  it("strips diacritics so typed Arabic matches vocalized content", () => {
    // Every zikr in the corpus is fully vocalized, but nobody types tashkeel.
    expect(normalizeSearchText("بِاسْمِكَ اللَّهُمَّ")).toBe(normalizeSearchText("باسمك اللهم"));
  });

  it("folds alef variants", () => {
    const folded = normalizeSearchText("ا");
    for (const variant of ["أ", "إ", "آ", "ٱ"]) {
      expect(normalizeSearchText(variant)).toBe(folded);
    }
  });

  it("folds taa marbuta, alef maqsura, and hamza carriers", () => {
    expect(normalizeSearchText("صلاة")).toBe(normalizeSearchText("صلاه"));
    expect(normalizeSearchText("على")).toBe(normalizeSearchText("علي"));
    expect(normalizeSearchText("مؤمن")).toBe(normalizeSearchText("مومن"));
    expect(normalizeSearchText("سائل")).toBe(normalizeSearchText("سايل"));
  });

  it("removes tatweel", () => {
    expect(normalizeSearchText("الحـــمد")).toBe(normalizeSearchText("الحمد"));
  });

  it("lowercases Latin text and collapses whitespace", () => {
    expect(normalizeSearchText("  In The   Name  ")).toBe("in the name");
  });

  it("does not collapse genuinely different words", () => {
    // Folding is deliberately conservative; distinct roots must stay distinct.
    expect(normalizeSearchText("كتب")).not.toBe(normalizeSearchText("كسب"));
    expect(normalizeSearchText("نور")).not.toBe(normalizeSearchText("نار"));
  });
});

describe("matchesSearch", () => {
  it("matches an undiacritized query against vocalized content", () => {
    const content = "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.";
    expect(matchesSearch(content, normalizeSearchText("باسمك اللهم"))).toBe(true);
  });

  it("matches across alef spelling differences", () => {
    expect(matchesSearch("الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا", normalizeSearchText("احيانا"))).toBe(true);
  });

  it("returns false for an empty needle rather than matching everything", () => {
    expect(matchesSearch("anything", "")).toBe(false);
  });

  it("still matches Latin translations case-insensitively", () => {
    expect(matchesSearch("In Your name, O Allah, I die and I live.", normalizeSearchText("YOUR NAME"))).toBe(true);
  });
});

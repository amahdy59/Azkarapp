import { describe, expect, it } from "vitest";
import {
  getSearchSnippet,
  matchesSearch,
  normalizeSearchText,
  searchKeyFor,
  splitHighlightedSearchTokens,
} from "./searchNormalization";

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

describe("getSearchSnippet", () => {
  it("includes late matches without modifying their original vocalized words", () => {
    const text = `${"مقدمة ".repeat(50)}أَحْيَانَا ${"تتمة ".repeat(30)}`;
    const snippet = getSearchSnippet(text, "احيانا");
    expect(snippet).toContain("أَحْيَانَا");
    expect(snippet).toMatch(/^… .* …$/u);
    expect(text).toContain(snippet.replace(/^… | …$/gu, ""));
    expect(snippet.split(" ").length).toBeLessThanOrEqual(26);
  });

  it("keeps short text unchanged and bounds unmatched previews", () => {
    expect(getSearchSnippet("  بِاسْمِكَ اللَّهُمَّ  ", "باسمك")).toBe("  بِاسْمِكَ اللَّهُمَّ  ");
    expect(getSearchSnippet("word ".repeat(100), "absent").split(" ")).toHaveLength(25);
  });
});

describe("searchKeyFor and splitHighlightedSearchTokens", () => {
  it("caches normalized zikr keys by id", () => {
    const key = searchKeyFor(
      {
        id: "test-zikr-key-cache",
        arabicText: "بِاسْمِكَ اللَّهُمَّ",
        translation: "In Your name",
        transliteration: "Bismika Allahumma",
      },
      "Test Label",
    );
    expect(key).toContain("باسمك اللهم");
    expect(key).toContain("test label");
  });

  it("splits whole words while preserving vocalized Arabic tokens intact", () => {
    const runs = splitHighlightedSearchTokens("الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا", "احيانا");
    expect(runs).toEqual([
      { text: "الْحَمْدُ لِلَّهِ الَّذِي ", matched: false },
      { text: "أَحْيَانَا", matched: true },
      { text: " بَعْدَ مَا أَمَاتَنَا", matched: false },
    ]);
  });
});

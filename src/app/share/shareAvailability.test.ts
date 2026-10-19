import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { getShareAvailability, sharePresetOptions } from "./shareAvailability";
import { getShareSections, toShareItem, type ShareItem } from "./shareLayout";

describe("sharing content availability", () => {
  it("keeps reviewed English meanings available throughout the canonical zikr and dua corpus", () => {
    const readings = [...ALL_AZKAR, ...COMPREHENSIVE_DUAS].filter((item) => !item.isCollectionIntroduction);
    expect(readings.length).toBeGreaterThan(200);
    expect(readings.filter((item) => !item.translation?.trim()).map((item) => item.id)).toEqual([]);
    for (const zikr of readings) {
      const item = toShareItem(zikr, "ar", "https://example.com/");
      if (!item.reminder)
        expect(getShareSections(item, { meaning: true }).find((section) => section.key === "translation")?.text).toBe(
          zikr.translation,
        );
    }
  });
  it("does not select nonexistent, whitespace-only, hidden reminder or wrong-language additions", () => {
    const items: ShareItem[] = [
      {
        id: "a",
        arabicText: "نص",
        translation: "  ",
        benefit: " ",
        transliteration: "",
        wordMeanings: "معنى",
        language: "en",
      },
      { id: "b", arabicText: "", reminder: true, translation: "hidden", transliteration: "hidden" },
    ];
    expect(getShareAvailability(items)).toEqual({
      meaning: 0,
      wordMeanings: 0,
      pronunciation: 0,
      benefit: 0,
      source: 0,
    });
    expect(sharePresetOptions("full", items)).toEqual({
      meaning: false,
      wordMeanings: false,
      pronunciation: false,
      benefit: false,
    });
  });
  it("reports partial coverage and enables only additions actually rendered", () => {
    const items: ShareItem[] = [
      { id: "a", arabicText: "نص", translation: "Meaning", language: "ar" },
      { id: "b", arabicText: "آخر", benefit: "Benefit", wordMeanings: "معنى", language: "ar" },
    ];
    expect(getShareAvailability(items)).toEqual({
      meaning: 1,
      wordMeanings: 1,
      pronunciation: 0,
      benefit: 1,
      source: 0,
    });
    expect(sharePresetOptions("full", items)).toEqual({
      meaning: true,
      wordMeanings: true,
      pronunciation: false,
      benefit: true,
    });
    expect(sharePresetOptions("translated", items)).toEqual({
      meaning: true,
      wordMeanings: false,
      pronunciation: false,
      benefit: false,
    });
  });
});

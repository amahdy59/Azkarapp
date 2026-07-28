import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import { getAzkarByCategory, getCategoryTotal } from "./azkar";

describe("azkar content totals", () => {
  it("derives every category total from its content collection", () => {
    for (const category of CATEGORIES) {
      const items = getAzkarByCategory(category.id);
      expect(getCategoryTotal(category.id)).toBe(items.length);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it("keeps order indexes unique within each category", () => {
    for (const category of CATEGORIES) {
      const indexes = getAzkarByCategory(category.id).map((item) => item.orderIndex);
      expect(new Set(indexes).size).toBe(indexes.length);
    }
  });

  it("passes comprehensive authenticity & content completeness audit across all zikrs", () => {
    const missingHadith: string[] = [];
    for (const category of CATEGORIES) {
      const items = getAzkarByCategory(category.id);
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.arabicText.trim().length).toBeGreaterThan(0);
        expect(item.translation.trim().length).toBeGreaterThan(0);
        expect(item.repetitionCount).toBeGreaterThanOrEqual(1);
        expect(item.sourceReference).toBeTruthy();
        expect(item.sourceReference.trim().length).toBeGreaterThan(0);
        if (!item.hadithText || !item.hadithText.trim()) {
          missingHadith.push(`${item.category}:${item.id}`);
        }
      }
    }
    expect(missingHadith).toEqual([]);
  });

  it("verifies no Quranic Zikrs are truncated and Surah metadata is valid", () => {
    const sleepAzkar = getAzkarByCategory("before_sleep");
    const surahItems = sleepAzkar.filter((z) => z.isSurah);
    expect(surahItems.length).toBeGreaterThanOrEqual(4);

    for (const surah of surahItems) {
      expect(surah.surahNameArabic).toBeTruthy();
      expect(surah.arabicText).not.toContain("...");
    }

    // Verify Ayat Al-Kursi in after_prayer is untruncated
    const afterPrayerAzkar = getAzkarByCategory("after_prayer");
    const ayatKursi = afterPrayerAzkar.find((z) => z.id === "ap-ref-9");
    expect(ayatKursi?.arabicText).not.toContain("...");
    expect(ayatKursi?.arabicText).toContain("وَهُوَ الْعَلِيُّ الْعَظِيمُ");
  });

  it("verifies Tasbeeh items after prayer are split into individual cards", () => {
    const afterPrayerAzkar = getAzkarByCategory("after_prayer");
    const subhanallah = afterPrayerAzkar.find((z) => z.id === "ap-tasbeeh-subhanallah");
    const alhamdulillah = afterPrayerAzkar.find((z) => z.id === "ap-tasbeeh-alhamdulillah");
    const allahuakbar = afterPrayerAzkar.find((z) => z.id === "ap-tasbeeh-allahuakbar");

    expect(subhanallah?.repetitionCount).toBe(33);
    expect(alhamdulillah?.repetitionCount).toBe(33);
    expect(allahuakbar?.repetitionCount).toBe(33);
  });
});

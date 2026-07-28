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
    expect(surahItems.length).toBe(6); // Al-Ikhlas, Al-Falaq, An-Nas, Al-Kafirun, As-Sajdah, Al-Mulk

    for (const surah of surahItems) {
      expect(surah.surahNameArabic).toBeTruthy();
      expect(surah.arabicText).not.toContain("...");
      expect(surah.hasBasmalah).toBe(true);
    }

    const ikhlas = sleepAzkar.find((z) => z.id === "s-hm-99-ikhlas");
    const falaq = sleepAzkar.find((z) => z.id === "s-hm-99-falaq");
    const nas = sleepAzkar.find((z) => z.id === "s-hm-99-nas");
    const ayatKursi = sleepAzkar.find((z) => z.id === "s-hm-100");
    const amanarRasul = sleepAzkar.find((z) => z.id === "s-hm-101");

    expect(ikhlas?.repetitionCount).toBe(3);
    expect(falaq?.repetitionCount).toBe(3);
    expect(nas?.repetitionCount).toBe(3);

    expect(ayatKursi?.hasSeekRefuge).toBe(true);
    expect(amanarRasul?.hasSeekRefuge).toBe(true);

    // Verify Ayat Al-Kursi in after_prayer is untruncated
    const afterPrayerAzkar = getAzkarByCategory("after_prayer");
    const ayatKursiAfterPrayer = afterPrayerAzkar.find((z) => z.id === "ap-ref-9");
    expect(ayatKursiAfterPrayer?.arabicText).not.toContain("...");
    expect(ayatKursiAfterPrayer?.arabicText).toContain("وَهُوَ الْعَلِيُّ الْعَظِيمُ");
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

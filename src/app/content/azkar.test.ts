import { describe, expect, it } from "vitest";
import { CATEGORIES } from "./categories";
import {
  ALL_AZKAR,
  getAzkarByCategory,
  getAzkarForMode,
  getCategoryTotal,
  getCollectionIntroduction,
  getRoutineStepCount,
} from "./azkar";
import { QURAN_PASSAGES } from "./quranPassages";

describe("azkar content totals", () => {
  const eagerCategories = CATEGORIES.filter(
    (category) => category.id !== "comprehensive_duas" && category.id !== "friday_kahf",
  );

  it("derives every category total from its content collection", () => {
    for (const category of eagerCategories) {
      const items = getAzkarByCategory(category.id);
      expect(getCategoryTotal(category.id)).toBe(items.length);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it("keeps order indexes unique within each category", () => {
    for (const category of eagerCategories) {
      const indexes = getAzkarByCategory(category.id).map((item) => item.orderIndex);
      expect(new Set(indexes).size).toBe(indexes.length);
    }
  });

  it("keeps the audited morning, evening, and before-sleep arrangements", () => {
    expect(getAzkarByCategory("morning").map((item) => item.id)).toEqual([
      "m-hm-77m",
      "m-hm-78m",
      "m-hm-89m",
      "m-hm-75",
      "m-hm-76a",
      "m-hm-76b",
      "m-hm-76c",
      "m-hm-97",
      "m-hm-86",
      "m-hm-84",
      "m-hm-82",
      "m-hm-85",
      "m-hm-83",
      "m-hm-79",
      "m-hm-87",
      "m-hm-90m",
      "m-hm-80m",
      "m-hm-81m",
      "m-hm-88",
      "m-hm-95",
      "m-hm-91",
      "m-hm-93",
      "m-hm-94",
      "m-hm-96",
      "m-hm-98",
    ]);

    expect(getAzkarByCategory("evening").map((item) => item.id)).toEqual([
      "e-hm-77e",
      "e-hm-78e",
      "e-hm-89e",
      "e-hm-75",
      "e-hm-76a",
      "e-hm-76b",
      "e-hm-76c",
      "e-hm-86",
      "e-hm-97",
      "e-hm-84",
      "e-hm-82",
      "e-hm-85",
      "e-hm-83",
      "e-hm-79",
      "e-hm-87",
      "e-hm-90e",
      "e-hm-80e",
      "e-hm-81e",
      "e-hm-88",
      "e-hm-91",
      "e-hm-92",
      "e-hm-96",
      "e-hm-98",
    ]);

    expect(getAzkarByCategory("before_sleep").map((item) => item.id)).toEqual([
      "s-hm-100",
      "s-hm-101",
      "s-hm-99-ikhlas",
      "s-hm-99-falaq",
      "s-hm-99-nas",
      "s-hm-109a",
      "s-hm-110a",
      "s-hm-110b",
      "s-hm-102",
      "s-hm-105",
      "s-hm-104",
      "s-hm-108",
      "s-hm-107",
      "s-hm-109",
      "s-hm-106-subhanallah",
      "s-hm-106-alhamdulillah",
      "s-hm-106-allahu-akbar",
      "s-hm-111",
    ]);
  });

  it("keeps introductions optional and outside routine counters", () => {
    expect(getCollectionIntroduction("morning")?.id).toBe("m-hm-75a");
    expect(getCollectionIntroduction("evening")?.id).toBe("e-hm-75a");
    expect(getCollectionIntroduction("before_sleep")).toBeUndefined();
    expect(getAzkarByCategory("morning").some((zikr) => zikr.isCollectionIntroduction)).toBe(false);
    expect(getAzkarByCategory("evening").some((zikr) => zikr.isCollectionIntroduction)).toBe(false);
  });

  it("assigns semantic groups, core membership, and grouped rituals to every main routine item", () => {
    for (const category of ["morning", "evening", "before_sleep"] as const) {
      for (const zikr of getAzkarByCategory(category)) {
        expect(zikr.groupId, zikr.id).toBeTruthy();
        expect(zikr.groupOrder, zikr.id).toBeTypeOf("number");
        expect(zikr.itemOrder, zikr.id).toBeTypeOf("number");
        expect(zikr.includedInCore, zikr.id).toBeTypeOf("boolean");
      }
      expect(getAzkarForMode(category, "core").every((zikr) => zikr.includedInCore)).toBe(true);
      expect(getRoutineStepCount(category, "core")).toBeLessThanOrEqual(getAzkarForMode(category, "core").length);
    }

    expect(
      getAzkarByCategory("before_sleep")
        .slice(-4)
        .map((zikr) => zikr.id),
    ).toEqual(["s-hm-106-subhanallah", "s-hm-106-alhamdulillah", "s-hm-106-allahu-akbar", "s-hm-111"]);
    expect(getAzkarByCategory("before_sleep").at(-1)?.groupId).toBe("final");
  });

  it("passes comprehensive authenticity & content completeness audit across all zikrs", () => {
    const missingHadith: string[] = [];
    for (const category of eagerCategories) {
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
    expect(ayatKursiAfterPrayer?.arabicText).toBe(QURAN_PASSAGES.ayatAlKursi.arabicText);
  });

  it("keeps every displayed text and transliteration complete", () => {
    for (const zikr of ALL_AZKAR) {
      expect(zikr.arabicText, zikr.id).not.toContain("...");
      expect(zikr.transliteration, zikr.id).not.toContain("...");
      expect(zikr.translation, zikr.id).not.toContain("...");
    }

    const morningIkhlas = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-76a");
    const sleepIkhlas = ALL_AZKAR.find((zikr) => zikr.id === "s-hm-99-ikhlas");
    expect(morningIkhlas?.arabicText).toBe(QURAN_PASSAGES.alIkhlas.arabicText);
    expect(sleepIkhlas?.translation).toBe(QURAN_PASSAGES.alIkhlas.translation);
  });

  it("keeps the accepted-deeds morning dua consistent with its canonical duplicate", () => {
    const morningDua = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-95");
    const afterPrayerDua = ALL_AZKAR.find((zikr) => zikr.id === "ap-ref-10");

    expect(morningDua?.arabicText).toContain("\u0648\u064e\u0639\u064e\u0645\u064e\u0644\u064b\u0627");
    expect(morningDua?.arabicText).not.toContain("\u0648\u064e\u0639\u064e\u0644\u064e\u0645\u064e\u0644\u064b\u0627");
    expect(afterPrayerDua?.arabicText).toContain("\u0648\u064e\u0639\u064e\u0645\u064e\u0644\u064b\u0627");
    expect(afterPrayerDua?.arabicText).not.toContain(
      "\u0648\u064e\u0639\u064e\u0644\u064e\u0645\u064e\u0644\u064b\u0627",
    );
    expect(afterPrayerDua?.canonicalKey).toBe(morningDua?.canonicalKey);
  });

  it("does not present reviewed weak or fabricated special virtues as authentic practice", () => {
    expect(ALL_AZKAR.some((zikr) => zikr.id === "ap-ref-11")).toBe(false);
    for (const id of ["m-hm-83", "e-hm-83", "da-ref-5"]) {
      const zikr = ALL_AZKAR.find((item) => item.id === id);
      expect(zikr?.repetitionCount, id).toBe(1);
      expect(zikr?.sourceReference, id).toBe("Qur’an 9:129.");
    }

    const eclipse = ALL_AZKAR.find((zikr) => zikr.id === "ne-ref-6");
    expect(eclipse?.sourceReference).toContain("Sunan Abu Dawud 1191");
    expect(eclipse?.benefit).toContain("supplicate");
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

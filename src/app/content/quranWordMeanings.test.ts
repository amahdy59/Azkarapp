import { describe, expect, it, vi } from "vitest";
import { ALL_AZKAR } from "./azkar";
import { applyContentReview } from "./contentReview";
import { FRIDAY_KAHF } from "./fridayKahf";
import {
  buildQuranTextSegments,
  getQuranSurahNumber,
  getQuranWordMeaningEntry,
  getQuranWordMeanings,
  loadSurahWordMeanings,
} from "./quranWordMeanings";

const fridaySurah = applyContentReview(FRIDAY_KAHF.map((zikr) => ({ ...zikr })))[0]!;
const fullSurahs = [...ALL_AZKAR.filter((zikr) => zikr.isSurah), fridaySurah].filter(
  (zikr, index, collection) =>
    collection.findIndex((candidate) => candidate.canonicalKey === zikr.canonicalKey) === index,
);

describe("Quran difficult-word meanings", () => {
  it("covers every full surah currently available in the app", () => {
    expect(fullSurahs.map(getQuranSurahNumber).sort((left, right) => (left ?? 0) - (right ?? 0))).toEqual([
      18, 32, 67, 109, 112, 113, 114,
    ]);

    for (const surah of fullSurahs) {
      expect(getQuranWordMeanings(surah).length, surah.canonicalKey).toBeGreaterThan(0);
    }
  });

  it("aligns every sourced phrase without altering the Quran text", () => {
    for (const surah of fullSurahs) {
      const meanings = getQuranWordMeanings(surah);
      const segments = buildQuranTextSegments(surah.arabicText, meanings);
      const matchedMeanings = segments.flatMap((segment) => segment.meanings ?? []);
      const matchedIds = new Set(matchedMeanings.map((meaning) => meaning.id));

      expect(segments.map((segment) => segment.text).join(""), surah.canonicalKey).toBe(surah.arabicText);
      expect(
        meanings.filter((meaning) => !matchedIds.has(meaning.id)).map((meaning) => meaning.word),
        surah.canonicalKey,
      ).toEqual([]);
      expect(matchedMeanings.length, surah.canonicalKey).toBe(meanings.length);
    }
  });

  it("provides word meanings for Ayat al-Kursi and the last ayas of Al-Baqarah", () => {
    const ayatAlKursi = ALL_AZKAR.find((z) => z.canonicalKey === "quran-002-255")!;
    const lastTwoBaqarah = ALL_AZKAR.find((z) => z.canonicalKey === "quran-002-285-286")!;

    expect(ayatAlKursi).toBeDefined();
    expect(lastTwoBaqarah).toBeDefined();

    const meaningsKursi = getQuranWordMeanings(ayatAlKursi);
    const meaningsBaqarah = getQuranWordMeanings(lastTwoBaqarah);

    expect(meaningsKursi.length).toBeGreaterThan(0);
    expect(meaningsBaqarah.length).toBeGreaterThan(0);

    const segmentsKursi = buildQuranTextSegments(ayatAlKursi.arabicText, meaningsKursi);
    expect(segmentsKursi.map((s) => s.text).join("")).toBe(ayatAlKursi.arabicText);

    const segmentsBaqarah = buildQuranTextSegments(lastTwoBaqarah.arabicText, meaningsBaqarah);
    expect(segmentsBaqarah.map((s) => s.text).join("")).toBe(lastTwoBaqarah.arabicText);
  });

  it("loads the complete Mushaf chapter when only reviewed passages were bundled", async () => {
    const wasAlreadyLoaded = getQuranWordMeaningEntry("2:135", "تَهۡتَدُواْ") !== undefined;
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ "135": { تَهۡتَدُواْ: "تُرشدوا إلى الحق" } }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    try {
      await loadSurahWordMeanings(2);

      expect(fetchMock).toHaveBeenCalledTimes(wasAlreadyLoaded ? 0 : 1);
      expect(getQuranWordMeaningEntry("2:135", "تَهۡتَدُواْ")?.explanationArabic).toBeDefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./content/azkar";
import { RELEVANT_NOW_LIBRARY } from "./content/relevantNowLibrary";
import { RELEVANT_NOW_VERSES } from "./content/relevantNowVerses";
import { getReminderContexts, selectLibraryEvidence } from "./dailyEvidence";
import { CATEGORY_IDS, type ReminderContext } from "./types";

const VALID_CONTEXTS = new Set<string>([
  ...CATEGORY_IDS,
  "before_fajr",
  "fajr",
  "dhuha",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
  "last_third",
  "friday",
  "friday_after_asr",
  "monday",
  "thursday",
  "general",
]);

const DAY = "2026-09-07";
const select = (contexts: readonly ReminderContext[], language: "en" | "ar" = "en") =>
  selectLibraryEvidence(RELEVANT_NOW_LIBRARY, RELEVANT_NOW_VERSES, DAY, language, contexts);

describe("the reviewed source library", () => {
  it("ships the 41 sources that were signed off", () => {
    expect(RELEVANT_NOW_LIBRARY).toHaveLength(41);
    expect(RELEVANT_NOW_LIBRARY.filter((source) => source.type === "quran")).toHaveLength(18);
    expect(RELEVANT_NOW_LIBRARY.filter((source) => source.type === "hadith")).toHaveLength(23);
  });

  it("gives every source a distinct id", () => {
    const ids = RELEVANT_NOW_LIBRARY.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("declares only contexts the reminder can actually produce", () => {
    // A source curated for a context nothing emits is a source no reader ever
    // sees — the failure mode this catches is silent.
    for (const source of RELEVANT_NOW_LIBRARY) {
      for (const context of source.contexts) {
        expect(VALID_CONTEXTS.has(context), `${source.id} → ${context}`).toBe(true);
      }
    }
  });

  it("resolves every narration it delegates to the corpus", () => {
    /* Four narrations carry a zikrId instead of their own text so a correction
       cannot leave two copies disagreeing. A stale id would blank the card. */
    const delegated = RELEVANT_NOW_LIBRARY.filter((source) => source.zikrId);
    expect(delegated.length).toBeGreaterThan(0);
    for (const source of delegated) {
      expect(
        ALL_AZKAR.some((zikr) => zikr.id === source.zikrId),
        source.id,
      ).toBe(true);
    }
  });

  it("gives every Qur'an source its generated verse", () => {
    for (const source of RELEVANT_NOW_LIBRARY.filter((entry) => entry.type === "quran")) {
      expect(
        RELEVANT_NOW_VERSES.some((verse) => verse.id === source.id),
        source.id,
      ).toBe(true);
    }
  });

  it("carries text for every hadith that does not delegate", () => {
    for (const source of RELEVANT_NOW_LIBRARY.filter((entry) => entry.type === "hadith" && !entry.zikrId)) {
      expect(source.arabic, source.id).toBeTruthy();
      expect(source.english, source.id).toBeTruthy();
      expect(source.reference, source.id).toBeTruthy();
    }
  });

  it("can reach every source from some context", () => {
    // Guards the gap that put H09 out of reach: it was curated for `dhuha`
    // alone, and `dhuha` is not derived, so nothing could ever select it.
    const reachable = new Set(RELEVANT_NOW_LIBRARY.flatMap((source) => source.contexts));
    const underived = new Set(["dhuha"]);
    for (const source of RELEVANT_NOW_LIBRARY) {
      const live = source.contexts.filter((context) => !underived.has(context));
      expect(live.length, `${source.id} is only reachable through an underived context`).toBeGreaterThan(0);
    }
    expect(reachable.size).toBeGreaterThan(10);
  });
});

describe("choosing from the library", () => {
  it("returns nothing when no context matches", () => {
    expect(select(["waking_up"])).toBeNull();
  });

  it("prefers the narrowest context that has anything", () => {
    const contexts = getReminderContexts({ prayerMoment: "asr", dayMoments: ["friday"] });
    expect(select(contexts)?.context).toBe("asr");
  });

  it("puts Friday's response hour above the prayer window it sits inside", () => {
    const contexts = getReminderContexts({ prayerMoment: "asr", dayMoments: ["friday_after_asr", "friday"] });
    expect(contexts[0]).toBe("friday_after_asr");
    expect(select(contexts)?.context).toBe("friday_after_asr");
  });

  it("is stable for a day within a context", () => {
    const first = select(["before_sleep"]);
    expect(select(["before_sleep"])?.evidence.hadith).toBe(first?.evidence.hadith);
  });

  it("moves on with the day", () => {
    const today = selectLibraryEvidence(RELEVANT_NOW_LIBRARY, RELEVANT_NOW_VERSES, "2026-09-07", "en", [
      "before_sleep",
    ]);
    const later = selectLibraryEvidence(RELEVANT_NOW_LIBRARY, RELEVANT_NOW_VERSES, "2026-09-11", "en", [
      "before_sleep",
    ]);
    expect(today?.evidence.hadith).not.toBe(later?.evidence.hadith);
  });

  it("quotes the Qur'an in Arabic to an English reader, with the translation beneath", () => {
    /* A translation is a translation. The verse itself is what the card
       quotes, and the English sits in the supporting line. */
    const quranOnly = RELEVANT_NOW_LIBRARY.filter((source) => source.type === "quran");
    expect(quranOnly.length).toBeGreaterThan(0);
    const picked = select(["last_third"]);
    expect(picked).not.toBeNull();
    if (picked && RELEVANT_NOW_VERSES.some((verse) => verse.arabic === picked.evidence.hadith)) {
      expect(picked.evidence.hadithInArabic).toBe(true);
      expect(/[A-Za-z]/.test(picked.evidence.benefit)).toBe(true);
    }
  });

  it("reads a narration in English for an English reader", () => {
    const picked = select(["asr"]);
    expect(picked).not.toBeNull();
    if (picked && !picked.evidence.hadithInArabic) {
      expect(/[؀-ۿ]/.test(picked.evidence.hadith)).toBe(false);
    }
  });

  it("gives an Arabic reader Arabic throughout", () => {
    const picked = select(["asr"], "ar");
    expect(picked?.evidence.hadithInArabic).toBe(true);
    expect(/[؀-ۿ]/.test(picked!.evidence.benefit)).toBe(true);
  });
});

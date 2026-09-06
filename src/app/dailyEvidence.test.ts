import { describe, expect, it } from "vitest";
import { DAILY_EVIDENCE_CYCLE_DAYS, getDailyEvidence } from "./dailyEvidence";

describe("the daily narration", () => {
  it("draws on the reviewed corpus the app already ships", () => {
    // 146 azkar each carry a narration, a grading and a benefit. The card
    // surfaces those rather than introducing text that would need reviewing.
    expect(DAILY_EVIDENCE_CYCLE_DAYS).toBeGreaterThan(100);
  });

  it("shows the same narration on every device for a given day", () => {
    // Random selection would put a different hadith on a phone and a tablet on
    // the same day, and would need storage and sync to avoid it.
    const first = getDailyEvidence("2026-09-02", "ar");
    const second = getDailyEvidence("2026-09-02", "ar");
    expect(first?.zikrId).toBe(second?.zikrId);
  });

  it("moves on with the day", () => {
    const monday = getDailyEvidence("2026-09-01", "ar");
    const tuesday = getDailyEvidence("2026-09-02", "ar");
    expect(monday?.zikrId).not.toBe(tuesday?.zikrId);
  });

  it("walks the whole corpus rather than favouring a few", () => {
    const seen = new Set<string>();
    const start = new Date("2026-01-01T00:00:00Z");
    for (let day = 0; day < DAILY_EVIDENCE_CYCLE_DAYS; day += 1) {
      const date = new Date(start.getTime() + day * 86_400_000);
      seen.add(getDailyEvidence(date.toISOString().slice(0, 10), "ar")!.zikrId);
    }
    // A weak hash would cluster and revisit a handful while never reaching
    // most of them. Over one cycle it should touch the large majority.
    expect(seen.size).toBeGreaterThan(DAILY_EVIDENCE_CYCLE_DAYS * 0.55);
  });

  it("never offers a narration without its grading", () => {
    for (const dayKey of ["2026-09-02", "2026-03-11", "2027-01-30", "2026-12-25"]) {
      const evidence = getDailyEvidence(dayKey, "ar")!;
      expect(evidence.hadith.length).toBeGreaterThan(0);
      // The one place the app would be making a claim it could not support.
      expect(evidence.authenticity.length).toBeGreaterThan(0);
      expect(evidence.benefit.length).toBeGreaterThan(0);
    }
  });

  it("picks the same narration for both languages, and renders each in its own", () => {
    /* This asserted that `hadith` was identical in both languages, which was
       true only while the Arabic was all there was. What it was really
       protecting is that the choice of narration does not depend on the
       reader's language — that still holds, and is asserted. The rendering is
       now expected to differ, which is the point. */
    const arabic = getDailyEvidence("2026-09-02", "ar");
    const english = getDailyEvidence("2026-09-02", "en");
    expect(arabic?.zikrId).toBe(english?.zikrId);
    expect(arabic?.hadith).not.toBe(english?.hadith);
  });

  it("gives an Arabic reader an Arabic card, attribution included", () => {
    // The card previously showed an Arabic narration under an English grading
    // and, for most entries, an English benefit — the one screen where the
    // app's Arabic-first premise visibly broke.
    const arabicScript = /[؀-ۿ]/;
    for (const dayKey of ["2026-09-02", "2026-05-14", "2027-02-08", "2026-11-30", "2026-01-03"]) {
      const card = getDailyEvidence(dayKey, "ar")!;
      expect(arabicScript.test(card.hadith), dayKey).toBe(true);
      expect(arabicScript.test(card.authenticity), `${dayKey} grading`).toBe(true);
      expect(arabicScript.test(card.benefit), `${dayKey} benefit`).toBe(true);
    }
  });

  it("leaves the English card in English", () => {
    const card = getDailyEvidence("2026-09-02", "en")!;
    // The reviewed English stays the authority; only the reader's language
    // decides which rendering is shown.
    expect(/[؀-ۿ]/.test(card.authenticity)).toBe(false);
  });

  it("reads the narration itself in English, not only its grading", () => {
    /* This assertion is the one that was missing. The grading was checked and
       the narration was not, so `hadith` went on being the Arabic for an
       English reader long after every narration had a reviewed English
       rendering — under an English heading, on the app's first screen. */
    const arabicScript = /[؀-ۿ]/;
    for (const dayKey of ["2026-09-02", "2026-05-14", "2027-02-08", "2026-11-30", "2026-01-03"]) {
      const card = getDailyEvidence(dayKey, "en")!;
      expect(arabicScript.test(card.hadith), dayKey).toBe(false);
      expect(card.hadithInArabic, dayKey).toBe(false);
    }
  });

  it("still marks the text Arabic when it is Arabic", () => {
    // The flag describes what is rendered, so the card can set `lang` and `dir`
    // to match it rather than to match the interface.
    const card = getDailyEvidence("2026-09-02", "ar")!;
    expect(card.hadithInArabic).toBe(true);
  });
});

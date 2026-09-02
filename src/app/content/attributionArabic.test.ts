import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import {
  AUTHENTICITY_ARABIC,
  BENEFIT_ARABIC,
  SOURCE_REFERENCE_ARABIC,
  toArabicAttribution,
  toArabicBenefit,
} from "./attributionArabic";

const isArabic = (value: string) => /[\u0600-\u06FF]/.test(value);

describe("Arabic attributions", () => {
  it("covers every grading the content uses", () => {
    // Partial coverage is the failure that matters: it would leave an Arabic
    // reader with an Arabic narration under an English citation on some days
    // and not others, which reads as a bug rather than a gap.
    const uncovered = [...new Set(ALL_AZKAR.map((z) => z.authenticityNote).filter(Boolean))].filter(
      (note) => !AUTHENTICITY_ARABIC[note!],
    );
    expect(uncovered).toEqual([]);
  });

  it("covers every benefit that had no Arabic of its own", () => {
    const uncovered = ALL_AZKAR.filter((z) => z.benefit && !z.benefitArabic && !BENEFIT_ARABIC[z.benefit]).map(
      (z) => z.id,
    );
    expect(uncovered).toEqual([]);
  });

  it("renders in Arabic rather than echoing the English", () => {
    for (const [english, arabic] of Object.entries(AUTHENTICITY_ARABIC)) {
      expect(isArabic(arabic), `not Arabic: ${english}`).toBe(true);
    }
    for (const [english, arabic] of Object.entries(BENEFIT_ARABIC)) {
      expect(isArabic(arabic), `not Arabic: ${english}`).toBe(true);
    }
  });

  it("keeps the grading vocabulary technical", () => {
    // A grading is the one thing a translation must not soften or strengthen.
    // Sahih stays صحيح and Hasan stays حسن; neither may become the other.
    expect(AUTHENTICITY_ARABIC["Sahih al-Bukhari and Sahih Muslim."]).toBe("صحيح البخاري وصحيح مسلم.");
    expect(AUTHENTICITY_ARABIC["Sahih Muslim."]).toBe("صحيح مسلم.");
    expect(AUTHENTICITY_ARABIC["Hasan by al-Albani."]).toContain("حسّن");
    expect(AUTHENTICITY_ARABIC["Graded Sahih by al-Albani."]).toContain("صحح");
  });

  it("preserves a disagreement between graders rather than picking a side", () => {
    // One entry records that al-Albani graded it Sahih and Darussalam Da'if.
    // Dropping either half would turn a disputed grading into a settled one.
    const disputed = AUTHENTICITY_ARABIC["Graded Sahih by al-Albani and Da‘if by Darussalam (Jami‘ at-Tirmidhi 2892)."];
    expect(disputed).toContain("صحح");
    expect(disputed).toContain("ضعّف");
  });

  it("falls back to the reviewed English rather than showing nothing", () => {
    expect(toArabicAttribution("Some note never seen before.")).toBe("Some note never seen before.");
    expect(toArabicBenefit(undefined)).toBeUndefined();
  });

  it("covers every source reference the content cites", () => {
    const uncovered = ALL_AZKAR.filter(
      (z) => z.sourceReference && !z.sourceReferenceArabic && !SOURCE_REFERENCE_ARABIC[z.sourceReference],
    ).map((z) => z.id);
    expect(uncovered).toEqual([]);
  });

  it("leaves no half-translated citation", () => {
    // A citation with an English book name beside Arabic digits is worse than
    // an English one: it reads as breakage rather than as a citation.
    for (const [english, arabic] of Object.entries(SOURCE_REFERENCE_ARABIC)) {
      // A book name is two letters or more; Sunnah.com's sub-reference is a
      // single letter glued to a number (75a) and is part of the identifier.
      const latinWords = arabic.match(/[A-Za-z]{2,}/g) ?? [];
      expect(latinWords, `English survives in: ${english} -> ${arabic}`).toEqual([]);
    }
  });

  it("keeps every digit of a locator, transformed not retyped", () => {
    const western = "0123456789";
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
    for (const [english, arabic] of Object.entries(SOURCE_REFERENCE_ARABIC)) {
      const from = [...english].filter((c) => western.includes(c)).map((c) => arabicIndic[western.indexOf(c)]);
      const to = [...arabic].filter((c) => arabicIndic.includes(c));
      // Same digits, same order. A wrong number sends a reader to the wrong
      // hadith, which is the one error worth guarding mechanically.
      expect(to.join(""), english).toBe(from.join(""));
    }
  });
});

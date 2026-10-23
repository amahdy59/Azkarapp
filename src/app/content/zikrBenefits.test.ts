import { describe, expect, it } from "vitest";
import readings from "./benefitsHadithReadings.json";
import homeReadings from "./homeReminderReadings.json";
import review from "../../../docs/agent/evidence/benefits-full-hadith-2026-10-18.json";
import { DERIVED_ZIKR_BENEFITS, HADITH_DHIKR_EVIDENCE, QURAN_DHIKR_EVIDENCE, getBenefitEvidence } from "./zikrBenefits";

describe("reviewed zikr benefits catalogue", () => {
  it("supplies complete bilingual narration text for every hadith without abbreviated placeholders", () => {
    expect(Object.keys(readings).sort()).toEqual(HADITH_DHIKR_EVIDENCE.map((item) => item.id).sort());
    for (const item of HADITH_DHIKR_EVIDENCE) {
      expect(item.text, item.id).toEqual(readings[item.id as keyof typeof readings]);
      for (const language of ["ar", "en"] as const) {
        expect(item.text[language], item.id).not.toMatch(/…|\.\.\./);
        expect(item.title[language], item.id).not.toMatch(/…|\.\.\./);
      }
    }
  });

  it("preserves the existing source-compared complete readings and selected matn boundaries", () => {
    for (const entry of review.reused) {
      const original = homeReadings[entry.readingKey as keyof typeof homeReadings];
      const displayed = readings[entry.id as keyof typeof readings];
      if (!("arabic" in original) || !("english" in original)) throw new Error(entry.id);
      expect(displayed.ar, entry.id).toBe(original.arabic.split("\n")[0]);
      expect(displayed.en, entry.id).toBe(original.english);
    }
    for (const entry of review.compared) {
      expect(readings[entry.id as keyof typeof readings].ar, entry.id).toBe(entry.arabicMatn);
      expect(entry.sourceUrl).toMatch(/^https:\/\/sunnah.com\//);
    }
  });

  it("includes the context and concluding instruction in the screenshot's Fatimah narration", () => {
    expect(readings["h-fatima"].ar).toContain("اشْتَكَتْ مَا تَلْقَى مِنَ الرَّحَى");
    expect(readings["h-fatima"].ar).toContain("فَإِنَّ ذَلِكَ خَيْرٌ لَكُمَا");
    expect(readings["h-fatima"].en).toContain("thirty-four");
    expect(readings["h-kursi"].en).toContain("That was a devil");
    expect(readings["h-bismillah"].en).toContain("forgot to say it");
  });
  it("contains only the approved Qur'an and hadith evidence groups", () => {
    expect(QURAN_DHIKR_EVIDENCE).toHaveLength(7);
    expect(HADITH_DHIKR_EVIDENCE).toHaveLength(21);
    expect(QURAN_DHIKR_EVIDENCE.every((item) => item.kind === "quran")).toBe(true);
    expect(HADITH_DHIKR_EVIDENCE.every((item) => item.kind === "hadith")).toBe(true);
    expect(QURAN_DHIKR_EVIDENCE.every((item) => item.sourceUrl.startsWith("https://quran.com/"))).toBe(true);
    expect(HADITH_DHIKR_EVIDENCE.every((item) => item.sourceUrl.startsWith("https://dorar.net/"))).toBe(true);
  });

  it("keeps all 30 derived benefits traceable to a hadith record", () => {
    expect(DERIVED_ZIKR_BENEFITS).toHaveLength(30);
    expect(new Set(DERIVED_ZIKR_BENEFITS.map((item) => item.id)).size).toBe(30);
    for (const item of DERIVED_ZIKR_BENEFITS) {
      const evidence = getBenefitEvidence(item.evidenceId);
      expect(evidence, item.id).toBeDefined();
      expect(evidence?.kind, item.id).toBe("hadith");
      expect(item.zikr.ar.trim(), item.id).not.toBe("");
      expect(item.zikr.en.trim(), item.id).not.toBe("");
      expect(item.benefit.ar.trim(), item.id).not.toBe("");
      expect(item.benefit.en.trim(), item.id).not.toBe("");
    }
  });

  it("does not reintroduce the removed generic editorial benefit cards", () => {
    const catalogue = JSON.stringify({ QURAN_DHIKR_EVIDENCE, HADITH_DHIKR_EVIDENCE, DERIVED_ZIKR_BENEFITS });
    expect(catalogue).not.toContain("Evening testimony of faith");
    expect(catalogue).not.toContain("It is said in the evening");
  });
});

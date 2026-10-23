import { describe, expect, it } from "vitest";
import { AUTHENTICATED_REMINDER_LIBRARY } from "./authenticatedReminders";
import { COMPREHENSIVE_DUAS } from "./comprehensiveDuas";
import { RELEVANT_NOW_LIBRARY } from "./relevantNowLibrary";
import { RELEVANT_NOW_VERSES } from "./relevantNowVerses";
import { selectLibraryEvidence } from "../dailyEvidence";

describe("authenticated reminder extension", () => {
  it("adds thirty individually sourced records without replacing the forty-one original sources", () => {
    expect(RELEVANT_NOW_LIBRARY).toHaveLength(41);
    expect(AUTHENTICATED_REMINDER_LIBRARY).toHaveLength(30);
    const combined = [...RELEVANT_NOW_LIBRARY, ...AUTHENTICATED_REMINDER_LIBRARY];
    expect(new Set(combined.map((source) => source.id)).size).toBe(71);
    for (const source of AUTHENTICATED_REMINDER_LIBRARY) {
      expect(source.sourceUrl).toBe(`https://sunnah.com/${source.evidenceId}`);
      expect(source.evidenceId).toMatch(/^(bukhari|muslim|tirmidhi):\d+[a-z]?$/);
      expect(source.arabic).toMatch(/[\u0600-\u06ff]/);
      expect(source.english).toBeTruthy();
      expect(source.referenceArabic).toBeTruthy();
      expect(source.authenticityArabic).toBeTruthy();
      expect(source.attribution).toBeTruthy();
      expect(source).not.toHaveProperty("repetitionCount");
      if (source.evidenceId?.startsWith("tirmidhi:")) {
        expect(source.evidenceId).toBe("tirmidhi:747");
        expect(source.authenticityArabic).toContain("الترمذي");
        expect(source.authenticity).toContain("Hasan");
        expect(source.authenticity).not.toBe("Sahih");
      } else expect(source.authenticity).toBe("Sahih");
    }
  });

  it("reuses the four canonical duas byte for byte, with their existing English meanings", () => {
    const linked = AUTHENTICATED_REMINDER_LIBRARY.filter((source) => source.textZikrId);
    expect(linked).toHaveLength(4);
    for (const source of linked) {
      const canonical = COMPREHENSIVE_DUAS.find((dua) => dua.id === source.textZikrId)!;
      expect(source.arabic).toBe(canonical.arabicText);
      expect(source.english).toBe(canonical.translation);
      expect(source.excerpt).toBe(false);
    }
  });

  it("preserves the selected fasting wording and identifies Aisha's narration as an action", () => {
    const fasting = AUTHENTICATED_REMINDER_LIBRARY.find((source) => source.id === "N20")!;
    expect(fasting.arabic).toBe(
      "تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ",
    );
    expect(fasting.contexts).toEqual(["fasting_tomorrow"]);
    expect(AUTHENTICATED_REMINDER_LIBRARY.find((source) => source.id === "N13")?.attribution).toBe("reported_action");
  });

  it("rotates through a topic without repetition and permits refresh beyond a one-item occasion", () => {
    const pool = AUTHENTICATED_REMINDER_LIBRARY.filter((source) => source.contexts.includes("character"));
    const seen = new Set<string>();
    for (let index = 0; index < pool.length; index++) {
      const picked = selectLibraryEvidence(pool, [], `2026-10-14-s30-24-plan-${index}`, "ar", ["character"]);
      seen.add(picked!.evidence.evidenceId!);
      expect(picked?.evidence.sourceUrl).toMatch(/^https:\/\/sunnah.com\//);
    }
    expect(seen.size).toBe(pool.length);
    const library = [...RELEVANT_NOW_LIBRARY, ...AUTHENTICATED_REMINDER_LIBRARY];
    const first = selectLibraryEvidence(library, RELEVANT_NOW_VERSES, "2026-10-14", "en", [
      "fasting_tomorrow",
      "general",
    ]);
    const next = selectLibraryEvidence(
      library,
      RELEVANT_NOW_VERSES,
      "2026-10-14",
      "en",
      ["fasting_tomorrow", "general"],
      1,
    );
    expect(first?.evidence.authenticity).toContain("Hasan");
    expect(next?.evidence.hadith).not.toBe(first?.evidence.hadith);
    expect(first?.evidence.excerpt).toBe(false);
  });
});

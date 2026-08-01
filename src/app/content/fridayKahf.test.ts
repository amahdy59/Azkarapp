import { describe, expect, it } from "vitest";
import { FRIDAY_KAHF } from "./fridayKahf";

describe("Surah Al-Kahf content", () => {
  it("contains all 110 ordered ayahs with bilingual source metadata", () => {
    expect(FRIDAY_KAHF).toHaveLength(110);
    expect(new Set(FRIDAY_KAHF.map((ayah) => ayah.id)).size).toBe(110);

    for (const [index, ayah] of FRIDAY_KAHF.entries()) {
      expect(ayah.orderIndex).toBe(index);
      expect(ayah.arabicText.trim()).not.toBe("");
      expect(ayah.translation.trim()).not.toBe("");
      expect(ayah.sourceReference).toBe(`Qur'an 18:${index + 1}.`);
      expect(ayah.sourceReferenceArabic).toMatch(/[\u0600-\u06ff]/);
    }

    expect(FRIDAY_KAHF[0]?.arabicText).toContain("بِسْمِ اللَّهِ");
    expect(FRIDAY_KAHF[109]?.arabicText).toContain("﴿١١٠﴾");
  });
});

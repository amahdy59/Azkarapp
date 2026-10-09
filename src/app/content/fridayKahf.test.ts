import { describe, expect, it } from "vitest";
import { FRIDAY_KAHF } from "./fridayKahf";

describe("Surah Al-Kahf content", () => {
  it("contains all 110 numbered ayahs as one countable surah", () => {
    expect(FRIDAY_KAHF).toHaveLength(1);

    const surah = FRIDAY_KAHF[0]!;
    expect(surah.id).toBe("friday-kahf");
    expect(surah.isSurah).toBe(true);
    expect(surah.verseCount).toBe(110);
    expect(surah.repetitionCount).toBe(1);
    expect(surah.arabicText).toContain("﴿١﴾");
    expect(surah.arabicText).toContain("﴿١١٠﴾");
    expect(surah.sourceReference).toContain("Qur'an 18:1-110.");
    expect(surah.sourceReferenceArabic).toMatch(/[\u0600-\u06ff]/);
  });

  it("keeps both virtues and identifies the Friday-light report's named grading", () => {
    const surah = FRIDAY_KAHF[0]!;
    expect(surah.hadithText).toContain("عُصِمَ مِنَ الدَّجَّالِ");
    expect(surah.hadithText).toContain("مَا بَيْنَ الْجُمْعَتَيْنِ");
    expect(surah.hadithTextEnglish).toContain("following Friday");
    expect(surah.sourceReference).toContain("Sahih Muslim 809");
    expect(surah.sourceReference).toContain("Mishkat al-Masabih 2175 — Hasan (Al-Albani)");
  });
});

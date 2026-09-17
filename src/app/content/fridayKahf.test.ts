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
    expect(surah.sourceReference).toBe("Qur'an 18:1-110.");
    expect(surah.sourceReferenceArabic).toMatch(/[\u0600-\u06ff]/);
  });
});

import { describe, expect, it } from "vitest";
import { benefitEvidenceCitation } from "./benefitEvidencePresentation";
import { getCompletionReflection } from "./completionReflection";
import { HADITH_DHIKR_EVIDENCE, QURAN_DHIKR_EVIDENCE } from "./content/zikrBenefits";

describe("Completion evidence", () => {
  it("rotates whole, source-bearing reviewed records without making copies or rewriting religious text", () => {
    const records = [0, 1000, 2000, 3000].map(getCompletionReflection);
    expect(records.map((item) => item.id)).toEqual(["h-two-phrases", "quran-13-28", "h-four-phrases", "quran-2-152"]);
    for (const [index, record] of records.entries()) {
      expect([...HADITH_DHIKR_EVIDENCE, ...QURAN_DHIKR_EVIDENCE]).toContain(record);
      expect(record.sourceUrl).toMatch(/^https:\/\//);
      expect(getCompletionReflection(index * 1000 + 4000)).toBe(record);
    }
    expect(getCompletionReflection(Number.NaN)).toBe(records[0]);
    expect(getCompletionReflection(-1000)).toBe(records[1]);
  });

  it("keeps bilingual Quran and hadith citations consistent with the Benefits index", () => {
    expect(benefitEvidenceCitation(getCompletionReflection(1000), "ar")).toBe("سورة الرعد · ١٣:٢٨");
    expect(benefitEvidenceCitation(getCompletionReflection(1000), "en")).toBe("Surah Ar-Ra'd · 13:28");
    expect(benefitEvidenceCitation(getCompletionReflection(0), "ar")).toBe(getCompletionReflection(0).source.ar);
    expect(benefitEvidenceCitation({ ...getCompletionReflection(1000), id: "quran-999-1" }, "en")).toBe(
      getCompletionReflection(1000).source.en,
    );
  });
});

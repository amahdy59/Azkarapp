import { describe, expect, it } from "vitest";
import { DERIVED_ZIKR_BENEFITS, HADITH_DHIKR_EVIDENCE, QURAN_DHIKR_EVIDENCE, getBenefitEvidence } from "./zikrBenefits";

describe("reviewed zikr benefits catalogue", () => {
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

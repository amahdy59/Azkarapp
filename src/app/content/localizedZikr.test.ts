import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import {
  getLocalizedPreferredTiming,
  getLocalizedSourceReference,
  getLocalizedZikrBenefit,
  hasSpecificRecommendedTiming,
} from "./localizedZikr";

describe("localized zikr supporting content", () => {
  it("provides Arabic-only benefit and citation text for every zikr", () => {
    for (const zikr of ALL_AZKAR) {
      const benefit = getLocalizedZikrBenefit(zikr, "ar");
      const source = getLocalizedSourceReference(zikr, "ar");

      expect(benefit).toMatch(/[\u0600-\u06ff]/);
      expect(source).toMatch(/[\u0600-\u06ff]/);
      expect(benefit).not.toMatch(/[A-Za-z]/);
      expect(source).not.toMatch(/[A-Za-z]/);
      expect(benefit).not.toBe("وردت فائدة هذا الذكر في المصدر المذكور أدناه.");
    }
  });

  it("keeps the reviewed English content unchanged", () => {
    for (const zikr of ALL_AZKAR) {
      expect(getLocalizedZikrBenefit(zikr, "en")).toBe(zikr.benefit);
      expect(getLocalizedSourceReference(zikr, "en")).toBe(zikr.sourceReference);
    }
  });

  it("identifies specific recommended timing versus generic category default timing", () => {
    const genericZikr = ALL_AZKAR.find((z) => z.id === "m-hm-75a")!;
    const specificZikr = ALL_AZKAR.find((z) => z.id === "m-hm-92")!;

    expect(hasSpecificRecommendedTiming(genericZikr)).toBe(false);
    expect(hasSpecificRecommendedTiming(specificZikr)).toBe(true);
    expect(getLocalizedPreferredTiming(specificZikr, "ar")).toBe(
      "تُقال ١٠ مرات بعد صلاة الفجر و١٠ مرات بعد صلاة المغرب.",
    );
  });
});

import { expect, it } from "vitest";
import { WIRD_EVIDENCE_BY_SECTION, WIRD_SECTION_ORDER } from "../content/wirdBenefits";
import { wirdEvidenceToShareItem } from "./wirdEvidenceSharing";
import { getShareSections, getShareItemRepetitionLabel, getShareText } from "./shareLayout";
import { t } from "../i18n";

for (const section of WIRD_SECTION_ORDER) {
  it.each(["ar", "en"] as const)(`preserves ${section} evidence text, attribution and direction in %s`, (language) => {
    for (const item of WIRD_EVIDENCE_BY_SECTION[section]) {
      const before = JSON.stringify(item);
      const shared = wirdEvidenceToShareItem(item, language);
      expect(shared.arabicText).toBe(item.kind === "quran" ? item.text.ar : item.text[language]);
      expect(shared.sourceReference).toContain(item.source[language]);
      if (item.attribution) expect(shared.sourceReference).toContain(item.attribution[language]);
      expect(shared.title).toBe(item.title[language]);
      expect(getShareItemRepetitionLabel(shared, language)).toBe("");
      if (item.kind === "quran")
        expect(getShareText([shared], language, {}, "Evidence")).not.toContain(t(language, "shareStudio.repeatOnce"));
      const sections = getShareSections(shared, { meaning: true });
      expect(sections[0].direction).toBe(item.kind === "quran" || language === "ar" ? "rtl" : "ltr");
      if (item.kind === "quran") {
        expect(shared.quranText).toBe(true);
        expect(sections.find((entry) => entry.key === "translation")?.text).toBe(item.text.en);
      }
      expect(shared.transliteration).toBeUndefined();
      expect(shared.wordMeanings).toBeUndefined();
      expect(JSON.stringify(item)).toBe(before);
    }
  });
}

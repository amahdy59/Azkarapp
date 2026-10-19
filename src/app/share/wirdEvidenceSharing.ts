import type { WirdEvidence } from "../content/wirdBenefits";
import { localizeBenefitText } from "../content/zikrBenefits";
import type { AppLanguage } from "../types";
import type { ShareItem } from "./shareLayout";

/** Presentation adapter only: preserve the existing quotation and attribution verbatim. */
export function wirdEvidenceToShareItem(item: WirdEvidence, language: AppLanguage): ShareItem {
  const isQuran = item.kind === "quran";
  return {
    id: item.id,
    canonicalKey: isQuran ? item.id : undefined,
    arabicText: isQuran ? item.text.ar : localizeBenefitText(item.text, language),
    textDirection: isQuran || language === "ar" ? "rtl" : "ltr",
    quranText: isQuran,
    hideRepetition: true,
    title: localizeBenefitText(item.title, language),
    translation: isQuran || language === "ar" ? item.text.en : undefined,
    sourceReference: [
      item.attribution ? localizeBenefitText(item.attribution, language) : "",
      localizeBenefitText(item.source, language),
    ]
      .filter(Boolean)
      .join(" · "),
    language,
  };
}

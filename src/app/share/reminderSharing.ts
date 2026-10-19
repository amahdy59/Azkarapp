import type { DailyEvidence } from "../dailyEvidence";
import { reminderText } from "../i18n/reminderReadings";
import type { AppLanguage } from "../types";
import type { ShareItem } from "./shareLayout";

/** Display attribution without rewriting the reviewed quotation or mislabelling reports. */
export function reminderAttribution(evidence: DailyEvidence): string | undefined {
  if (evidence.isQuran || evidence.companionReport || evidence.reportedAction) return undefined;
  const text = `${evidence.narrator ?? ""} ${evidence.hadith}`.normalize("NFD").replace(/\p{M}/gu, "");
  if (/رسول الله|النبي|نبي الله|Prophet|Messenger of Allah/iu.test(text)) return undefined;
  return reminderText(evidence.hadithInArabic ? "ar" : "en", "home.prophetSaid");
}

export function reminderToShareItem(evidence: DailyEvidence, language: AppLanguage): ShareItem {
  return {
    id: evidence.evidenceId ?? evidence.zikrId ?? evidence.canonicalKey ?? "home-reminder",
    canonicalKey: evidence.canonicalKey,
    arabicText: [evidence.narrator, reminderAttribution(evidence), evidence.hadith].filter(Boolean).join("\n"),
    textDirection: evidence.hadithInArabic ? "rtl" : "ltr",
    quranText: evidence.isQuran,
    hideRepetition: true,
    title: evidence.title,
    translation: evidence.translation,
    benefit: evidence.meaning ?? evidence.benefit,
    sourceReference:
      evidence.sourceReference && !evidence.authenticity.includes(evidence.sourceReference)
        ? `${evidence.authenticity} · ${evidence.sourceReference}`
        : evidence.authenticity,
    readingUrl: evidence.sourceUrl,
    language,
  };
}

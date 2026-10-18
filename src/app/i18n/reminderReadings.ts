import type { AppLanguage } from "../types";
import { translateDictionary } from "./index";

const en = {
  home: {
    dailyEvidence: "Relevant now",
    nextDailyEvidence: "Show another reminder",
    hadithExcerpt: "Hadith excerpt; see the source for its full context",
    reportedPropheticAction: "From the Prophet’s ﷺ practice, reported by Aisha",
    viewEvidenceSource: "Source and context",
    expandEvidence: "Read the full text",
    collapseEvidence: "Collapse text",
    evidenceMeaning: "Meaning in brief",
    evidenceTakeaway: "In your day",
    evidenceTranslation: "Translation of meaning",
    meaningHadeethEnc: "Summarized from HadeethEnc",
    meaningDorar: "Summarized from Dorar",
    companionReport: "Report from a Companion",
    meaningFromSource: "Summary of the text · source",
  },
};
const ar: typeof en = {
  home: {
    dailyEvidence: "تذكير لك الآن",
    nextDailyEvidence: "عرض تذكير آخر",
    hadithExcerpt: "جزء من حديث؛ النص الكامل في المصدر",
    reportedPropheticAction: "من هدي النبي ﷺ؛ رواية عن عائشة رضي الله عنها",
    viewEvidenceSource: "المصدر والسياق",
    expandEvidence: "قراءة النص كاملًا",
    collapseEvidence: "طيّ النص",
    evidenceMeaning: "المعنى باختصار",
    evidenceTakeaway: "في حياتك اليوم",
    evidenceTranslation: "ترجمة المعنى",
    meaningHadeethEnc: "خلاصة بتصرف عن موسوعة الأحاديث النبوية",
    meaningDorar: "خلاصة من شرح الدرر السنية",
    companionReport: "أثر عن صحابي",
    meaningFromSource: "خلاصة لمعنى النص · المصدر",
  },
};

type ReminderTextKey = `home.${keyof typeof en.home}`;
export function reminderText(language: AppLanguage, key: ReminderTextKey) {
  return translateDictionary(language === "ar" ? ar : en, key);
}

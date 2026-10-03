import type { AppLanguage, Zikr } from "../types";
import { buildQuranTextSegments, getQuranWordMeanings, QURAN_WORD_MEANING_SOURCE } from "../content/quranWordMeanings";

export interface ShareWordMeaning {
  word: string;
  meaning: string;
  source: string;
}

/** No summary generation: quotation boundaries and glossary wording come from reviewed records. */
export function getSharingBenefitExcerpt(zikr: Zikr, language: AppLanguage): string | undefined {
  const excerpt = language === "ar" ? zikr.sharingBenefitExcerptArabic : zikr.sharingBenefitExcerptEnglish;
  const narration = language === "ar" ? zikr.hadithText : zikr.hadithTextEnglish;
  return excerpt?.trim() && narration?.includes(excerpt) ? excerpt : undefined;
}

export function getSharingWordMeanings(zikr: Zikr, language: AppLanguage): ShareWordMeaning[] {
  const supplied = (zikr.sharingWordMeanings ?? []).flatMap((entry) => {
    const meaning = language === "ar" ? entry.meaningArabic : entry.meaningEnglish;
    const source = language === "ar" ? (entry.sourceReferenceArabic ?? entry.sourceReference) : entry.sourceReference;
    return meaning?.trim() && source.trim() ? [{ word: entry.word, meaning, source }] : [];
  });
  if (supplied.length) return supplied;
  // The existing Quran glossary is reviewed Arabic copy. Do not invent English translations.
  if (language !== "ar") return [];
  const matched = buildQuranTextSegments(zikr.arabicText, getQuranWordMeanings(zikr)).flatMap(
    (segment) => segment.meanings ?? [],
  );
  return Array.from(new Map(matched.map((entry) => [entry.id, entry])).values()).map((entry) => ({
    word: entry.word,
    meaning: entry.explanationArabic,
    source: QURAN_WORD_MEANING_SOURCE.nameArabic,
  }));
}

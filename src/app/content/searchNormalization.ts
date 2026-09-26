/**
 * Search-key normalization.
 *
 * Every zikr in the corpus is fully vocalized (`بِاسْمِكَ اللَّهُمَّ`), but nobody
 * types diacritics into a search box. A raw substring match therefore fails on
 * the app's primary use case: searching Arabic in an Arabic-first app.
 *
 * These helpers build a comparison key only. They are never applied to text
 * that gets rendered — displayed content keeps its diacritics and spelling
 * exactly as authored.
 */

/** Tashkeel, superscript alef, and tatweel — all invisible to a typist. */
const ARABIC_DIACRITICS = /[ً-ْٰـ]/g;

/**
 * Orthographic variants a typist uses interchangeably. Deliberately conservative:
 * only folds letters whose difference is routinely dropped when typing, so
 * distinct words are not collapsed into each other.
 */
const LETTER_FOLDING: ReadonlyArray<readonly [RegExp, string]> = [
  [/[أإآٱ]/g, "ا"], // أ إ آ ٱ → ا
  [/ى/g, "ي"], // ى → ي
  [/ة/g, "ه"], // ة → ه
  [/ؤ/g, "و"], // ؤ → و
  [/ئ/g, "ي"], // ئ → ي
];

/**
 * Returns a comparison key for `value`: diacritics stripped, common Arabic
 * letter variants folded, Latin text lowercased, and whitespace collapsed.
 */
export function normalizeSearchText(value: string): string {
  let out = value.normalize("NFC").replace(ARABIC_DIACRITICS, "");
  for (const [pattern, replacement] of LETTER_FOLDING) {
    out = out.replace(pattern, replacement);
  }
  return out.toLowerCase().replace(/\s+/g, " ").trim();
}

/** True when `haystack` contains `needle`, comparing normalized keys. */
export function matchesSearch(haystack: string, normalizedNeedle: string): boolean {
  if (!normalizedNeedle) return false;
  return normalizeSearchText(haystack).includes(normalizedNeedle);
}

export type SearchableZikrFields = {
  id: string;
  arabicText: string;
  translation: string;
  transliteration: string;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  sourceReference?: string;
  benefit?: string;
  benefitArabic?: string;
};

const searchKeyCache = new Map<string, string>();

/**
 * Normalized haystack per zikr, built once and reused across keystrokes and screens.
 */
export function searchKeyFor(zikr: SearchableZikrFields, extraLabel = ""): string {
  const cached = searchKeyCache.get(zikr.id);
  if (cached !== undefined) return cached;
  const key = normalizeSearchText(
    [
      zikr.arabicText,
      zikr.translation,
      zikr.transliteration,
      zikr.surahNameArabic ?? "",
      zikr.surahNameEnglish ?? "",
      zikr.sourceReference ?? "",
      zikr.benefit ?? "",
      zikr.benefitArabic ?? "",
      extraLabel,
    ].join(" | "),
  );
  searchKeyCache.set(zikr.id, key);
  return key;
}

/**
 * Splits `text` into merged runs of matched and unmatched whole-word tokens.
 * Highlighting whole words rather than mid-word character slices preserves
 * Arabic cursive shaping and vocalized harakat placement in every engine.
 */
export function splitHighlightedSearchTokens(text: string, query: string): Array<{ text: string; matched: boolean }> {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [{ text, matched: false }];

  const queryTerms = normalizedQuery.split(" ").filter((term) => term.length >= 2);
  if (queryTerms.length === 0) return [{ text, matched: false }];

  const parts = text.split(/(\s+)/);
  const runs: Array<{ text: string; matched: boolean }> = [];

  for (const part of parts) {
    if (!part) continue;
    const isWhitespace = /^\s+$/.test(part);
    const normalizedPart = isWhitespace ? "" : normalizeSearchText(part);
    const matched = !isWhitespace && queryTerms.some((term) => normalizedPart.includes(term));

    const prev = runs[runs.length - 1];
    if (prev && prev.matched === matched) {
      prev.text += part;
    } else {
      runs.push({ text: part, matched });
    }
  }

  return runs.length > 0 ? runs : [{ text, matched: false }];
}

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

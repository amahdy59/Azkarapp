// eslint-disable-next-line no-misleading-character-class -- These Unicode ranges intentionally target combining Arabic marks.
const ARABIC_FORMATTING_MARKS = /[\u0610-\u061A\u0640\u064B-\u065F\u0670\u06D6-\u06ED\uFD3E\uFD3F]/g;
const VERSE_NUMERALS = /[\u0660-\u0669\u06F0-\u06F9]/g;
const PUNCTUATION_AND_SYMBOLS = /[\p{P}\p{S}]/gu;

/** Removes formatting distinctions only; Arabic letters and words are never substituted. */
export function normalizeArabicForAudioMatching(text: string): string {
  return text
    .normalize("NFKC")
    .replace(ARABIC_FORMATTING_MARKS, "")
    .replace(VERSE_NUMERALS, " ")
    .replace(PUNCTUATION_AND_SYMBOLS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Stable non-cryptographic content fingerprint; recording files use a separate SHA-256 checksum. */
export function createArabicTextFingerprint(text: string): string {
  const normalized = normalizeArabicForAudioMatching(text);
  let hash = 0xcbf29ce484222325n;
  for (const character of normalized) {
    hash ^= BigInt(character.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `arabic-v1-${hash.toString(16).padStart(16, "0")}`;
}

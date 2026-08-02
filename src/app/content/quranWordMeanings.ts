import wordMeaningData from "./quranWordMeanings.data.json";
import type { Zikr } from "../types";

type WordMeaningData = Record<string, Record<string, Record<string, string>>>;

export const QURAN_WORD_MEANING_SOURCE = {
  nameArabic: "الميسر في غريب القرآن — مجمع الملك فهد لطباعة المصحف الشريف",
  nameEnglish: "Muyassar of Ghareeb Al-Qur'an — King Fahd Glorious Qur'an Printing Complex",
  url: "https://qurancomplex.gov.sa/en/techquran/dev/",
} as const;

export interface QuranWordMeaning {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  word: string;
  explanationArabic: string;
}

export interface QuranTextSegment {
  text: string;
  meanings?: QuranWordMeaning[];
}

interface NormalizedText {
  value: string;
  starts: number[];
  ends: number[];
}

const MEANINGS = wordMeaningData as WordMeaningData;
const VERSE_MARKER = /﴿([٠-٩۰-۹0-9]+)﴾/gu;
const COMBINING_MARK = /\p{Mark}/u;
const LETTER_OR_NUMBER = /[\p{Letter}\p{Number}]/u;

function parseLocalizedNumber(value: string) {
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";
  const latin = Array.from(value, (digit) => {
    const arabicIndex = arabicIndic.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);
    const easternIndex = easternArabic.indexOf(digit);
    return easternIndex >= 0 ? String(easternIndex) : digit;
  }).join("");
  return Number(latin);
}

function normalizeLetter(value: string) {
  if (value === "ٱ") return "ا";
  if (value === "ى") return "ي";
  return value;
}

function normalizeArabic(value: string, sourceOffset = 0): NormalizedText {
  let normalized = "";
  const starts: number[] = [];
  const ends: number[] = [];

  for (let sourceIndex = 0; sourceIndex < value.length;) {
    const codePoint = value.codePointAt(sourceIndex);
    if (codePoint === undefined) break;
    const sourceCharacter = String.fromCodePoint(codePoint);
    const sourceEnd = sourceIndex + sourceCharacter.length;

    for (const decomposedCharacter of sourceCharacter.normalize("NFKD")) {
      if (COMBINING_MARK.test(decomposedCharacter) || decomposedCharacter === "ـ" || decomposedCharacter === "ء") {
        continue;
      }
      if (!LETTER_OR_NUMBER.test(decomposedCharacter)) {
        continue;
      }

      const character = normalizeLetter(decomposedCharacter);
      normalized += character;
      starts.push(sourceOffset + sourceIndex);
      ends.push(sourceOffset + sourceEnd);
    }

    sourceIndex = sourceEnd;
  }

  return { value: normalized.trimEnd(), starts, ends };
}

function getAyahRanges(text: string) {
  const ranges = new Map<number, { start: number; end: number }>();
  let ayahStart = 0;
  VERSE_MARKER.lastIndex = 0;

  for (const match of text.matchAll(VERSE_MARKER)) {
    const markerIndex = match.index;
    const ayahNumber = parseLocalizedNumber(match[1] ?? "");
    if (Number.isInteger(ayahNumber) && markerIndex !== undefined) {
      ranges.set(ayahNumber, { start: ayahStart, end: markerIndex });
      ayahStart = markerIndex + match[0].length;
    }
  }

  return ranges;
}

export function getQuranSurahNumber(zikr: Pick<Zikr, "canonicalKey" | "isSurah">) {
  const match = /^quran-(\d{3})(?:-|$)/.exec(zikr.canonicalKey);
  return match ? Number(match[1]) : null;
}

export function getQuranWordMeanings(zikr: Pick<Zikr, "canonicalKey" | "isSurah">) {
  const surahNumber = getQuranSurahNumber(zikr);
  if (!surahNumber) return [];
  const chapter = MEANINGS[String(surahNumber)];
  if (!chapter) return [];

  return Object.entries(chapter)
    .sort(([left], [right]) => Number(left) - Number(right))
    .flatMap(([ayah, meanings]) =>
      Object.entries(meanings).map(([word, explanationArabic], index) => ({
        id: `${surahNumber}:${ayah}:${index}`,
        surahNumber,
        ayahNumber: Number(ayah),
        word,
        explanationArabic,
      })),
    );
}

export function buildQuranTextSegments(text: string, meanings: readonly QuranWordMeaning[]): QuranTextSegment[] {
  if (meanings.length === 0) return [{ text }];

  const ayahRanges = getAyahRanges(text);
  const meaningsByAyah = new Map<number, QuranWordMeaning[]>();
  for (const meaning of meanings) {
    const existing = meaningsByAyah.get(meaning.ayahNumber) ?? [];
    existing.push(meaning);
    meaningsByAyah.set(meaning.ayahNumber, existing);
  }
  const matches: Array<{ start: number; end: number; meaning: QuranWordMeaning }> = [];

  for (const [ayahNumber, ayahMeanings] of meaningsByAyah) {
    const range = ayahRanges.get(ayahNumber);
    if (!range) continue;
    const normalizedAyah = normalizeArabic(text.slice(range.start, range.end), range.start);
    let cursor = 0;

    for (const meaning of ayahMeanings) {
      const phrase = normalizeArabic(meaning.word).value;
      if (!phrase) continue;
      let normalizedStart = normalizedAyah.value.indexOf(phrase, cursor);
      if (normalizedStart < 0) {
        normalizedStart = normalizedAyah.value.indexOf(phrase);
      }
      if (normalizedStart < 0) continue;

      const normalizedEnd = normalizedStart + phrase.length - 1;
      let start = normalizedAyah.starts[normalizedStart];
      let end = normalizedAyah.ends[normalizedEnd];
      if (start === undefined || end === undefined) continue;
      while (start > range.start) {
        const previousCharacter = text[start - 1]!;
        if (!COMBINING_MARK.test(previousCharacter) && previousCharacter !== "ء") break;
        start -= 1;
      }
      while (end < range.end) {
        const nextCharacter = String.fromCodePoint(text.codePointAt(end) ?? 0);
        if (!COMBINING_MARK.test(nextCharacter) && nextCharacter !== "ـ") break;
        end += nextCharacter.length;
      }
      matches.push({ start, end, meaning });
      cursor = normalizedStart + phrase.length;
    }
  }

  if (matches.length === 0) return [{ text }];
  matches.sort((left, right) => left.start - right.start || right.end - left.end);

  const groupedMatches: Array<{ start: number; end: number; meanings: QuranWordMeaning[] }> = [];
  for (const match of matches) {
    const previous = groupedMatches.at(-1);
    if (previous && match.start < previous.end) {
      previous.end = Math.max(previous.end, match.end);
      previous.meanings.push(match.meaning);
    } else {
      groupedMatches.push({ start: match.start, end: match.end, meanings: [match.meaning] });
    }
  }

  const segments: QuranTextSegment[] = [];
  let cursor = 0;
  for (const match of groupedMatches) {
    if (match.start > cursor) segments.push({ text: text.slice(cursor, match.start) });
    segments.push({ text: text.slice(match.start, match.end), meanings: match.meanings });
    cursor = match.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

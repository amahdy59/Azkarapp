import type { PlaybackEntry } from "../audio/audioTypes";

export interface QuranTranslationVerse {
  verseKey: string;
  text: string;
  marker: string;
}

/** Slice the reviewed end-of-verse markers; never infer boundaries from prose. */
export function splitQuranTranslation(
  translation: string,
  range: PlaybackEntry["quranRange"],
): QuranTranslationVerse[] {
  if (!range) return [];
  const verses: QuranTranslationVerse[] = [];
  let cursor = 0;
  let expectedAyah = range.ayahStart;
  for (const match of translation.matchAll(/\((\d+)\)/g)) {
    if (Number(match[1]) !== expectedAyah || expectedAyah > range.ayahEnd) return [];
    const text = translation.slice(cursor, match.index);
    if (!text.trim()) return [];
    verses.push({ verseKey: `${range.surah}:${expectedAyah}`, text, marker: match[0] });
    cursor = match.index + match[0].length;
    expectedAyah += 1;
  }
  return expectedAyah === range.ayahEnd + 1 && !translation.slice(cursor).trim() ? verses : [];
}

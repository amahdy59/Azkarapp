import type { MushafPageRange, Zikr } from "../types";

export interface MushafPageContent extends MushafPageRange {
  text: string;
}

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AYAH_MARKER_PATTERN = /﴿([0-9٠-٩۰-۹]+)﴾/gu;

function parseAyahNumber(value: string): number {
  const normalized = [...value]
    .map((digit) => {
      const arabicIndicIndex = ARABIC_INDIC_DIGITS.indexOf(digit);
      if (arabicIndicIndex >= 0) return String(arabicIndicIndex);
      const easternArabicIndex = EASTERN_ARABIC_DIGITS.indexOf(digit);
      return easternArabicIndex >= 0 ? String(easternArabicIndex) : digit;
    })
    .join("");
  return Number(normalized);
}

/** Long-surah behavior is enabled only by reviewed multi-page metadata. */
export function isLongSurah(zikr: Pick<Zikr, "mushafPages"> | undefined): boolean {
  return (zikr?.mushafPages?.length ?? 0) > 1;
}

/**
 * Splits at existing ayah markers without rewriting or normalizing Quran text.
 * Concatenating every returned `text` reproduces the input byte-for-byte.
 */
export function splitMushafPages(arabicText: string, ranges: readonly MushafPageRange[]): MushafPageContent[] {
  if (ranges.length === 0) return [];

  const markers = [...arabicText.matchAll(AYAH_MARKER_PATTERN)].map((match) => ({
    ayah: parseAyahNumber(match[1]!),
    end: match.index + match[0].length,
  }));
  const markerEndByAyah = new Map(markers.map((marker) => [marker.ayah, marker.end]));

  let expectedStart = ranges[0]!.startAyah;
  let cursor = 0;
  const pages: MushafPageContent[] = [];

  for (const [index, range] of ranges.entries()) {
    const markerEnd = markerEndByAyah.get(range.endAyah);
    if (range.startAyah !== expectedStart || range.endAyah < range.startAyah || markerEnd === undefined) {
      return [];
    }

    const end = index === ranges.length - 1 ? arabicText.length : markerEnd;
    pages.push({ ...range, text: arabicText.slice(cursor, end) });
    cursor = end;
    expectedStart = range.endAyah + 1;
  }

  return cursor === arabicText.length ? pages : [];
}

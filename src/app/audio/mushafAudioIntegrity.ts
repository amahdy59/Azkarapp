import type { MushafVerseData } from "../content/qcfMushaf";
import type { MushafPageRange } from "../types";
import { createArabicTextFingerprint } from "./arabicMatching";
import type { AudioVariant } from "./audioTypes";

export interface MushafAudioRecord {
  surah: number;
  verseCount: number;
  textHash: string;
  pages: MushafPageRange[];
  variants: AudioVariant[];
}

/** Complete semantic words only: reject missing/conflicting positions and
 * never copy QCF drawing glyphs into the audio transcript. */
export function collectMushafSurahText(
  surah: number,
  verseCount: number,
  pages: readonly (readonly MushafVerseData[])[],
) {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(verseCount) || verseCount < 1)
    throw new Error("Invalid Quran range");
  const verses = new Map<number, Map<number, string>>();
  for (const page of pages)
    for (const verse of page) {
      const [chapter, ayah] = verse.k.split(":").map(Number);
      if (chapter !== surah) continue;
      if (!ayah || ayah < 1 || ayah > verseCount) throw new Error("Unexpected Quran verse");
      const words = verses.get(ayah) ?? new Map<number, string>();
      for (const [position, , isEnd, text] of verse.w) {
        if (isEnd) continue;
        if (!Number.isInteger(position) || position < 1 || !text.trim()) throw new Error("Invalid Quran word");
        if (words.has(position) && words.get(position) !== text) throw new Error("Conflicting Quran word");
        words.set(position, text);
      }
      verses.set(ayah, words);
    }
  if (verses.size !== verseCount) throw new Error("Incomplete Quran verse coverage");
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return Array.from({ length: verseCount }, (_, index) => {
    const words = verses.get(index + 1)!;
    const positions = [...words.keys()].sort((a, b) => a - b);
    if (!positions.length || positions.some((position, index) => position !== index + 1))
      throw new Error("Incomplete Quran word coverage");
    const marker = String(index + 1).replace(/\d/g, (digit) => digits[Number(digit)]!);
    return `${positions.map((position) => words.get(position)!).join(" ")} ﴿${marker}﴾`;
  }).join(" ");
}

export function verifyMushafSurahText(record: MushafAudioRecord, pages: readonly (readonly MushafVerseData[])[]) {
  const text = collectMushafSurahText(record.surah, record.verseCount, pages);
  if (createArabicTextFingerprint(text) !== record.textHash) throw new Error("Mushaf audio transcript mismatch");
  return text;
}

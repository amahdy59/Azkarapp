import type { TextSizeOption } from "../types";

/**
 * Reading-text sizing for the zikr canvas.
 *
 * Split out of ReaderScreen so the scale table and the legibility floor are
 * directly testable — they encode two promises that are easy to break by
 * accident when someone nudges a number.
 */

/** The `--font-size` setting's base reading size, before any length scaling. */
const BASE_PX: Record<TextSizeOption, number> = { small: 16, medium: 18.5, large: 21.5 };

/**
 * Shorter azkar get more size, because a three-word dhikr on a full-height
 * canvas otherwise floats in whitespace. The steps are a measured fit to the
 * corpus: of 203 azkar the median is 108 characters and 65% run past 80, so
 * the last step is the one most cards actually land on and it carries the bulk
 * of the increase.
 *
 * Scaling — rather than the base — is what grew here, because `scale` is fixed
 * at 1 for long surahs. That keeps reviewed Mushaf pages at exactly the size
 * they were laid out and reviewed at, while every other card reads larger.
 */
const LENGTH_STEPS: ReadonlyArray<{ underLength: number; scale: number }> = [
  { underLength: 30, scale: 1.6 },
  { underLength: 60, scale: 1.45 },
  { underLength: 80, scale: 1.32 },
];
const LONGEST_TEXT_SCALE = 1.22;

/**
 * No reading text may render smaller than this.
 *
 * The value is what "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." — 31 characters, the shape of the
 * shortest common dhikr — rendered at before this change: the 18.5px medium
 * base times the old 1.15 step, 21.27px, rounded up. Fully vocalised Arabic
 * carries its harakat well below the baseline and above the cap, and those
 * marks are the first thing to become unreadable as size drops, so the floor
 * is set by the smallest text that still has to be legible rather than by a
 * generic body-copy minimum.
 *
 * Lowering the text-size setting still shrinks the app's chrome through
 * `--font-size`; it just stops taking the zikr itself below this line.
 */
export const MIN_READING_FONT_SIZE_PX = 21.3;

export type ReadingSizeInput = {
  textSize: TextSizeOption;
  /** Length of the zikr's Arabic text, diacritics included. */
  arabicLength: number;
  /** Reviewed multi-page surahs (Kahf, Sajda, Mulk) — deliberately unscaled. */
  longSurah: boolean;
};

/**
 * Long surahs return the raw base: they are excluded from both the increase
 * and the floor, so a reviewed Mushaf page keeps the line breaks it was
 * reviewed with.
 */
export function getReadingFontSizePx({ textSize, arabicLength, longSurah }: ReadingSizeInput): number {
  const base = BASE_PX[textSize];
  if (longSurah) return base;

  const step = LENGTH_STEPS.find(({ underLength }) => arabicLength < underLength);
  const scaled = base * (step?.scale ?? LONGEST_TEXT_SCALE);
  return Math.round(Math.max(scaled, MIN_READING_FONT_SIZE_PX) * 100) / 100;
}

export function getReadingFontSize(input: ReadingSizeInput): string {
  return `${getReadingFontSizePx(input)}px`;
}

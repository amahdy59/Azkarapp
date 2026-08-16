import { describe, expect, it } from "vitest";

import { MIN_READING_FONT_SIZE_PX, getReadingFontSizePx } from "./readingTypography";

/** "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." — 31 characters with its diacritics. */
const REFERENCE_DHIKR_LENGTH = 31;

/**
 * What the reference dhikr rendered at before this change: the 18.5px medium
 * base times the old 1.15 step. Nothing may take it below this.
 */
const SIZE_BEFORE_THE_INCREASE = 18.5 * 1.15;

const SIZES = ["small", "medium", "large"] as const;

describe("reading typography", () => {
  it("renders the reference dhikr larger than before at every setting", () => {
    for (const textSize of SIZES) {
      const size = getReadingFontSizePx({ textSize, arabicLength: REFERENCE_DHIKR_LENGTH, longSurah: false });
      expect(size, `${textSize} must not shrink the reference dhikr`).toBeGreaterThanOrEqual(SIZE_BEFORE_THE_INCREASE);
    }
  });

  it("never renders reading text below the legibility floor", () => {
    // Across every setting and every length in the corpus's range.
    for (const textSize of SIZES) {
      for (let arabicLength = 1; arabicLength <= 400; arabicLength += 1) {
        const size = getReadingFontSizePx({ textSize, arabicLength, longSurah: false });
        expect(size, `${textSize} at ${arabicLength} chars`).toBeGreaterThanOrEqual(MIN_READING_FONT_SIZE_PX);
      }
    }
  });

  it("increases every length band over the sizes it replaced", () => {
    // Old table: <30 -> 1.3, <60 -> 1.15, <80 -> 1.05, else 1.0.
    const previous = (arabicLength: number, base: number) =>
      base * (arabicLength < 30 ? 1.3 : arabicLength < 60 ? 1.15 : arabicLength < 80 ? 1.05 : 1);
    const bases = { small: 16, medium: 18.5, large: 21.5 } as const;

    for (const textSize of SIZES) {
      for (const arabicLength of [10, 29, 30, 59, 60, 79, 80, 200, 3510]) {
        const size = getReadingFontSizePx({ textSize, arabicLength, longSurah: false });
        expect(size, `${textSize} at ${arabicLength} chars`).toBeGreaterThan(previous(arabicLength, bases[textSize]));
      }
    }
  });

  it("keeps shorter text larger than longer text at the same setting", () => {
    for (const textSize of SIZES) {
      const sizes = [10, 45, 70, 500].map((arabicLength) =>
        getReadingFontSizePx({ textSize, arabicLength, longSurah: false }),
      );
      const sorted = [...sizes].sort((a, b) => b - a);
      expect(sizes).toEqual(sorted);
    }
  });

  it("leaves long surahs at the unscaled base so reviewed pages keep their line breaks", () => {
    expect(getReadingFontSizePx({ textSize: "small", arabicLength: 3510, longSurah: true })).toBe(16);
    expect(getReadingFontSizePx({ textSize: "medium", arabicLength: 3510, longSurah: true })).toBe(18.5);
    expect(getReadingFontSizePx({ textSize: "large", arabicLength: 3510, longSurah: true })).toBe(21.5);
  });

  it("keeps the three settings distinct so the control still does something", () => {
    for (const arabicLength of [10, 45, 70, 200]) {
      const small = getReadingFontSizePx({ textSize: "small", arabicLength, longSurah: false });
      const medium = getReadingFontSizePx({ textSize: "medium", arabicLength, longSurah: false });
      const large = getReadingFontSizePx({ textSize: "large", arabicLength, longSurah: false });
      expect(medium, `medium must exceed small at ${arabicLength} chars`).toBeGreaterThan(small);
      expect(large, `large must exceed medium at ${arabicLength} chars`).toBeGreaterThan(medium);
    }
  });
});

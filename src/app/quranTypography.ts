import type { CSSProperties } from "react";
import type { TextSizeOption, Zikr } from "./types";

export function isQuranPassage(zikr: Pick<Zikr, "quranText" | "isSurah" | "attributionType">) {
  return Boolean(zikr.quranText || zikr.isSurah || zikr.attributionType === "quranic_supplication");
}

/** Flowing Quran passages use one size per setting, regardless of their length. */
export const QURAN_READING_PX: Record<TextSizeOption, number> = { small: 22, medium: 24, large: 28 };
export const QURAN_TEXT_STYLE: CSSProperties = {
  fontFamily: "var(--font-mushaf)",
  fontSize: "var(--quran-font-size, 1.5rem)",
  fontWeight: 400,
  fontSynthesis: "none",
  lineHeight: 1.85,
  letterSpacing: "normal",
};
export function getQuranReadingSize(textSize: TextSizeOption) {
  return `${QURAN_READING_PX[textSize] / { small: 14, medium: 16, large: 18 }[textSize]}rem`;
}

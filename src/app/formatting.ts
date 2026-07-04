import type { AppLanguage } from "./types";

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function formatNumerals(value: number | string, language: AppLanguage) {
  const input = String(value);

  if (language !== "ar") {
    return input;
  }

  return input.replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)] ?? digit);
}

export function numeralFontFamily(language: AppLanguage) {
  return language === "ar"
    ? "'Noto Sans Arabic', 'Noto Naskh Arabic', sans-serif"
    : "'Atkinson Hyperlegible', 'Inter', sans-serif";
}

export function formatRatio(current: number | string, total: number | string, language: AppLanguage) {
  return `${formatNumerals(current, language)} / ${formatNumerals(total, language)}`;
}

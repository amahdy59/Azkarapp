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

export function counterNumeralFontFamily(language: AppLanguage) {
  return language === "ar"
    ? "'Noto Sans Arabic', 'Noto Naskh Arabic', sans-serif"
    : "'DM Mono', 'Atkinson Hyperlegible', monospace";
}

export function formatRatio(current: number | string, total: number | string, language: AppLanguage) {
  return `${formatNumerals(current, language)} / ${formatNumerals(total, language)}`;
}

export function formatHijriDate(date: Date = new Date(), language: AppLanguage = "ar"): string {
  try {
    const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
    const formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formatted = formatter.format(date);
    return language === "ar" ? `${formatted} هـ` : `${formatted} AH`;
  } catch {
    return "";
  }
}


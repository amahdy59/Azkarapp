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
  return language === "ar" ? "var(--font-ui-arabic)" : "var(--font-ui-latin)";
}

export function counterNumeralFontFamily(language: AppLanguage) {
  return language === "ar" ? "var(--font-ui-arabic)" : "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
}

export function formatRatio(current: number | string, total: number | string, language: AppLanguage) {
  return `${formatNumerals(current, language)} / ${formatNumerals(total, language)}`;
}

export function formatHijriDate(date: Date = new Date(), language: AppLanguage = "ar"): string {
  try {
    const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formatted = formatter.format(date);
    // Strip any existing era indicators to prevent duplicate suffixes ("AH AH" / "هـ هـ")
    const cleaned = formatted.replace(/\s*(AH|هـ)+/gi, "").trim();
    return language === "ar" ? `${cleaned} هـ` : `${cleaned} AH`;
  } catch {
    return "";
  }
}

export function formatHijriDateWithTime(date: Date = new Date(), language: AppLanguage = "ar"): string {
  try {
    const dateStr = formatHijriDate(date, language);
    const timeFormatter = new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "numeric",
    });
    const timeStr = timeFormatter.format(date);
    return `${dateStr} • ${timeStr}`;
  } catch {
    return formatHijriDate(date, language);
  }
}

export function formatDisplayDate(
  date: Date = new Date(),
  language: AppLanguage = "ar",
  calendarType: "hijri" | "gregorian" = "hijri",
): string {
  if (calendarType === "gregorian") {
    try {
      const locale = language === "ar" ? "ar-EG" : "en-US";
      const formatter = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const formatted = formatter.format(date);
      return language === "ar" ? `${formatted} م` : `${formatted} AD`;
    } catch {
      return date.toLocaleDateString();
    }
  }
  return formatHijriDate(date, language);
}

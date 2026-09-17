/**
 * Hijri/Gregorian date labels for the garden's period navigator.
 *
 * Split out of RoutineGarden.tsx behind the DEC-038 characterization tests.
 * Pure functions with no React dependency, so they are `.ts` rather than
 * `.tsx` and can be tested without rendering.
 */
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";

// ─── Date Label Helper & Parsers ──────────────────────────────────────────────

function parseCleanNumber(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  const str = String(val ?? "");
  const western = str.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const parsed = parseInt(western.replace(/\D/g, ""), 10);
  return isNaN(parsed) ? 1 : parsed;
}

function getHijriDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear.replace(/AH|AD/gi, "").trim();
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

function getGregorianDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-EG" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear;
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

const ARABIC_WEEK_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

export function getGardenDateLabel(
  displayDate: Date,
  tab: "day" | "week" | "month" | "year",
  offset: number,
  language: AppLanguage,
  calendarType: "hijri" | "gregorian" = "hijri",
): string {
  const isArabic = language === "ar";
  const isHijri = calendarType === "hijri";
  const { weekday, day, month, year } = isHijri
    ? getHijriDetails(displayDate, language)
    : getGregorianDetails(displayDate, language);

  const eraSuffix = isHijri ? (isArabic ? "هـ" : "AH") : isArabic ? "م" : "AD";

  if (tab === "day") {
    if (offset === 0) {
      return isArabic
        ? `اليوم ${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
        : `Today, ${weekday} ${day} ${month} ${year} ${eraSuffix}`;
    }
    return isArabic
      ? `${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
      : `${weekday}, ${day} ${month} ${year} ${eraSuffix}`;
  }

  if (tab === "week") {
    const weekIndex = Math.min(4, Math.max(0, Math.floor((day - 1) / 7)));
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min((weekIndex + 1) * 7, 30);
    const weekOrdinal = isArabic ? (ARABIC_WEEK_ORDINALS[weekIndex] ?? "الأول") : `Week ${weekIndex + 1}`;

    if (isArabic) {
      return `الأسبوع ${weekOrdinal} (${formatNumerals(startDay, language)} - ${formatNumerals(endDay, language)} ${month} ${year} ${eraSuffix})`;
    }
    return `${weekOrdinal} (${startDay} - ${endDay} ${month} ${year} ${eraSuffix})`;
  }

  if (tab === "month") {
    return isArabic ? `${month} ${year} ${eraSuffix}` : `${month} ${year} ${eraSuffix}`;
  }

  return isArabic ? `${year} ${eraSuffix}` : `${year} ${eraSuffix}`;
}

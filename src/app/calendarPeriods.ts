import type { AppLanguage } from "./types";

export type CalendarType = "hijri" | "gregorian";

export type CalendarMonthPeriod = {
  referenceDate: Date;
  startDate: Date;
  endDate: Date;
  dates: Date[];
  dayNumbers: number[];
  monthLabel: string;
  yearLabel: string;
};

function atNoon(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function addDays(date: Date, amount: number) {
  const next = atNoon(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function numericPart(value: string | undefined) {
  const normalized = String(value ?? "")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^0-9]/g, "");
  return Number.parseInt(normalized || "0", 10);
}

function hijriParts(date: Date, language: AppLanguage = "en") {
  const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const numericParts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);

  return {
    day: numericPart(numericParts.find((part) => part.type === "day")?.value),
    month: numericPart(numericParts.find((part) => part.type === "month")?.value),
    year: numericPart(numericParts.find((part) => part.type === "year")?.value),
    monthLabel: parts.find((part) => part.type === "month")?.value ?? "",
    yearLabel:
      parts
        .find((part) => part.type === "year")
        ?.value?.replace(/\s*(AH|هـ)\s*/gi, "")
        .trim() ?? "",
  };
}

function gregorianMonthPeriod(referenceDate: Date, language: AppLanguage): CalendarMonthPeriod {
  const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 12);
  const endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 12);
  const dates = Array.from({ length: endDate.getDate() }, (_, index) => addDays(startDate, index));
  const locale = language === "ar" ? "ar-EG" : "en-US";
  return {
    referenceDate: atNoon(referenceDate),
    startDate,
    endDate,
    dates,
    dayNumbers: dates.map((date) => date.getDate()),
    monthLabel: new Intl.DateTimeFormat(locale, { month: "long" }).format(referenceDate),
    yearLabel: new Intl.DateTimeFormat(locale, { year: "numeric" }).format(referenceDate),
  };
}

export function getCalendarMonthPeriod(
  referenceDate: Date,
  calendarType: CalendarType,
  language: AppLanguage,
): CalendarMonthPeriod {
  if (calendarType === "gregorian") return gregorianMonthPeriod(referenceDate, language);

  const reference = atNoon(referenceDate);
  const referenceParts = hijriParts(reference, language);
  const startDate = addDays(reference, -(referenceParts.day - 1));
  const dates: Date[] = [];
  const dayNumbers: number[] = [];

  for (let offset = 0; offset < 32; offset += 1) {
    const date = addDays(startDate, offset);
    const parts = hijriParts(date, language);
    if (parts.month !== referenceParts.month || parts.year !== referenceParts.year) break;
    dates.push(date);
    dayNumbers.push(parts.day);
  }

  return {
    referenceDate: reference,
    startDate,
    endDate: dates.at(-1) ?? startDate,
    dates,
    dayNumbers,
    monthLabel: referenceParts.monthLabel,
    yearLabel: referenceParts.yearLabel,
  };
}

export function shiftCalendarDate(
  referenceDate: Date,
  unit: "day" | "week" | "month" | "year",
  offset: number,
  calendarType: CalendarType,
) {
  if (offset === 0) return atNoon(referenceDate);
  if (unit === "day") return addDays(referenceDate, offset);
  if (unit === "week") return addDays(referenceDate, offset * 7);
  if (calendarType === "gregorian") {
    const shifted = atNoon(referenceDate);
    if (unit === "month") shifted.setMonth(shifted.getMonth() + offset);
    else shifted.setFullYear(shifted.getFullYear() + offset);
    return shifted;
  }

  let shifted = atNoon(referenceDate);
  const steps = Math.abs(offset) * (unit === "year" ? 12 : 1);
  const direction = Math.sign(offset);
  for (let step = 0; step < steps; step += 1) {
    const period = getCalendarMonthPeriod(shifted, "hijri", "en");
    shifted = direction > 0 ? addDays(period.endDate, 1) : addDays(period.startDate, -1);
  }
  return shifted;
}

export function getCalendarYearPeriods(referenceDate: Date, calendarType: CalendarType, language: AppLanguage) {
  if (calendarType === "gregorian") {
    return Array.from({ length: 12 }, (_, month) =>
      gregorianMonthPeriod(new Date(referenceDate.getFullYear(), month, 15, 12), language),
    );
  }

  const parts = hijriParts(referenceDate, "en");
  let cursor = atNoon(referenceDate);
  for (let index = parts.month; index > 1; index -= 1) {
    const period = getCalendarMonthPeriod(cursor, "hijri", language);
    cursor = addDays(period.startDate, -1);
  }

  const periods: CalendarMonthPeriod[] = [];
  for (let month = 0; month < 12; month += 1) {
    const period = getCalendarMonthPeriod(cursor, "hijri", language);
    periods.push(period);
    cursor = addDays(period.endDate, 1);
  }
  return periods;
}

export function getPeriodRange(
  activeTab: "day" | "week" | "month" | "year",
  displayDate: Date,
  language: AppLanguage,
  calendarType: CalendarType,
): { startKey: string; endKey: string } {
  const formatKey = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  if (activeTab === "day") {
    const key = formatKey(displayDate);
    return { startKey: key, endKey: key };
  }

  if (activeTab === "week") {
    const isArabic = language === "ar";
    const currentDayOfWeek = displayDate.getDay();
    const startOffset = isArabic ? (currentDayOfWeek + 1) % 7 : currentDayOfWeek;

    const startOfWeek = new Date(displayDate);
    startOfWeek.setHours(12, 0, 0, 0);
    startOfWeek.setDate(displayDate.getDate() - startOffset);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return { startKey: formatKey(startOfWeek), endKey: formatKey(endOfWeek) };
  }

  if (activeTab === "month") {
    const period = getCalendarMonthPeriod(displayDate, calendarType, language);
    return { startKey: formatKey(period.startDate), endKey: formatKey(period.endDate) };
  }

  if (activeTab === "year") {
    const periods = getCalendarYearPeriods(displayDate, calendarType, language);
    return {
      startKey: formatKey(periods[0]?.startDate || displayDate),
      endKey: formatKey(periods[periods.length - 1]?.endDate || displayDate),
    };
  }

  return { startKey: "0000-00-00", endKey: "9999-99-99" };
}

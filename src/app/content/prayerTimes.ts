import type { LocationSettings, PrayerName } from "../types";
import { getPrayerTimes } from "./prayerCalculation";
import { formatNumerals } from "../formatting";

export type { PrayerName };

export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const satisfies readonly PrayerName[];

export function isPrayerName(value: string | undefined): value is PrayerName {
  return PRAYER_NAMES.some((prayer) => prayer === value);
}

export interface PrayerTimes {
  fajr: string; // e.g. "04:45"
  dhuhr: string; // e.g. "12:15"
  asr: string; // e.g. "15:30"
  maghrib: string; // e.g. "18:20"
  isha: string; // e.g. "19:45"
}

/** Resolves exact or calculated prayer times for a date and location settings */
export function getEstimatedPrayerTimes(date: Date = new Date(), location?: LocationSettings): PrayerTimes {
  return getPrayerTimes(date, location);
}

/** Converts "HH:MM" time string to total minutes from midnight */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Determines which prayer period the current time falls into or follows */
export function getCurrentPrayerPeriod(
  date: Date = new Date(),
  location?: LocationSettings,
): {
  currentPrayer: PrayerName;
  isFajrOrMaghrib: boolean;
  prayerTimes: PrayerTimes;
} {
  const times = getEstimatedPrayerTimes(date, location);
  const nowMins = date.getHours() * 60 + date.getMinutes();

  const fajrM = timeToMinutes(times.fajr);
  const dhuhrM = timeToMinutes(times.dhuhr);
  const asrM = timeToMinutes(times.asr);
  const maghribM = timeToMinutes(times.maghrib);
  const ishaM = timeToMinutes(times.isha);

  let currentPrayer: PrayerName;

  if (nowMins >= fajrM && nowMins < dhuhrM) {
    currentPrayer = "fajr";
  } else if (nowMins >= dhuhrM && nowMins < asrM) {
    currentPrayer = "dhuhr";
  } else if (nowMins >= asrM && nowMins < maghribM) {
    currentPrayer = "asr";
  } else if (nowMins >= maghribM && nowMins < ishaM) {
    currentPrayer = "maghrib";
  } else {
    currentPrayer = "isha";
  }

  const isFajrOrMaghrib = currentPrayer === "fajr" || currentPrayer === "maghrib";

  return {
    currentPrayer,
    isFajrOrMaghrib,
    prayerTimes: times,
  };
}

export function formatPrayerTimeLabel(time24: string, isArabic: boolean): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const period = h >= 12 ? (isArabic ? "م" : "PM") : isArabic ? "ص" : "AM";
  h = h % 12 || 12;
  const timeString = `${h}:${m}`;
  const formattedTime = isArabic ? formatNumerals(timeString, "ar") : timeString;
  return `${formattedTime} ${period}`;
}

export interface NextPrayerInfo {
  name: PrayerName;
  nameArabic: string;
  nameEnglish: string;
  time24: string;
  remainingMinutes: number;
  formattedCountdown: string;
}

const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const PRAYER_NAMES_EN: Record<PrayerName, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function getNextPrayerCountdown(
  date: Date = new Date(),
  language: "ar" | "en" = "ar",
  location?: LocationSettings,
): NextPrayerInfo {
  const times = getEstimatedPrayerTimes(date, location);
  const nowMins = date.getHours() * 60 + date.getMinutes();

  const prayers: { name: PrayerName; mins: number }[] = [
    { name: "fajr", mins: timeToMinutes(times.fajr) },
    { name: "dhuhr", mins: timeToMinutes(times.dhuhr) },
    { name: "asr", mins: timeToMinutes(times.asr) },
    { name: "maghrib", mins: timeToMinutes(times.maghrib) },
    { name: "isha", mins: timeToMinutes(times.isha) },
  ];

  const found = prayers.find((p) => p.mins > nowMins);
  const target = found ?? prayers[0];
  const targetName: PrayerName = target?.name ?? "fajr";
  const targetMins: number = target?.mins ?? 285;

  const remainingMins = found ? targetMins - nowMins : 24 * 60 - nowMins + targetMins;

  const hours = Math.floor(remainingMins / 60);
  const mins = remainingMins % 60;
  const isArabic = language === "ar";

  const hh = hours.toString().padStart(2, "0");
  const mm = mins.toString().padStart(2, "0");
  const timeStr = `${hh}:${mm}`;
  const formattedTimeStr = isArabic ? formatNumerals(timeStr, "ar") : timeStr;
  const formattedCountdown = isArabic ? `باقي ${formattedTimeStr}` : `${formattedTimeStr} left`;

  return {
    name: targetName,
    nameArabic: PRAYER_NAMES_AR[targetName],
    nameEnglish: PRAYER_NAMES_EN[targetName],
    time24: times[targetName],
    remainingMinutes: remainingMins,
    formattedCountdown,
  };
}

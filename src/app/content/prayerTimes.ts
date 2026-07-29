export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTimes {
  fajr: string; // e.g. "04:45"
  dhuhr: string; // e.g. "12:15"
  asr: string; // e.g. "15:30"
  maghrib: string; // e.g. "18:20"
  isha: string; // e.g. "19:45"
}

// Estimates approximate prayer times based on current date for Islamic Zikr notifications
export function getEstimatedPrayerTimes(date: Date = new Date()): PrayerTimes {
  const month = date.getMonth(); // 0-11

  // Seasonal adjustment tables for middle-eastern / standard latitudes
  const fajrHours = [5, 5, 4, 4, 3, 3, 3, 4, 4, 4, 5, 5];
  const fajrMins = [15, 0, 40, 15, 45, 30, 40, 0, 15, 30, 0, 15];

  const maghribHours = [17, 17, 18, 18, 19, 19, 19, 18, 18, 17, 17, 17];
  const maghribMins = [15, 40, 0, 20, 0, 15, 10, 45, 15, 45, 15, 0];

  const fH = fajrHours[month] ?? 4;
  const fM = fajrMins[month] ?? 30;
  const mH = maghribHours[month] ?? 18;
  const mM = maghribMins[month] ?? 30;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return {
    fajr: `${pad(fH)}:${pad(fM)}`,
    dhuhr: "12:15",
    asr: "15:30",
    maghrib: `${pad(mH)}:${pad(mM)}`,
    isha: "19:45",
  };
}

/** Converts "HH:MM" time string to total minutes from midnight */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Determines which prayer period the current time falls into or follows */
export function getCurrentPrayerPeriod(date: Date = new Date()): {
  currentPrayer: PrayerName;
  isFajrOrMaghrib: boolean;
  prayerTimes: PrayerTimes;
} {
  const times = getEstimatedPrayerTimes(date);
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
  return `${h}:${m} ${period}`;
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

export function getNextPrayerCountdown(date: Date = new Date(), language: "ar" | "en" = "ar"): NextPrayerInfo {
  const times = getEstimatedPrayerTimes(date);
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

  const formattedCountdown =
    hours > 0
      ? isArabic
        ? `باقي ${hours} س ${mins} د`
        : `${hours}h ${mins}m left`
      : isArabic
        ? `باقي ${mins} د`
        : `${mins}m left`;

  return {
    name: targetName,
    nameArabic: PRAYER_NAMES_AR[targetName],
    nameEnglish: PRAYER_NAMES_EN[targetName],
    time24: times[targetName],
    remainingMinutes: remainingMins,
    formattedCountdown,
  };
}

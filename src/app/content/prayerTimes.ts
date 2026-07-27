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

export function formatPrayerTimeLabel(time24: string, isArabic: boolean): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const period = h >= 12 ? (isArabic ? "م" : "PM") : isArabic ? "ص" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

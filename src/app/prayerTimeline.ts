import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { getEstimatedPrayerTimes, PRAYER_NAMES } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import type { LocationSettings, PrayerName } from "./types";

export interface PrayerOccurrence {
  prayer: PrayerName;
  time: string;
  at: number;
}

/** Dated instants keep the next-prayer interval correct across midnight and DST.
 * Reuses the native reminder civil-time conversion; no new prayer calculation. */
export function getPrayerTimeline(now: Date, location?: LocationSettings) {
  let zone = location?.timeZone || DEFAULT_LOCATION.timeZone || "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone }).format(now);
  } catch {
    zone = DEFAULT_LOCATION.timeZone || "UTC";
  }
  const calendar = locationCalendarDate(now, zone);
  const occurrences: PrayerOccurrence[] = [];
  const selectedLocation = location ? { ...location, timeZone: zone } : undefined;
  const prayerTimes = getEstimatedPrayerTimes(calendar, selectedLocation);
  for (const offset of [-1, 0, 1]) {
    const date = new Date(calendar);
    date.setDate(date.getDate() + offset);
    const times = offset === 0 ? prayerTimes : getEstimatedPrayerTimes(date, selectedLocation);
    for (const prayer of PRAYER_NAMES)
      occurrences.push({ prayer, time: times[prayer], at: locationTime(date, times[prayer], zone) });
  }
  occurrences.sort((a, b) => a.at - b.at);
  const nextIndex = occurrences.findIndex((occurrence) => occurrence.at > now.getTime());
  const current = occurrences[nextIndex - 1]!;
  const next = occurrences[nextIndex]!;
  const remainingMs = next.at - now.getTime();
  const intervalMs = next.at - current.at;
  return {
    current,
    next,
    prayerTimes,
    remainingMinutes: Math.ceil(remainingMs / 60_000),
    remainingPercent: Math.max(0, Math.min(100, (remainingMs / intervalMs) * 100)),
  };
}

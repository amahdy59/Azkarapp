import type { PrayerName, PrayerTrackingRecord } from "./types";
import { mergePrayerTracking } from "./syncMerge";
import { trackedLocation } from "./prayerMoment";

export const PRAYER_STATS_ORDER: readonly PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
export interface PrayerPeriodCounts {
  fard: number;
  mosque: number;
  home: number;
  rawatib: number;
  adhkar: number;
}

/** Derived read-only view of normalized records; location segments partition
 * prayer slots. Connected practices never imply a recorded obligatory prayer. */
export function getPrayerPeriodStats(
  records: readonly PrayerTrackingRecord[],
  startKey: string,
  endKey: string,
  days: number,
) {
  const rows = PRAYER_STATS_ORDER.map((prayer) => ({ prayer, fard: 0, mosque: 0, home: 0, rawatib: 0, adhkar: 0 }));
  for (const record of mergePrayerTracking([], [...records])) {
    if (record.dayKey < startKey || record.dayKey > endKey) continue;
    const row = rows.find((row) => row.prayer === record.prayer);
    if (!row) continue;
    const location = trackedLocation(record);
    if (location) {
      row.fard++;
      row[location]++;
    }
    if (record.prayer !== "asr" && (record.sunnah || record.sunnahBefore || record.sunnahAfter)) row.rawatib++;
    if (record.adhkar) row.adhkar++;
  }
  const totals = rows.reduce<PrayerPeriodCounts>(
    (sum, row) => ({
      fard: sum.fard + row.fard,
      mosque: sum.mosque + row.mosque,
      home: sum.home + row.home,
      rawatib: sum.rawatib + row.rawatib,
      adhkar: sum.adhkar + row.adhkar,
    }),
    { fard: 0, mosque: 0, home: 0, rawatib: 0, adhkar: 0 },
  );
  return { rows, totals, days, possible: days * 5 };
}

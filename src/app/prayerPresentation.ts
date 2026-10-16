import { t } from "./i18n";
import { dateFromProgressDayKey } from "./progress";
import type { AppLanguage, PrayerName } from "./types";

/** Display identity only: records, timings and reviewed evidence keep their prayer keys. */
export function prayerDisplayName(prayer: PrayerName, language: AppLanguage, dayKey?: string) {
  const isFriday = dayKey ? dateFromProgressDayKey(dayKey).getDay() === 5 : false;
  return t(language, prayer === "dhuhr" && isFriday ? "prayerTracking.jumuah" : `notifications.${prayer}`);
}

import { t } from "./i18n";
import { dateFromProgressDayKey } from "./progress";
import type { AppLanguage, PrayerName } from "./types";

export function isJumuahPrayer(prayer: PrayerName, dayKey?: string) {
  return prayer === "dhuhr" && !!dayKey && dateFromProgressDayKey(dayKey).getDay() === 5;
}

/** Friday presentation keeps the persisted Dhuhr key and prayer timing. */
export function prayerDisplayName(prayer: PrayerName, language: AppLanguage, dayKey?: string) {
  return t(language, isJumuahPrayer(prayer, dayKey) ? "prayerTracking.jumuah" : `notifications.${prayer}`);
}

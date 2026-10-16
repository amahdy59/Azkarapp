import type { AppLanguage, CategoryId, LocationSettings } from "./types";
import { getEstimatedPrayerTimes, timeToMinutes } from "./content/prayerTimes";
import { t } from "./i18n";

export function isLastThirdOfNight(now: Date = new Date(), location?: LocationSettings): boolean {
  const fajrToday = timeToMinutes(getEstimatedPrayerTimes(now, location).fajr);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nightStart = new Date(now);
  const nightEnd = new Date(now);

  if (currentMinutes < fajrToday) {
    nightStart.setDate(nightStart.getDate() - 1);
    const maghribYesterday = timeToMinutes(getEstimatedPrayerTimes(nightStart, location).maghrib);
    nightStart.setHours(Math.floor(maghribYesterday / 60), maghribYesterday % 60, 0, 0);
    nightEnd.setHours(Math.floor(fajrToday / 60), fajrToday % 60, 0, 0);
  } else {
    const maghribToday = timeToMinutes(getEstimatedPrayerTimes(now, location).maghrib);
    if (currentMinutes < maghribToday) return false;
    nightStart.setHours(Math.floor(maghribToday / 60), maghribToday % 60, 0, 0);
    nightEnd.setDate(nightEnd.getDate() + 1);
    const fajrTomorrow = timeToMinutes(getEstimatedPrayerTimes(nightEnd, location).fajr);
    nightEnd.setHours(Math.floor(fajrTomorrow / 60), fajrTomorrow % 60, 0, 0);
  }

  const lastThirdStartsAt = nightStart.getTime() + ((nightEnd.getTime() - nightStart.getTime()) * 2) / 3;
  return now.getTime() >= lastThirdStartsAt && now.getTime() < nightEnd.getTime();
}

/**
 * The forenoon, when the Duha prayer is preferred.
 *
 * Derived from the day's own times rather than from a clock: the window is the
 * late part of the stretch between Fajr and Dhuhr, which lands around half past
 * nine to half eleven for a typical day and stays right in a season or a
 * latitude where those hours would not be. A fixed 09:30–11:30 would drift into
 * the wrong part of the morning every time the sun did.
 *
 * The classical window opens shortly after sunrise, but sunrise is computed
 * inside the prayer maths and never reported, and the preferred time is the
 * later portion in any case — which is what a reminder should aim at.
 */
export function isDhuhaWindow(now: Date = new Date(), location?: LocationSettings): boolean {
  const times = getEstimatedPrayerTimes(now, location);
  const fajr = timeToMinutes(times.fajr);
  const dhuhr = timeToMinutes(times.dhuhr);
  if (dhuhr <= fajr) return false;

  const start = fajr + (dhuhr - fajr) * 0.6;
  const end = dhuhr - 30;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= start && current < end;
}

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar", location?: LocationSettings) {
  if (isLastThirdOfNight(now, location)) {
    return {
      categoryId: "comprehensive_duas" as CategoryId,
      title: t(language, "home.lastThirdTitle"),
      desc: t(language, "home.lastThirdDesc"),
    };
  }

  const prayerTimes = getEstimatedPrayerTimes(now, location);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const fajrMinutes = timeToMinutes(prayerTimes.fajr);
  const asrMinutes = timeToMinutes(prayerTimes.asr);
  const ishaMinutes = timeToMinutes(prayerTimes.isha);

  if (currentMinutes >= fajrMinutes && currentMinutes < asrMinutes) {
    return {
      categoryId: "morning" as CategoryId,
      title: t(language, "home.morningTitle"),
      desc: t(language, "home.morningDesc"),
    };
  }
  if (currentMinutes >= asrMinutes && currentMinutes < ishaMinutes) {
    return {
      categoryId: "evening" as CategoryId,
      title: t(language, "home.eveningTitle"),
      desc: t(language, "home.eveningDesc"),
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    title: t(language, "home.beforeSleepTitle"),
    desc: t(language, "home.beforeSleepDesc"),
  };
}

export function isFridayFeatureWindow(now: Date, location?: LocationSettings): boolean {
  const day = now.getDay();
  if (day !== 4 && day !== 5) return false;

  const maghrib = timeToMinutes(getEstimatedPrayerTimes(now, location).maghrib);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (day === 4 && currentMinutes >= maghrib) || (day === 5 && currentMinutes < maghrib);
}

/**
 * Friday daytime (morning through afternoon until Maghrib evening prayer).
 *
 * During this window on Friday (day 5), the dedicated Friday devotional
 * background image is active.
 */
export function isFridayDaytime(now: Date = new Date(), location?: LocationSettings): boolean {
  if (now.getDay() !== 5) return false;

  const prayerTimes = getEstimatedPrayerTimes(now, location);
  const fajr = timeToMinutes(prayerTimes.fajr);
  const maghrib = timeToMinutes(prayerTimes.maghrib);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= fajr && currentMinutes < maghrib;
}

/** The Friday morning photograph ends at the same day's calculated Dhuhr. */
export function isFridayMorning(now: Date = new Date(), location?: LocationSettings): boolean {
  if (!isFridayDaytime(now, location)) return false;
  const dhuhr = timeToMinutes(getEstimatedPrayerTimes(now, location).dhuhr);
  return now.getHours() * 60 + now.getMinutes() < dhuhr;
}

export function getHomeBackgroundCategory(now: Date, location?: LocationSettings): string {
  const category = getTimeOfDayZikr(now, "en", location).categoryId;
  if (category === "comprehensive_duas") return "before_sleep";
  if (isFridayDaytime(now, location)) return isFridayMorning(now, location) ? "friday_morning" : "friday";
  return category;
}

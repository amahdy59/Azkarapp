import { getCurrentPrayerPeriod, getNextPrayerCountdown, PRAYER_NAMES } from "./content/prayerTimes";
import type { PrayerCardModel } from "./components/PrayerTrackerCards";
import type { AppLanguage, LocationSettings, PrayerName } from "./types";

/**
 * Derives each prayer's temporal state from the clock.
 *
 * Shared by Home and Progress so the two cannot disagree about which prayer is
 * current — they render the same row and previously only Home knew how to
 * build it. Nothing here touches tracking: that is stored per day and prayer,
 * and is deliberately independent of the time of day.
 */
export function buildPrayerCardModels(
  now: Date,
  language: AppLanguage,
  location: LocationSettings | undefined,
): PrayerCardModel[] {
  const period = getCurrentPrayerPeriod(now, location);
  const next = getNextPrayerCountdown(now, language, location);
  const activeIndex = PRAYER_NAMES.indexOf(period.currentPrayer as PrayerName);

  return PRAYER_NAMES.map((prayer, index) => {
    const isNext = prayer === next.name;
    const state = index === activeIndex ? "current" : isNext ? "next" : index < activeIndex ? "past" : "upcoming";
    return {
      prayer,
      time: period.prayerTimes[prayer],
      state,
      ...(isNext ? { countdown: next.formattedCountdown } : {}),
    };
  });
}

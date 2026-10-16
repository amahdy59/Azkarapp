import { PRAYER_NAMES } from "./content/prayerTimes";
import { getPrayerTimeline } from "./prayerTimeline";
import { formatNumerals } from "./formatting";
import { t } from "./i18n";
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
  const timeline = getPrayerTimeline(now, location);
  const times = timeline.prayerTimes;
  const activeIndex = PRAYER_NAMES.indexOf(timeline.current.prayer as PrayerName);
  // Thirty calm minute-clock steps; use dated instants, including midnight/DST.
  // This is decoration only and does not define a religious prayer window.
  const approach = Math.max(0, Math.min(1, 1 - (timeline.next.at - now.getTime()) / (30 * 60_000)));
  const countdown = formatNumerals(
    `${Math.floor(timeline.remainingMinutes / 60)
      .toString()
      .padStart(2, "0")}:${(timeline.remainingMinutes % 60).toString().padStart(2, "0")}`,
    language,
  );

  return PRAYER_NAMES.map((prayer, index) => {
    const isNext = prayer === timeline.next.prayer;
    const state = index === activeIndex ? "current" : isNext ? "next" : index < activeIndex ? "past" : "upcoming";
    const isOpenable = state === "past" || state === "current" || (isNext && timeline.remainingMinutes <= 30);
    const isRecordable = state === "past" || state === "current";
    return {
      prayer,
      time: (isNext ? timeline.next : state === "current" ? timeline.current : null)?.time ?? times[prayer],
      ...(prayer === "fajr" && times.shrouk ? { shroukTime: times.shrouk } : {}),
      state,
      isOpenable,
      isRecordable,
      emphasis: state === "current" ? 1 - approach * 0.5 : isNext ? 0.15 + approach * 0.85 : 0,
      ...(isNext
        ? {
            countdown: t(language, "prayerTracking.timeLeft", { time: countdown }),
            remainingPercent: timeline.remainingPercent,
          }
        : {}),
    };
  });
}

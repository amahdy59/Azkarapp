import { getEstimatedPrayerTimes, PRAYER_NAMES, formatPrayerTimeLabel } from "../content/prayerTimes";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import { locationCalendarDate, locationTime } from "./reminderPlan";
import type { AppStateSnapshot } from "../types";

export interface WidgetCard {
  title: string;
  body: string;
  route: string;
}
export interface WidgetSnapshot {
  version: 1;
  language: "ar" | "en";
  updatedAt: number;
  validUntil: number;
  cards: WidgetCard[];
}

/** Presentation-only projection: never exports profile, coordinates, credentials or reviewed text. */
export function buildWidgetSnapshot(state: AppStateSnapshot, now = new Date()): WidgetSnapshot {
  const language = state.settings.language;
  const zone = state.settings.location?.timeZone ?? DEFAULT_LOCATION.timeZone ?? "UTC";
  const selectedDate = locationCalendarDate(now, zone);
  const times = getEstimatedPrayerTimes(selectedDate, state.settings.location);
  const tomorrow = new Date(selectedDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const page = state.quranReadingPosition?.page ?? state.khatmahPage ?? 1;
  const count = state.masbahaState?.count ?? 0;
  const target = state.masbahaState?.target ?? 33;
  return {
    version: 1,
    language,
    updatedAt: now.getTime(),
    validUntil: locationTime(tomorrow, "00:00", zone),
    cards: [
      {
        title: t(language, "widgets.prayers"),
        body: PRAYER_NAMES.map(
          (name) => `${t(language, `notifications.${name}`)}  ${formatPrayerTimeLabel(times[name], language === "ar")}`,
        ).join("\n"),
        route: "#/home",
      },
      { title: t(language, "widgets.azkar"), body: t(language, "widgets.azkarBody"), route: "#/azkar" },
      {
        title: t(language, "widgets.quran"),
        body: t(language, "widgets.page", { page: formatNumerals(page, language) }),
        route: `#/quran/${page}`,
      },
      {
        title: t(language, "widgets.counter"),
        body: `${formatNumerals(count, language)} / ${formatNumerals(target, language)}\n${t(language, "widgets.counterBody")}`,
        route: "#/counter",
      },
    ],
  };
}

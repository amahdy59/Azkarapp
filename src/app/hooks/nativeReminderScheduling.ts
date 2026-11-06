import { Capacitor } from "@capacitor/core";
import { notificationCopy } from "../notificationCopy";
import { reminderOccurrences } from "../reminderOccurrences";
import { DEFAULT_PROGRESS_DAY_START_HOUR } from "../progress";
import type { AppLanguage, DailyCollectionCompletion, LocationSettings, ReminderSettings } from "../types";

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

/** Read-only scheduling diagnostic retained for existing callers. */
export function getUpcomingNativeReminders(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  language: AppLanguage,
  location: LocationSettings | undefined,
  now = new Date(),
  horizonDays = 14,
) {
  return reminderOccurrences(reminders, dailyCompletions, location, DEFAULT_PROGRESS_DAY_START_HOUR, now, horizonDays)
    .filter((event) => event.at > now.getTime())
    .map((event, index) => {
      const { title, body } = notificationCopy(language, event, event.dateKey, event.prayerTime);
      return {
        id: 10_000 + index,
        title,
        body,
        at: new Date(event.at),
        kind: event.kind === "prayer" ? `prayer:${event.prayer}` : event.kind,
        dayKey: event.dateKey,
        route: event.route,
      };
    });
}

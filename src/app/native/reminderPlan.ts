import { notificationCopy } from "../notificationCopy";
import { reminderOccurrences } from "../reminderOccurrences";
import type { AppStateSnapshot } from "../types";

export { locationTime, locationCalendarDate } from "../content/locationTime";

export interface NativeReminder {
  id: number;
  title: string;
  body: string;
  at: number;
  route: string;
}

const EVENT_KINDS = [
  "prayer:fajr",
  "prayer:dhuhr",
  "prayer:asr",
  "prayer:maghrib",
  "prayer:isha",
  "morning",
  "evening",
  "before_sleep",
  "after_prayer",
  "friday",
  "fridayDua",
  "beforeFajrDua",
  "fridaySalawat",
  "fastingPreparation",
] as const;

/** The sole active Android queue, rebuilt serially by replaceNativeReminders. */
export function buildNativeReminderPlan(state: AppStateSnapshot, now = new Date()): NativeReminder[] {
  const { language, reminders, location, progressDayStartHour, hijriDateOffset } = state.settings;
  return reminderOccurrences(reminders, state.dailyCompletions, location, progressDayStartHour, now, 7, hijriDateOffset)
    .filter((event) => event.at > now.getTime())
    .map((event) => {
      const { title, body } = notificationCopy(language, event, event.dateKey, event.prayerTime);
      const kind = event.kind === "prayer" ? (`prayer:${event.prayer}` as const) : event.kind;
      // A 32-day ring is collision-free within the seven-day replacement queue.
      const day = Math.floor(Date.parse(event.dateKey + "T12:00:00Z") / 86_400_000);
      const id = 10_000 + (((day % 32) + 32) % 32) * 16 + EVENT_KINDS.indexOf(kind);
      return { id, title, body, at: event.at, route: event.route };
    });
}

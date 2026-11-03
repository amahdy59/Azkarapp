import { getEstimatedPrayerTimes, PRAYER_NAMES } from "../content/prayerTimes";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import { getProgressDayKey } from "../progress";
import { notificationCopy } from "../notificationCopy";
import type { AppStateSnapshot } from "../types";
import { locationTime, locationCalendarDate } from "../content/locationTime";
import { contextReminderPlan } from "../contextReminders";

export { locationTime, locationCalendarDate } from "../content/locationTime";

export interface NativeReminder {
  id: number;
  title: string;
  body: string;
  at: number;
  route: string;
}

/** A bounded, replaceable seven-day queue. Native storage contains no coordinates or profile. */
export function buildNativeReminderPlan(state: AppStateSnapshot, now = new Date()): NativeReminder[] {
  const { language, reminders, location, progressDayStartHour } = state.settings;
  const zone = location?.timeZone ?? DEFAULT_LOCATION.timeZone ?? "UTC";
  const first = locationCalendarDate(now, zone);
  const result: NativeReminder[] = [];
  let id = 10_000;
  for (let day = 0; day < 7; day++) {
    const date = new Date(first);
    date.setDate(date.getDate() + day);
    const times = getEstimatedPrayerTimes(date, location);
    const add = (at: number, copy: { title: string; body: string }, route: string) => {
      const nextId = id++;
      if (at > now.getTime()) result.push({ id: nextId, ...copy, at, route });
    };
    if (reminders.prayer.enabled)
      for (const prayer of PRAYER_NAMES) {
        if (reminders.prayer.prayers && !reminders.prayer.prayers.includes(prayer)) continue;
        add(
          locationTime(date, times[prayer], zone) - reminders.prayer.leadMinutes * 60_000,
          notificationCopy(language, { kind: "prayer", prayer, leadMinutes: reminders.prayer.leadMinutes }),
          "#/azkar/after-prayer",
        );
      }
    for (const kind of ["morning", "evening", "before_sleep", "after_prayer"] as const) {
      if (!reminders[kind].enabled) continue;
      // Routine reminders follow the user's device clock, matching the web contract.
      const local = new Date(now);
      local.setDate(local.getDate() + day);
      const [hours = 0, minutes = 0] = reminders[kind].time.split(":").map(Number);
      local.setHours(hours, minutes, 0, 0);
      const key = getProgressDayKey(local, progressDayStartHour);
      if (
        reminders.onlyWhenIncomplete &&
        state.dailyCompletions.some((entry) => entry.category === kind && entry.dayKey === key)
      )
        continue;
      add(local.getTime(), notificationCopy(language, { kind }), `#/azkar/${kind.replaceAll("_", "-")}`);
    }
  }
  contextReminderPlan(reminders, location, now).forEach((event, index) => {
    if (event.at > now.getTime() && event.at < now.getTime() + 7 * 86_400_000)
      result.push({
        id: 19_000 + index,
        at: event.at,
        route: event.route,
        ...notificationCopy(language, event),
      });
  });
  return result.sort((a, b) => a.at - b.at);
}

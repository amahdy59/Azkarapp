import { getEstimatedPrayerTimes, PRAYER_NAMES } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { contextReminderPlan, type ContextReminderKind } from "./contextReminders";
import { getProgressDayKey } from "./progress";
import { routeToHash } from "./routing";
import type { DailyCollectionCompletion, LocationSettings, PrayerName, ReminderSettings } from "./types";

export const REMINDER_WINDOW_MS = 5 * 60_000;
const ROUTINES = ["morning", "evening", "before_sleep", "after_prayer"] as const;
export type ReminderOccurrence = {
  key: string;
  at: number;
  expiresAt: number;
  dateKey: string;
  route: string;
  prayerTime?: string;
} & (
  | { kind: "prayer"; prayer: PrayerName; leadMinutes: number }
  | { kind: (typeof ROUTINES)[number] | ContextReminderKind }
);

/** One dated plan for browser and Android. Routine clocks remain device-local. */
export function reminderOccurrences(
  reminders: ReminderSettings,
  completions: DailyCollectionCompletion[],
  location: LocationSettings | undefined,
  progressDayStartHour: number,
  now: Date,
  horizonDays = 7,
  hijriOffset = 0,
): ReminderOccurrence[] {
  const zone = location?.timeZone || DEFAULT_LOCATION.timeZone || "UTC";
  const first = locationCalendarDate(now, zone);
  const result: ReminderOccurrence[] = [];
  for (let offset = -1; offset < horizonDays; offset++) {
    const date = new Date(first);
    date.setDate(date.getDate() + offset);
    const dateKey = getProgressDayKey(date, 0);
    if (reminders.prayer.enabled) {
      const times = getEstimatedPrayerTimes(date, location);
      for (const prayer of PRAYER_NAMES) {
        if (reminders.prayer.prayers && !reminders.prayer.prayers.includes(prayer)) continue;
        const prayerAt = locationTime(date, times[prayer], zone);
        const at = prayerAt - reminders.prayer.leadMinutes * 60_000;
        result.push({
          kind: "prayer",
          prayer,
          leadMinutes: reminders.prayer.leadMinutes,
          key: `prayer:${prayer}:${dateKey}`,
          at,
          dateKey,
          prayerTime: times[prayer],
          expiresAt:
            reminders.prayer.leadMinutes > 0 ? Math.min(at + REMINDER_WINDOW_MS, prayerAt) : at + REMINDER_WINDOW_MS,
          route: routeToHash({ view: "prayer", prayer })!,
        });
      }
    }
    const local = new Date(now);
    local.setDate(local.getDate() + offset);
    for (const kind of ROUTINES) {
      if (!reminders[kind].enabled) continue;
      const [hour, minute] = reminders[kind].time.split(":").map(Number);
      local.setHours(hour!, minute!, 0, 0);
      const progressDay = getProgressDayKey(local, progressDayStartHour);
      if (
        reminders.onlyWhenIncomplete &&
        completions.some((entry) => entry.category === kind && entry.dayKey === progressDay)
      )
        continue;
      const routineDate = getProgressDayKey(local, 0);
      result.push({
        kind,
        key: `${kind}:${routineDate}`,
        dateKey: routineDate,
        at: local.getTime(),
        expiresAt: local.getTime() + REMINDER_WINDOW_MS,
        route: routeToHash({ view: "category", categoryId: kind })!,
      });
    }
  }
  for (const event of contextReminderPlan(reminders, location, now, hijriOffset)) {
    const dateKey = getProgressDayKey(locationCalendarDate(new Date(event.at), zone), 0);
    result.push({ ...event, dateKey, key: `${event.kind}:${dateKey}`, expiresAt: event.expiresAt });
  }
  return result
    .filter((event) => event.expiresAt > now.getTime() && event.at < now.getTime() + horizonDays * 86_400_000)
    .sort((a, b) => a.at - b.at);
}

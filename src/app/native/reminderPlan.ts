import { getEstimatedPrayerTimes, PRAYER_NAMES } from "../content/prayerTimes";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import { getProgressDayKey } from "../progress";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppStateSnapshot } from "../types";
import { locationTime, locationCalendarDate } from "../content/locationTime";

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
    const add = (at: number, title: string, body: string, route: string) => {
      const nextId = id++;
      if (at > now.getTime()) result.push({ id: nextId, title, body, at, route });
    };
    if (reminders.prayer.enabled)
      for (const prayer of PRAYER_NAMES) {
        if (reminders.prayer.prayers && !reminders.prayer.prayers.includes(prayer)) continue;
        const name = t(language, `notifications.${prayer}`);
        add(
          locationTime(date, times[prayer], zone) - reminders.prayer.leadMinutes * 60_000,
          t(language, "notifications.prayerReminderTitle", { prayer: name }),
          t(language, "notifications.prayerReminderBody", {
            prayer: name,
            minutes: formatNumerals(reminders.prayer.leadMinutes, language),
          }),
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
      add(
        local.getTime(),
        t(language, "notifications.testTitle"),
        t(language, `notifications.${kind}`),
        `#/azkar/${kind.replaceAll("_", "-")}`,
      );
    }
  }
  return result.sort((a, b) => a.at - b.at);
}

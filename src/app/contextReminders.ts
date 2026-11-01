import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import type { LocationSettings, ReminderSettings } from "./types";

export const CONTEXT_REMINDER_KINDS = ["friday", "fridayDua", "beforeFajrDua"] as const;
export type ContextReminderKind = (typeof CONTEXT_REMINDER_KINDS)[number];

/** Product reminder times reuse existing Friday/pre-Fajr reading windows. */
export function contextReminderPlan(reminders: ReminderSettings, location: LocationSettings | undefined, now: Date) {
  if (!CONTEXT_REMINDER_KINDS.some((kind) => reminders[kind]?.enabled)) return [];
  const zone = location?.timeZone || DEFAULT_LOCATION.timeZone || "UTC";
  const first = locationCalendarDate(now, zone);
  const events: { kind: ContextReminderKind; at: number; route: string }[] = [];
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(first);
    day.setDate(day.getDate() + offset);
    const times = getEstimatedPrayerTimes(day, location);
    const add = (kind: ContextReminderKind, at: number, route: string) => {
      if (reminders[kind]?.enabled) events.push({ kind, at, route });
    };
    add("beforeFajrDua", locationTime(day, times.fajr, zone) - 20 * 60_000, "#/azkar/comprehensive-duas");
    if (day.getDay() === 5) {
      add("friday", locationTime(day, "09:00", zone), "#/azkar/friday-kahf");
      add("fridayDua", locationTime(day, times.maghrib, zone) - 60 * 60_000, "#/azkar/comprehensive-duas");
    }
  }
  return events.sort((a, b) => a.at - b.at);
}

/** Applied only when a new reader completes onboarding; never overwrite saved choices. */
export function recommendedReminders(current: ReminderSettings): ReminderSettings {
  return {
    ...current,
    prayer: { ...current.prayer, enabled: true },
    morning: { ...current.morning, enabled: true },
    evening: { ...current.evening, enabled: true },
    before_sleep: { ...current.before_sleep, enabled: true },
    after_prayer: { ...current.after_prayer, enabled: true },
    friday: { enabled: true },
    fridayDua: { enabled: true },
    beforeFajrDua: { enabled: true },
  };
}

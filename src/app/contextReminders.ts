import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { locationCalendarDate, locationTime } from "./content/locationTime";
import { DEFAULT_LOCATION } from "./content/prayerCalculation";
import { canSuggestVoluntaryFast } from "./reminderPlan";
import { routeToHash } from "./routing";
import type { LocationSettings, ReminderSettings } from "./types";

export const CONTEXT_REMINDER_KINDS = [
  "friday",
  "fridayDua",
  "beforeFajrDua",
  "fridaySalawat",
  "fastingPreparation",
] as const;
export type ContextReminderKind = (typeof CONTEXT_REMINDER_KINDS)[number];

/** Product clock times use the selected prayer location. */
export function contextReminderPlan(
  reminders: ReminderSettings,
  location: LocationSettings | undefined,
  now: Date,
  hijriOffset = 0,
) {
  if (!CONTEXT_REMINDER_KINDS.some((kind) => reminders[kind]?.enabled)) return [];
  const zone = location?.timeZone || DEFAULT_LOCATION.timeZone || "UTC";
  const first = locationCalendarDate(now, zone);
  const events: { kind: ContextReminderKind; at: number; route: string; expiresAt: number }[] = [];
  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(first);
    day.setDate(day.getDate() + offset);
    const times = getEstimatedPrayerTimes(day, location);
    const add = (kind: ContextReminderKind, at: number, route: string, until = at + 5 * 60_000) => {
      if (reminders[kind]?.enabled) events.push({ kind, at, route, expiresAt: Math.min(at + 5 * 60_000, until) });
    };
    const fajr = locationTime(day, times.fajr, zone);
    const previous = new Date(day);
    previous.setDate(previous.getDate() - 1);
    const sunset = locationTime(previous, getEstimatedPrayerTimes(previous, location).maghrib, zone);
    const beforeFajr = fajr - 20 * 60_000;
    if (beforeFajr >= sunset + ((fajr - sunset) * 2) / 3 && beforeFajr < fajr)
      add("beforeFajrDua", beforeFajr, "#/azkar/comprehensive-duas", fajr);
    const weekday = day.getDay();
    const asr = locationTime(day, times.asr, zone);
    const maghrib = locationTime(day, times.maghrib, zone);
    const buffer = 30 * 60_000;
    if (reminders.fastingPreparation?.enabled && (weekday === 0 || weekday === 3)) {
      const tomorrow = new Date(day);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const preparation = asr + 45 * 60_000;
      if (preparation + 5 * 60_000 <= maghrib - buffer && canSuggestVoluntaryFast(tomorrow, hijriOffset))
        add("fastingPreparation", preparation, routeToHash({ view: "category", categoryId: "fasting_ramadan" })!);
    }
    if (weekday === 5) {
      add("friday", locationTime(day, "09:00", zone), "#/azkar/friday-kahf");
      const salawat = locationTime(day, "10:00", zone);
      const dhuhr = locationTime(day, times.dhuhr, zone);
      const sunrise = times.shrouk ? locationTime(day, times.shrouk, zone) : undefined;
      if (
        sunrise !== undefined &&
        salawat >= Math.max(fajr + buffer, sunrise) &&
        salawat + 5 * 60_000 <= dhuhr - buffer
      )
        add("fridaySalawat", salawat, routeToHash({ view: "friday_salawat" })!);
      const afterAsr = Math.max(maghrib - 60 * 60_000, asr + 60_000);
      if (afterAsr < maghrib) add("fridayDua", afterAsr, "#/azkar/comprehensive-duas", maghrib);
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
    beforeFajrDua: { enabled: current.beforeFajrDua?.enabled === true },
  };
}

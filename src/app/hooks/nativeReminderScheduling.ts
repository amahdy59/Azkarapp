import { Capacitor, registerPlugin } from "@capacitor/core";
import { getEstimatedPrayerTimes, PRAYER_NAMES } from "../content/prayerTimes";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { DEFAULT_PROGRESS_DAY_START_HOUR, getProgressDayKey } from "../progress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  PrayerName,
  ReminderSettings,
} from "../types";

const ANDROID_SCHEDULE_DAYS = 14;
const ANDROID_CHANNEL_ID = "azkarapp-reminders";

type LocalNotificationsPlugin = {
  checkPermissions: () => Promise<{ display: string }>;
  getPending: () => Promise<{ notifications: Array<{ id: number; extra?: Record<string, unknown> }> }>;
  cancel: (options: { notifications: Array<{ id: number }> }) => Promise<void>;
  createChannel: (options: { id: string; name: string; importance: number }) => Promise<void>;
  schedule: (options: { notifications: Array<Record<string, unknown>> }) => Promise<unknown>;
};

const LocalNotifications = registerPlugin<LocalNotificationsPlugin>("LocalNotifications");
type RoutineReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer";
type ReminderHistoryKey = RoutineReminderKind | `prayer:${PrayerName}`;

type ScheduledReminder = {
  id: number;
  title: string;
  body: string;
  at: Date;
  kind: ReminderHistoryKey;
  dayKey: string;
};

export function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

function scheduledTime(now: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  return scheduled;
}

function didCompleteCategoryToday(dailyCompletions: DailyCollectionCompletion[], category: CategoryId, now: Date) {
  const today = getProgressDayKey(now, DEFAULT_PROGRESS_DAY_START_HOUR);
  return dailyCompletions.some((completion) => completion.category === category && completion.dayKey === today);
}

function nativeNotificationId(kind: string, at: Date) {
  let hash = 2166136261;
  for (const character of `${kind}:${at.getTime()}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) & 0x7fffffff;
}

export function getUpcomingNativeReminders(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  language: AppLanguage,
  location: LocationSettings | undefined,
  now = new Date(),
  horizonDays = ANDROID_SCHEDULE_DAYS,
): ScheduledReminder[] {
  const upcoming: ScheduledReminder[] = [];
  const routines: Array<{ kind: RoutineReminderKind; category: CategoryId }> = [
    { kind: "morning", category: "morning" },
    { kind: "evening", category: "evening" },
    { kind: "before_sleep", category: "before_sleep" },
    { kind: "after_prayer", category: "after_prayer" },
  ];
  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const dayKey = getProgressDayKey(date, DEFAULT_PROGRESS_DAY_START_HOUR);
    for (const { kind, category } of routines) {
      if (!reminders[kind].enabled) continue;
      if (dayOffset === 0 && reminders.onlyWhenIncomplete && didCompleteCategoryToday(dailyCompletions, category, now))
        continue;
      const at = scheduledTime(date, reminders[kind].time);
      if (at <= now) continue;
      const title = t(language, `notifications.${kind}Title`);
      upcoming.push({
        id: nativeNotificationId(kind, at),
        title,
        body: `${t(language, "notifications.reminderPrefix")} ${title}`,
        at,
        kind,
        dayKey,
      });
    }
    if (!reminders.prayer.enabled) continue;
    const prayerTimes = getEstimatedPrayerTimes(date, location);
    for (const prayer of PRAYER_NAMES) {
      const at = new Date(scheduledTime(date, prayerTimes[prayer]).getTime() - reminders.prayer.leadMinutes * 60_000);
      if (at <= now) continue;
      const prayerName = t(language, `notifications.${prayer}`);
      upcoming.push({
        id: nativeNotificationId(`prayer:${prayer}`, at),
        title: t(language, "notifications.prayerReminderTitle", { prayer: prayerName }),
        body: t(language, "notifications.prayerReminderBody", {
          prayer: prayerName,
          minutes: formatNumerals(reminders.prayer.leadMinutes, language),
        }),
        at,
        kind: `prayer:${prayer}`,
        dayKey,
      });
    }
  }
  return upcoming.sort((a, b) => a.at.getTime() - b.at.getTime());
}

export async function rescheduleNativeReminders(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  language: AppLanguage,
  location: LocationSettings | undefined,
) {
  if (!isNativeAndroid()) return;
  if ((await LocalNotifications.checkPermissions()).display !== "granted") return;
  const pending = await LocalNotifications.getPending();
  // Older Android builds used the 10,000–19,999 ID range without ownership
  // metadata. Remove those legacy alarms too, otherwise upgrading leaves the
  // old schedule alongside this one and every prayer/Azkar reminder fires twice.
  const owned = pending.notifications.filter(
    (item) => item.extra?.azkarappReminder === true || (item.id >= 10_000 && item.id < 20_000),
  );
  if (owned.length) await LocalNotifications.cancel({ notifications: owned.map(({ id }) => ({ id })) });
  const upcoming = getUpcomingNativeReminders(reminders, dailyCompletions, language, location);
  if (!upcoming.length) return;
  await LocalNotifications.createChannel({ id: ANDROID_CHANNEL_ID, name: "Azkar reminders", importance: 4 });
  await LocalNotifications.schedule({
    notifications: upcoming.map(({ id, title, body, at, kind, dayKey }) => ({
      id,
      title,
      body,
      schedule: { at, allowWhileIdle: true, isExactNotification: true },
      channelId: ANDROID_CHANNEL_ID,
      extra: { azkarappReminder: true, kind, dayKey },
    })),
  });
}

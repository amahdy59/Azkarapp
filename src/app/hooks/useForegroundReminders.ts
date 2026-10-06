import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { getEstimatedPrayerTimes, PRAYER_NAMES, type PrayerTimes } from "../content/prayerTimes";
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

const REMINDER_HISTORY_KEY = "azkarapp.foreground-reminders.v1";
const REMINDER_WINDOW_MS = 5 * 60_000;
const MAX_TIMEOUT_MS = 2_147_000_000;
const ANDROID_SCHEDULE_DAYS = 14;
const ANDROID_CHANNEL_ID = "azkarapp-reminders";

type RoutineReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer";
type ReminderHistoryKey = RoutineReminderKind | `prayer:${PrayerName}`;

export type DueReminder =
  { kind: RoutineReminderKind; category: CategoryId } | { kind: "prayer"; prayer: PrayerName; leadMinutes: 10 | 15 };

export function synchronizeReminderTimes(reminders: ReminderSettings, prayerTimes: PrayerTimes): ReminderSettings {
  return {
    ...reminders,
    morning: { ...reminders.morning, time: prayerTimes.fajr },
    evening: { ...reminders.evening, time: prayerTimes.asr },
    before_sleep: { ...reminders.before_sleep, time: prayerTimes.isha },
  };
}

export function getLocationBasedReminders(
  reminders: ReminderSettings,
  location: LocationSettings,
  date = new Date(),
): ReminderSettings {
  return synchronizeReminderTimes(reminders, getEstimatedPrayerTimes(date, location));
}

function didCompleteCategoryToday(
  dailyCompletions: DailyCollectionCompletion[],
  category: CategoryId,
  now: Date,
  progressDayStartHour: number,
) {
  const today = getProgressDayKey(now, progressDayStartHour);
  return dailyCompletions.some((completion) => completion.category === category && completion.dayKey === today);
}

function scheduledTime(now: Date, time: string, dayOffset = 0) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const scheduled = new Date(now);
  scheduled.setDate(scheduled.getDate() + dayOffset);
  scheduled.setHours(hours, minutes, 0, 0);
  return scheduled;
}

function hasReachedReminderTime(now: Date, time: string) {
  const scheduled = scheduledTime(now, time);
  const elapsed = now.getTime() - scheduled.getTime();
  return elapsed >= 0 && elapsed < REMINDER_WINDOW_MS;
}

function reminderHistoryKey(reminder: DueReminder): ReminderHistoryKey {
  return reminder.kind === "prayer" ? `prayer:${reminder.prayer}` : reminder.kind;
}

export function getDuePrayerReminder(
  reminders: ReminderSettings,
  location: LocationSettings | undefined,
  now = new Date(),
  wasAlreadyNotified: (key: ReminderHistoryKey) => boolean = () => false,
): DueReminder | null {
  if (!reminders.prayer.enabled) return null;

  const times = getEstimatedPrayerTimes(now, location);
  for (const prayer of PRAYER_NAMES) {
    const notificationTime = new Date(
      scheduledTime(now, times[prayer]).getTime() - reminders.prayer.leadMinutes * 60_000,
    );
    const elapsed = now.getTime() - notificationTime.getTime();
    const key = `prayer:${prayer}` as const;
    if (elapsed >= 0 && elapsed < REMINDER_WINDOW_MS && !wasAlreadyNotified(key)) {
      return { kind: "prayer", prayer, leadMinutes: reminders.prayer.leadMinutes };
    }
  }
  return null;
}

export function getDueReminder(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  now = new Date(),
  progressDayStartHour = DEFAULT_PROGRESS_DAY_START_HOUR,
  wasAlreadyNotified: (kind: RoutineReminderKind) => boolean = () => false,
): DueReminder | null {
  const candidates: Array<{ kind: RoutineReminderKind; category: CategoryId }> = [
    { kind: "morning", category: "morning" },
    { kind: "evening", category: "evening" },
    { kind: "before_sleep", category: "before_sleep" },
    { kind: "after_prayer", category: "after_prayer" },
  ];

  for (const candidate of candidates) {
    const schedule = reminders[candidate.kind];
    if (!schedule.enabled || !hasReachedReminderTime(now, schedule.time) || wasAlreadyNotified(candidate.kind)) {
      continue;
    }
    if (
      reminders.onlyWhenIncomplete &&
      didCompleteCategoryToday(dailyCompletions, candidate.category, now, progressDayStartHour)
    ) {
      continue;
    }
    return candidate;
  }

  return null;
}

/** Milliseconds until the next configured reminder; used instead of polling. */
export function getNextReminderDelay(
  reminders: ReminderSettings,
  location: LocationSettings | undefined,
  now = new Date(),
): number | null {
  const candidates: number[] = [];
  for (const kind of ["morning", "evening", "before_sleep", "after_prayer"] as const) {
    if (!reminders[kind].enabled) continue;
    for (const dayOffset of [0, 1]) {
      const at = scheduledTime(now, reminders[kind].time, dayOffset).getTime();
      if (at > now.getTime()) candidates.push(at);
    }
  }
  if (reminders.prayer.enabled) {
    for (const dayOffset of [0, 1]) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);
      const times = getEstimatedPrayerTimes(date, location);
      for (const prayer of PRAYER_NAMES) {
        const at = scheduledTime(now, times[prayer], dayOffset).getTime() - reminders.prayer.leadMinutes * 60_000;
        if (at > now.getTime()) candidates.push(at);
      }
    }
  }
  return candidates.length > 0 ? Math.min(...candidates) - now.getTime() : null;
}

type ScheduledReminder = {
  id: number;
  title: string;
  body: string;
  at: Date;
  kind: ReminderHistoryKey;
  dayKey: string;
};

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
      if (
        dayOffset === 0 &&
        reminders.onlyWhenIncomplete &&
        didCompleteCategoryToday(dailyCompletions, category, now, DEFAULT_PROGRESS_DAY_START_HOUR)
      )
        continue;
      const at = scheduledTime(date, reminders[kind].time);
      if (at <= now) continue;
      upcoming.push({
        id: nativeNotificationId(kind, at),
        title: "Azkar",
        body: t(language, `notifications.${kind}`),
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

async function rescheduleNativeReminders(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  language: AppLanguage,
  location: LocationSettings | undefined,
) {
  if ((await LocalNotifications.checkPermissions()).display !== "granted") return;
  const pending = await LocalNotifications.getPending();
  const owned = pending.notifications.filter((item) => item.extra?.azkarappReminder === true);
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

function readReminderHistory() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REMINDER_HISTORY_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function hasAlreadyNotified(key: ReminderHistoryKey, now: Date, progressDayStartHour: number) {
  return readReminderHistory()[key] === getProgressDayKey(now, progressDayStartHour);
}

function recordNotification(key: ReminderHistoryKey, now: Date, progressDayStartHour: number) {
  const history = readReminderHistory();
  history[key] = getProgressDayKey(now, progressDayStartHour);
  try {
    window.localStorage.setItem(REMINDER_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Notification delivery should not fail when history storage is unavailable.
  }
}

async function deliverNotification(reminder: DueReminder, language: AppLanguage, dayKey: string) {
  const isPrayer = reminder.kind === "prayer";
  const prayerName = isPrayer ? t(language, `notifications.${reminder.prayer}`) : "";
  const body = isPrayer
    ? t(language, "notifications.prayerReminderBody", {
        prayer: prayerName,
        minutes: formatNumerals(reminder.leadMinutes, language),
      })
    : t(language, `notifications.${reminder.kind}`);
  const title = isPrayer ? t(language, "notifications.prayerReminderTitle", { prayer: prayerName }) : "Azkar";
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return false;
    const options: NotificationOptions = {
      body,
      tag: `azkar-${reminderHistoryKey(reminder).replace(":", "-")}-${dayKey}`,
      lang: language,
      dir: language === "ar" ? "rtl" : "ltr",
    };
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Android reminders are owned by OS alarms. The web app retains its
 * best-effort timer/service-worker behavior because browsers cannot schedule OS alarms.
 */
export function useForegroundReminders({
  reminders,
  dailyCompletions,
  progressDayStartHour,
  language,
  location,
}: {
  reminders: ReminderSettings;
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  language: AppLanguage;
  location?: LocationSettings;
}) {
  useEffect(() => {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
      void rescheduleNativeReminders(reminders, dailyCompletions, language, location).catch(() => {
        // Notification denial or OS scheduling failure must not interrupt app startup.
      });
      return;
    }

    let isDelivering = false;
    let cancelled = false;
    let timerId: number | undefined;

    const scheduleNextCheck = () => {
      if (cancelled) return;
      if (timerId !== undefined) window.clearTimeout(timerId);
      const delay = getNextReminderDelay(reminders, location);
      if (delay === null) return;
      timerId = window.setTimeout(() => void notifyIfDue(), Math.min(MAX_TIMEOUT_MS, Math.max(1_000, delay + 100)));
    };

    const notifyIfDue = async () => {
      if (cancelled || isDelivering) return;

      if (!("Notification" in window) || Notification.permission !== "granted") return scheduleNextCheck();

      const now = new Date();
      const wasAlreadyNotified = (key: ReminderHistoryKey) => hasAlreadyNotified(key, now, progressDayStartHour);
      const due =
        getDuePrayerReminder(reminders, location, now, wasAlreadyNotified) ??
        getDueReminder(reminders, dailyCompletions, now, progressDayStartHour, wasAlreadyNotified);
      if (!due) return scheduleNextCheck();

      isDelivering = true;
      const delivered = await deliverNotification(due, language, getProgressDayKey(now, progressDayStartHour));
      isDelivering = false;
      if (cancelled) return;
      if (delivered) {
        recordNotification(reminderHistoryKey(due), now, progressDayStartHour);
        // Drain another reminder that shares the same minute before sleeping
        // until tomorrow (for example Fajr and the Morning collection).
        timerId = window.setTimeout(() => void notifyIfDue(), 250);
        return;
      }
      timerId = window.setTimeout(() => void notifyIfDue(), 60_000);
    };

    void notifyIfDue();
    const reconcileWhenVisible = () => {
      if (document.visibilityState === "visible") void notifyIfDue();
    };
    document.addEventListener("visibilitychange", reconcileWhenVisible);
    window.addEventListener("focus", reconcileWhenVisible);
    return () => {
      cancelled = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", reconcileWhenVisible);
      window.removeEventListener("focus", reconcileWhenVisible);
    };
  }, [dailyCompletions, language, location, progressDayStartHour, reminders]);
}

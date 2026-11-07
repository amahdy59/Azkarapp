import { useEffect } from "react";
import { CONTEXT_REMINDER_KINDS, type ContextReminderKind } from "../contextReminders";
import { reminderOccurrences, REMINDER_WINDOW_MS, type ReminderOccurrence } from "../reminderOccurrences";
import { isNativeAndroid } from "@azkar/native-reminders";
import { readNotificationPermission, showBrowserNotification } from "../notifications";
import { getEstimatedPrayerTimes, type PrayerTimes } from "../content/prayerTimes";
import { notificationCopy } from "../notificationCopy";
import { DEFAULT_PROGRESS_DAY_START_HOUR, getProgressDayKey } from "../progress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  PrayerName,
  PrayerReminderLeadMinutes,
  ReminderSettings,
} from "../types";

const REMINDER_HISTORY_KEY = "azkarapp.foreground-reminders.v1";
const MAX_TIMEOUT_MS = 2_147_000_000;

export { getUpcomingNativeReminders } from "@azkar/native-reminders";

type RoutineReminderKind = "morning" | "evening" | "before_sleep" | "after_prayer";
type ReminderHistoryKey = RoutineReminderKind | ContextReminderKind | `prayer:${PrayerName}`;

export type DueReminder =
  | { kind: ContextReminderKind; category: "comprehensive_duas" | "friday_kahf" }
  | { kind: RoutineReminderKind; category: CategoryId }
  | { kind: "prayer"; prayer: PrayerName; leadMinutes: PrayerReminderLeadMinutes };

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

export function getDuePrayerReminder(
  reminders: ReminderSettings,
  location: LocationSettings | undefined,
  now = new Date(),
  wasAlreadyNotified: (key: ReminderHistoryKey) => boolean = () => false,
): DueReminder | null {
  const event = reminderOccurrences(reminders, [], location, DEFAULT_PROGRESS_DAY_START_HOUR, now, 1).find(
    (event) => event.kind === "prayer" && event.at <= now.getTime() && !wasAlreadyNotified(`prayer:${event.prayer}`),
  );
  return event?.kind === "prayer"
    ? {
        kind: "prayer",
        prayer: event.prayer,
        leadMinutes: event.leadMinutes as PrayerReminderLeadMinutes,
      }
    : null;
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
  hijriDateOffset = 0,
): number | null {
  const horizon = CONTEXT_REMINDER_KINDS.some((kind) => reminders[kind]?.enabled) ? 8 : 2;
  const next = reminderOccurrences(
    reminders,
    [],
    location,
    DEFAULT_PROGRESS_DAY_START_HOUR,
    now,
    horizon,
    hijriDateOffset,
  ).find((event) => event.at > now.getTime());
  return next ? next.at - now.getTime() : null;
}

function readReminderHistory() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REMINDER_HISTORY_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Same-realm fallback when Web Locks is unavailable. Web Locks coordinates tabs.
const pendingDeliveries = new Set<string>();
const deliveredInSession = new Map<string, string>();

function wasDelivered(event: ReminderOccurrence, progressDayStartHour: number) {
  const history = readReminderHistory();
  const legacyKey = event.kind === "prayer" ? `prayer:${event.prayer}` : event.kind;
  return (
    deliveredInSession.has(event.key) ||
    Boolean(history[event.key]) ||
    history[legacyKey] === getProgressDayKey(new Date(event.at), progressDayStartHour)
  );
}

async function deliverOccurrence(
  event: ReminderOccurrence,
  language: AppLanguage,
  progressDayStartHour: number,
  isCurrent: () => boolean,
) {
  const run = async () => {
    if (!isCurrent() || wasDelivered(event, progressDayStartHour) || pendingDeliveries.has(event.key)) return false;
    pendingDeliveries.add(event.key);
    try {
      const { title, body } = notificationCopy(language, event, event.dateKey, event.prayerTime);
      const sent = await showBrowserNotification(
        title,
        {
          body,
          tag: `azkar-${event.key}`,
          lang: language,
          dir: language === "ar" ? "rtl" : "ltr",
          icon: `${window.location.origin}${import.meta.env.BASE_URL}192.png`,
          badge: `${window.location.origin}${import.meta.env.BASE_URL}192.png`,
          data: { url: `${import.meta.env.BASE_URL}${event.route}` },
        },
        () => isCurrent() && Date.now() < event.expiresAt,
      );
      if (sent) {
        deliveredInSession.set(event.key, event.dateKey);
        // Keep dated dedupe separate from progress-day rollover at 04:00.
        const history = readReminderHistory();
        history[event.key] = event.dateKey;
        const oldest = new Date(Date.now() - 8 * 86_400_000).toISOString().slice(0, 10);
        for (const key of Object.keys(history)) if (history[key]! < oldest) delete history[key];
        for (const [key, date] of deliveredInSession) if (date < oldest) deliveredInSession.delete(key);
        try {
          window.localStorage.setItem(REMINDER_HISTORY_KEY, JSON.stringify(history));
        } catch {
          /* Storage may be unavailable. */
        }
      }
      return sent;
    } finally {
      pendingDeliveries.delete(event.key);
    }
  };
  return navigator.locks ? navigator.locks.request(`azkar-reminder-${event.key}`, run).catch(() => false) : run();
}

/**
 * Sends an opt-in browser notification when a configured reminder is due.
 * Browser tabs cannot guarantee background scheduling; a push service is still
 * required for dependable delivery after the app has been closed.
 */
export function useForegroundReminders({
  reminders,
  dailyCompletions,
  progressDayStartHour,
  language,
  location,
  hijriDateOffset = 0,
}: {
  reminders: ReminderSettings;
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  language: AppLanguage;
  location?: LocationSettings;
  hijriDateOffset?: number;
}) {
  useEffect(() => {
    // useNativeServices owns the Android queue. A second owner delivered duplicate prayers.
    if (isNativeAndroid()) return;
    let isDelivering = false;
    let cancelled = false;
    let timerId: number | undefined;

    const scheduleNextCheck = () => {
      if (cancelled) return;
      if (timerId !== undefined) window.clearTimeout(timerId);
      const delay = getNextReminderDelay(reminders, location, new Date(), hijriDateOffset);
      // Weekly reminders may be temporarily excluded by the calendar.
      if (delay === null && !CONTEXT_REMINDER_KINDS.some((kind) => reminders[kind]?.enabled)) return;
      const nextCheck = delay === null ? 86_400_000 : Math.max(1_000, delay + 100);
      timerId = window.setTimeout(() => void notifyIfDue(), Math.min(MAX_TIMEOUT_MS, nextCheck));
    };

    const notifyIfDue = async () => {
      if (cancelled || isDelivering) {
        return;
      }
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (readNotificationPermission() !== "granted") return;
      const now = new Date();
      const due = reminderOccurrences(
        reminders,
        dailyCompletions,
        location,
        progressDayStartHour,
        now,
        2,
        hijriDateOffset,
      ).find((event) => event.at <= now.getTime() && !wasDelivered(event, progressDayStartHour));
      if (!due) return scheduleNextCheck();

      isDelivering = true;
      const delivered = await deliverOccurrence(due, language, progressDayStartHour, () => !cancelled);
      isDelivering = false;
      if (cancelled) return;
      if (delivered) {
        // Drain another reminder that shares the same minute before sleeping
        // until tomorrow (for example Fajr and the Morning collection).
        timerId = window.setTimeout(() => void notifyIfDue(), 250);
        return;
      }
      // A transient service-worker failure should retry inside the delivery
      // window without returning to the old continuous polling loop.
      timerId = window.setTimeout(() => void notifyIfDue(), 60_000);
    };

    void notifyIfDue();
    const reconcileWhenVisible = () => {
      if (document.visibilityState === "visible") void notifyIfDue();
    };
    document.addEventListener("visibilitychange", reconcileWhenVisible);
    window.addEventListener("focus", reconcileWhenVisible);
    window.addEventListener("azkar-notification-permission", reconcileWhenVisible);
    return () => {
      cancelled = true;
      if (timerId !== undefined) window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", reconcileWhenVisible);
      window.removeEventListener("focus", reconcileWhenVisible);
      window.removeEventListener("azkar-notification-permission", reconcileWhenVisible);
    };
  }, [dailyCompletions, language, location, progressDayStartHour, reminders, hijriDateOffset]);
}

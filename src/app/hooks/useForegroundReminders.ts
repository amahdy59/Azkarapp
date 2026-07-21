import { useEffect } from "react";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, ReminderSettings } from "../types";

const REMINDER_HISTORY_KEY = "azkarapp.foreground-reminders.v1";
const REMINDER_WINDOW_MS = 90_000;

type ReminderKind = "morning" | "evening" | "before_sleep";

type DueReminder = {
  kind: ReminderKind;
  category: CategoryId;
};

function didCompleteCategoryToday(
  dailyCompletions: DailyCollectionCompletion[],
  category: CategoryId,
  now: Date,
  progressDayStartHour: number,
) {
  const today = getProgressDayKey(now, progressDayStartHour);
  return dailyCompletions.some((completion) => completion.category === category && completion.dayKey === today);
}

function hasReachedReminderTime(now: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  const elapsed = now.getTime() - scheduled.getTime();
  return elapsed >= 0 && elapsed < REMINDER_WINDOW_MS;
}

export function getDueReminder(
  reminders: ReminderSettings,
  dailyCompletions: DailyCollectionCompletion[],
  now = new Date(),
  progressDayStartHour = 4,
  wasAlreadyNotified: (kind: ReminderKind) => boolean = () => false,
): DueReminder | null {
  const candidates: Array<{ kind: ReminderKind; category: CategoryId }> = [
    { kind: "morning", category: "morning" },
    { kind: "evening", category: "evening" },
    { kind: "before_sleep", category: "before_sleep" },
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

function readReminderHistory() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REMINDER_HISTORY_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function hasAlreadyNotified(kind: ReminderKind, now: Date, progressDayStartHour: number) {
  return readReminderHistory()[kind] === getProgressDayKey(now, progressDayStartHour);
}

function recordNotification(kind: ReminderKind, now: Date, progressDayStartHour: number) {
  const history = readReminderHistory();
  history[kind] = getProgressDayKey(now, progressDayStartHour);
  try {
    window.localStorage.setItem(REMINDER_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Notification delivery should not fail when history storage is unavailable.
  }
}

async function deliverNotification(kind: ReminderKind, language: AppLanguage, dayKey: string) {
  const options: NotificationOptions = {
    body: t(language, `notifications.${kind}`),
    tag: `azkar-${kind}-${dayKey}`,
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification("Azkar", options);
        return true;
      }
    }

    new Notification("Azkar", options);
    return true;
  } catch {
    // Some mobile browsers expose Notification but only permit service-worker delivery.
    return false;
  }
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
}: {
  reminders: ReminderSettings;
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  language: AppLanguage;
}) {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    let isDelivering = false;
    const notifyIfDue = async () => {
      if (isDelivering) {
        return;
      }
      const now = new Date();
      const due = getDueReminder(reminders, dailyCompletions, now, progressDayStartHour, (kind) =>
        hasAlreadyNotified(kind, now, progressDayStartHour),
      );
      if (!due) {
        return;
      }

      isDelivering = true;
      const delivered = await deliverNotification(due.kind, language, getProgressDayKey(now, progressDayStartHour));
      isDelivering = false;
      if (delivered) {
        recordNotification(due.kind, now, progressDayStartHour);
      }
    };

    void notifyIfDue();
    const interval = window.setInterval(() => void notifyIfDue(), 30_000);
    return () => window.clearInterval(interval);
  }, [dailyCompletions, language, progressDayStartHour, reminders]);
}

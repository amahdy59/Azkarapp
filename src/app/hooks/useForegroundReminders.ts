import { useEffect } from "react";
import { t } from "../i18n";
import type { AppLanguage, CategoryId, ReminderSettings, StoredSession } from "../types";

const REMINDER_HISTORY_KEY = "azkarapp.foreground-reminders.v1";
const REMINDER_WINDOW_MS = 90_000;

type ReminderKind = "morning" | "evening";

type DueReminder = {
  kind: ReminderKind;
  category: CategoryId;
};

function localDayKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

function didCompleteCategoryToday(sessions: StoredSession[], category: CategoryId, now: Date) {
  const today = localDayKey(now);
  return sessions.some(
    (session) =>
      session.isComplete && session.category === category && localDayKey(new Date(session.completedAt)) === today,
  );
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
  sessions: StoredSession[],
  now = new Date(),
): DueReminder | null {
  const candidates: Array<{ kind: ReminderKind; category: CategoryId }> = [
    { kind: "morning", category: "morning" },
    { kind: "evening", category: "evening" },
  ];

  for (const candidate of candidates) {
    const schedule = reminders[candidate.kind];
    if (!schedule.enabled || !hasReachedReminderTime(now, schedule.time)) {
      continue;
    }
    if (reminders.onlyWhenIncomplete && didCompleteCategoryToday(sessions, candidate.category, now)) {
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

function hasAlreadyNotified(kind: ReminderKind, now: Date) {
  return readReminderHistory()[kind] === localDayKey(now);
}

function recordNotification(kind: ReminderKind, now: Date) {
  const history = readReminderHistory();
  history[kind] = localDayKey(now);
  try {
    window.localStorage.setItem(REMINDER_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Notification delivery should not fail when history storage is unavailable.
  }
}

/**
 * Sends an opt-in browser notification when a configured reminder is due.
 * Browser tabs cannot guarantee background scheduling; a push service is still
 * required for dependable delivery after the app has been closed.
 */
export function useForegroundReminders({
  reminders,
  sessions,
  language,
}: {
  reminders: ReminderSettings;
  sessions: StoredSession[];
  language: AppLanguage;
}) {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const notifyIfDue = () => {
      const now = new Date();
      const due = getDueReminder(reminders, sessions, now);
      if (!due || hasAlreadyNotified(due.kind, now)) {
        return;
      }

      new Notification("Azkar", {
        body: t(language, `notifications.${due.kind}`),
        tag: `azkar-${due.kind}-${localDayKey(now)}`,
      });
      recordNotification(due.kind, now);
    };

    notifyIfDue();
    const interval = window.setInterval(notifyIfDue, 30_000);
    return () => window.clearInterval(interval);
  }, [language, reminders, sessions]);
}

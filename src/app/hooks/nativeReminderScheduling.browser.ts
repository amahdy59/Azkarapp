import type { AppLanguage, DailyCollectionCompletion, LocationSettings, ReminderSettings } from "../types";

export function isNativeAndroid() {
  return false;
}

export function getUpcomingNativeReminders() {
  return [];
}

export async function rescheduleNativeReminders(
  _reminders: ReminderSettings,
  _dailyCompletions: DailyCollectionCompletion[],
  _language: AppLanguage,
  _location: LocationSettings | undefined,
) {
  // Native alarms are not part of the browser/PWA runtime.
}

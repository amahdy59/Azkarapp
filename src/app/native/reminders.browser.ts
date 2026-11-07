export async function initializeNativeNotifications() {
  // Browser notifications use the existing web scheduler.
}

export async function inspectNativeReminderQueue() {
  return { failed: false, count: 0 };
}

export async function refreshNativeExactAlarmPermission(_request = false): Promise<NotificationPermission> {
  return "default";
}

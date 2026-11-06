import { useCallback, useEffect, useRef, useState } from "react";
import { isNativeAndroid } from "../native/platform";
import { inspectNativeReminderQueue, refreshNativeExactAlarmPermission } from "../native/reminders";

/** Reads actual native state. It never schedules alarms or requests permission on mount. */
export function useNotificationReadiness() {
  const [readiness, setReadiness] = useState<{
    status: "checking" | "ready" | "error";
    count: number;
    exact: NotificationPermission;
  }>({ status: "checking", count: 0, exact: "default" });
  const mounted = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async (request = false) => {
    if (!isNativeAndroid()) return;
    const version = ++generation.current;
    try {
      const [queue, exact] = await Promise.all([
        inspectNativeReminderQueue(),
        refreshNativeExactAlarmPermission(request),
      ]);
      if (mounted.current && version === generation.current)
        setReadiness({ status: queue.failed ? "error" : "ready", count: queue.count, exact });
    } catch {
      if (mounted.current && version === generation.current) setReadiness((value) => ({ ...value, status: "error" }));
    }
  }, []);
  useEffect(() => {
    ++generation.current;
    mounted.current = true;
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    visible();
    window.addEventListener("azkar-reminder-queue", visible);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      mounted.current = false;
      window.removeEventListener("azkar-reminder-queue", visible);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh]);
  return { ...readiness, refresh };
}

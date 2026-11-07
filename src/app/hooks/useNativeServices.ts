import { useEffect, useRef, useState } from "react";
import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { isNativeAndroid } from "../native/platform";
import { buildWidgetSnapshot, type WidgetSnapshot } from "../native/widgetSnapshot";
import { buildNativeReminderPlan } from "../native/reminderPlan";
import { replaceNativeReminders } from "../native/reminders";
import { reportError } from "../../lib/observability";
import type { AppStateSnapshot } from "../types";

const Widgets = registerPlugin<{
  publish(options: { snapshot: WidgetSnapshot }): Promise<void>;
  consumeRoute(): Promise<{ route?: string }>;
  addListener(event: "route", callback: (data: { route?: string }) => void): Promise<PluginListenerHandle>;
}>("AzkarWidgets");

export function useNativeServices(state: AppStateSnapshot) {
  const latest = useRef(state);
  latest.current = state;
  const rebuildReminders = useRef(false);
  const [generation, setGeneration] = useState(0);
  const { language, reminders, location, progressDayStartHour, hijriDateOffset } = state.settings;
  const widgetState = isNativeAndroid()
    ? JSON.stringify({
        language: state.settings.language,
        location: state.settings.location,
        quranReadingPosition: state.quranReadingPosition,
        khatmahPage: state.khatmahPage,
        masbahaState: state.masbahaState,
      })
    : "";
  const reminderState = isNativeAndroid()
    ? JSON.stringify({
        language,
        reminders,
        location,
        progressDayStartHour,
        hijriDateOffset,
        dailyCompletions: state.dailyCompletions,
      })
    : "";

  useEffect(() => {
    if (!isNativeAndroid()) return;
    let active = true;
    let routeListener: PluginListenerHandle | undefined;
    const navigate = ({ route }: { route?: string }) => {
      if (active && route && /^#\/(home|azkar|counter|quran)(\/|$)/.test(route)) window.location.hash = route;
    };
    void Widgets.addListener("route", navigate)
      .then((listener) => {
        if (!active) void listener.remove();
        else routeListener = listener;
      })
      .catch((error) => reportError(error, "native-widget-route"));
    void Widgets.consumeRoute()
      .then(navigate)
      .catch((error) => reportError(error, "native-widget-launch"));
    const refresh = () => {
      if (document.visibilityState === "visible") setGeneration((value) => value + 1);
    };
    const rebuild = () => {
      rebuildReminders.current = true;
      refresh();
    };
    const timer = window.setInterval(refresh, 60 * 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("azkar-notification-permission", refresh);
    window.addEventListener("azkar-exact-alarm-permission", refresh);
    window.addEventListener("azkar-retry-native-reminders", rebuild);
    return () => {
      active = false;
      void routeListener?.remove();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("azkar-notification-permission", refresh);
      window.removeEventListener("azkar-exact-alarm-permission", refresh);
      window.removeEventListener("azkar-retry-native-reminders", rebuild);
    };
  }, []);

  useEffect(() => {
    if (!isNativeAndroid()) return;
    // Widget publication never replaces the immediate, synchronous application persistence.
    const timer = window.setTimeout(() => {
      void Widgets.publish({ snapshot: buildWidgetSnapshot(latest.current) }).catch((error) =>
        reportError(error, "native-widget"),
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [widgetState, generation]);

  useEffect(() => {
    if (!isNativeAndroid()) return;
    const rebuild = rebuildReminders.current;
    rebuildReminders.current = false;
    void replaceNativeReminders(buildNativeReminderPlan(latest.current), rebuild).catch((error) =>
      reportError(error, "native-reminders"),
    );
  }, [reminderState, generation]);
}

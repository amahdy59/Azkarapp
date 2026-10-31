import { useEffect, useRef, useState } from "react";
import { registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { isNativeAndroid } from "../native/platform";
import { buildWidgetSnapshot, type WidgetSnapshot } from "../native/widgetSnapshot";
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
  const [generation, setGeneration] = useState(0);
  const widgetState = isNativeAndroid()
    ? JSON.stringify({
        language: state.settings.language,
        location: state.settings.location,
        quranReadingPosition: state.quranReadingPosition,
        khatmahPage: state.khatmahPage,
        masbahaState: state.masbahaState,
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
    const timer = window.setInterval(refresh, 60 * 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("azkar-notification-permission", refresh);
    return () => {
      active = false;
      void routeListener?.remove();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("azkar-notification-permission", refresh);
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
}

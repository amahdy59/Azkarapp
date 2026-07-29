type TelemetryEvent =
  | {
      type: "error";
      name: string;
      source: string;
      path: string;
      timestamp: string;
    }
  | {
      type: "metric";
      name: "CLS" | "INP" | "LCP" | "TTFB";
      value: number;
      path: string;
      timestamp: string;
    };

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type InteractionEntry = PerformanceEntry & { duration: number; interactionId?: number };

const telemetryEndpoint = (import.meta.env.VITE_TELEMETRY_ENDPOINT as string | undefined)?.trim() ?? "";
const enabled = Boolean(telemetryEndpoint) && navigator.doNotTrack !== "1";

function baseEvent() {
  return {
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  };
}

/** Produces an error event without messages, stacks, user data, or page query parameters. */
export function createErrorEvent(error: unknown, source: string): TelemetryEvent {
  return {
    type: "error",
    name: error instanceof Error ? error.name.slice(0, 80) : "UnknownError",
    source: source.slice(0, 80),
    ...baseEvent(),
  };
}

function send(event: TelemetryEvent) {
  window.dispatchEvent(new CustomEvent("azkar:telemetry", { detail: event }));
  if (!enabled) return;

  const body = JSON.stringify(event);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(telemetryEndpoint, new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch(telemetryEndpoint, {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
    keepalive: true,
    credentials: "omit",
  }).catch(() => {
    // Telemetry must never affect the application experience.
  });
}

export function reportError(error: unknown, source: string) {
  send(createErrorEvent(error, source));
}

function reportMetric(name: Extract<TelemetryEvent, { type: "metric" }>["name"], value: number) {
  send({ type: "metric", name, value: Math.round(value), ...baseEvent() });
}

/** Reports Core Web Vitals when supported, with no persistent or account identifiers. */
export function startPerformanceMonitoring() {
  if (typeof PerformanceObserver === "undefined") return () => {};

  const observers: PerformanceObserver[] = [];
  let cls = 0;
  let inp = 0;
  const onWindowError = (event: ErrorEvent) => reportError(event.error, "window-error");
  const onUnhandledRejection = (event: PromiseRejectionEvent) => reportError(event.reason, "unhandled-rejection");
  window.addEventListener("error", onWindowError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  const observe = (type: string, callback: PerformanceObserverCallback) => {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      // Older browsers may not implement every performance entry type.
    }
  };

  observe("largest-contentful-paint", (list) => {
    const last = list.getEntries().at(-1);
    if (last) reportMetric("LCP", last.startTime);
  });
  observe("layout-shift", (list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (!entry.hadRecentInput) cls += entry.value;
    }
  });
  observe("event", (list) => {
    for (const entry of list.getEntries() as InteractionEntry[]) {
      if ((entry.interactionId ?? 0) > 0) inp = Math.max(inp, entry.duration);
    }
  });

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation) reportMetric("TTFB", navigation.responseStart);

  const flush = () => {
    reportMetric("CLS", cls * 1000);
    if (inp > 0) reportMetric("INP", inp);
  };
  document.addEventListener("visibilitychange", flush);

  return () => {
    flush();
    document.removeEventListener("visibilitychange", flush);
    window.removeEventListener("error", onWindowError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    for (const observer of observers) observer.disconnect();
  };
}

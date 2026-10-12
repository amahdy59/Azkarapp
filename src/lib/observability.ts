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
  const telemetryEndpoint = (import.meta.env.VITE_TELEMETRY_ENDPOINT as string | undefined)?.trim() ?? "";
  if (!telemetryEndpoint || navigator.doNotTrack === "1") return;

  try {
    const body = JSON.stringify(event);
    if (navigator.sendBeacon?.(telemetryEndpoint, new Blob([body], { type: "application/json" }))) return;
    void fetch(telemetryEndpoint, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    // A blocked or invalid collector must never break reading or recovery.
  }
}

export function reportError(error: unknown, source: string) {
  send(createErrorEvent(error, source));
}

function reportMetric(name: Extract<TelemetryEvent, { type: "metric" }>["name"], value: number) {
  send({ type: "metric", name, value: Math.round(value), ...baseEvent() });
}

/** Lightweight performance diagnostics; never include persistent or account identifiers. */
export function startPerformanceMonitoring() {
  const observers: PerformanceObserver[] = [];
  const observedTypes = new Set<string>();
  let cls = 0;
  let sessionScore = 0;
  let sessionStart = 0;
  let lastShift = 0;
  let lcp = 0;
  let firstInteraction = Infinity;
  let lastInteraction = 0;
  // INP discards one outlier per 50 interactions. Ten candidates bound memory
  // even during long counter sessions; duplicate event entries share one ID.
  const interactions = new Map<number, number>();
  const onWindowError = (event: ErrorEvent) => reportError(event.error, "window-error");
  const onUnhandledRejection = (event: PromiseRejectionEvent) => reportError(event.reason, "unhandled-rejection");
  window.addEventListener("error", onWindowError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  const observe = (type: string, callback: PerformanceObserverCallback, durationThreshold?: number) => {
    if (typeof PerformanceObserver === "undefined") return;
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ type, buffered: true, ...(durationThreshold === undefined ? {} : { durationThreshold }) });
      observers.push(observer);
      observedTypes.add(type);
    } catch {
      // Older browsers may not implement every performance entry type.
    }
  };

  observe("largest-contentful-paint", (list) => {
    const last = list.getEntries().at(-1);
    if (last) lcp = last.startTime;
  });
  observe("layout-shift", (list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (entry.hadRecentInput) continue;
      if (sessionScore > 0 && entry.startTime - lastShift < 1000 && entry.startTime - sessionStart < 5000) {
        sessionScore += entry.value;
      } else {
        sessionScore = entry.value;
        sessionStart = entry.startTime;
      }
      lastShift = entry.startTime;
      cls = Math.max(cls, sessionScore);
    }
  });
  observe(
    "event",
    (list) => {
      for (const entry of list.getEntries() as InteractionEntry[]) {
        const id = entry.interactionId ?? 0;
        if (id <= 0) continue;
        firstInteraction = Math.min(firstInteraction, id);
        lastInteraction = Math.max(lastInteraction, id);
        interactions.set(id, Math.max(interactions.get(id) ?? 0, entry.duration));
        if (interactions.size > 10) {
          const shortest = [...interactions].sort((a, b) => a[1] - b[1])[0]!;
          interactions.delete(shortest[0]);
        }
      }
    },
    16,
  );

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation) reportMetric("TTFB", navigation.responseStart);

  const flush = () => {
    if (lcp > 0) reportMetric("LCP", lcp);
    // Preserve the collector's historical CLS unit: thousandths of a score.
    if (observedTypes.has("layout-shift")) reportMetric("CLS", cls * 1000);
    const durations = [...interactions.values()].sort((a, b) => b - a);
    const count =
      (performance as Performance & { interactionCount?: number }).interactionCount ??
      (lastInteraction > 0 ? (lastInteraction - firstInteraction) / 7 + 1 : 0);
    const inp = durations[Math.min(durations.length - 1, Math.floor(count / 50))];
    if (inp !== undefined) reportMetric("INP", inp);
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") flush();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    flush();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("error", onWindowError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    for (const observer of observers) observer.disconnect();
  };
}

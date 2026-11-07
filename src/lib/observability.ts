type TelemetryEvent =
  | {
      type: "error";
      name: string;
      source: string;
      path: string;
      screen: string;
      timestamp: string;
    }
  | {
      type: "metric";
      name: "CLS" | "INP" | "LCP" | "TTFB";
      value: number;
      scope: "navigation" | "interaction";
      path: string;
      screen: string;
      timestamp: string;
    };

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type InteractionEntry = PerformanceEntry & { duration: number; interactionId?: number };

/** Only coarse product screens are permitted; never include content IDs or searches. */
export function diagnosticScreen(hash = window.location.hash): string {
  const route = (hash.split(/[?&]/, 1)[0] ?? "").split("/").filter(Boolean);
  const first = route[1]; // the leading # is a separate segment
  if (first === "azkar") return route.length > 3 ? "reader" : route.length > 2 ? "collection" : "library";
  const allowed = new Set([
    "home",
    "progress",
    "settings",
    "quran",
    "quran-wird",
    "search",
    "qibla",
    "friday",
    "counter",
    "prayer",
    "benefits",
    "more",
    "completion",
  ]);
  return first && allowed.has(first) ? first : "unknown";
}

const screenTimeline: { at: number; screen: string }[] = [];
export function recordDiagnosticScreen() {
  const screen = diagnosticScreen();
  if (screenTimeline.at(-1)?.screen === screen) return;
  screenTimeline.push({ at: performance.now(), screen });
  if (screenTimeline.length > 64) screenTimeline.shift();
}
function interactionScreen(at: number) {
  return screenTimeline.findLast((entry) => entry.at <= at)?.screen ?? "unknown";
}

function baseEvent() {
  return {
    path: window.location.pathname,
    screen: diagnosticScreen(),
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

function reportMetric(name: Extract<TelemetryEvent, { type: "metric" }>["name"], value: number, screen: string) {
  send({
    type: "metric",
    name,
    value: Math.round(value),
    ...baseEvent(),
    screen,
    scope: name === "INP" ? "interaction" : "navigation",
  });
}

/** Lightweight performance diagnostics; never include persistent or account identifiers. */
export function startPerformanceMonitoring() {
  const navigationScreen = diagnosticScreen();
  recordDiagnosticScreen();
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
  const interactions = new Map<number, { duration: number; screen: string }>();
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
        const previous = interactions.get(id);
        if (!previous || entry.duration > previous.duration)
          interactions.set(id, { duration: entry.duration, screen: interactionScreen(entry.startTime) });
        if (interactions.size > 10) {
          const shortest = [...interactions].sort((a, b) => a[1].duration - b[1].duration)[0]!;
          interactions.delete(shortest[0]);
        }
      }
    },
    16,
  );

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation) reportMetric("TTFB", navigation.responseStart, navigationScreen);

  const flush = () => {
    if (lcp > 0) reportMetric("LCP", lcp, navigationScreen);
    // Preserve the collector's historical CLS unit: thousandths of a score.
    if (observedTypes.has("layout-shift")) reportMetric("CLS", cls * 1000, navigationScreen);
    const durations = [...interactions.values()].sort((a, b) => b.duration - a.duration);
    const count =
      (performance as Performance & { interactionCount?: number }).interactionCount ??
      (lastInteraction > 0 ? (lastInteraction - firstInteraction) / 7 + 1 : 0);
    const inp = durations[Math.min(durations.length - 1, Math.floor(count / 50))];
    if (inp !== undefined) reportMetric("INP", inp.duration, inp.screen);
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

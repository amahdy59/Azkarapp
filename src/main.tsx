import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { ScreenFallback } from "./app/components/ScreenFallback.tsx";
import { pruneStaleFridayProgress } from "./app/fridayProgress.ts";
import { createAppStateReader } from "./app/state.ts";
import { applyAppAppearance } from "./app/theme.ts";
import { reportError, startPerformanceMonitoring } from "./lib/observability.ts";
import "./styles/index.css";

import { registerSW } from "virtual:pwa-register";
import { applyServiceWorkerUpdate, prepareServiceWorkerUpdate } from "./app/pwaUpdate";

const App = lazy(() => import("./app/App.tsx"));
const MarketingLanding = lazy(() => import("./app/screens/MarketingLanding.tsx"));
const isMarketingLanding =
  window.location.pathname.replace(/\/$/, "").endsWith("/landing") ||
  new URLSearchParams(window.location.search).get("view") === "landing";
const loadStartupState = createAppStateReader();
const initialSnapshot = loadStartupState();
const initialAppearance = initialSnapshot.settings;
applyAppAppearance(isMarketingLanding ? { ...initialAppearance, language: "en", forceRtl: false } : initialAppearance);
startPerformanceMonitoring();
// Daily progress cleanup stays synchronous; optional cache maintenance runs after App commits.
if (!isMarketingLanding) {
  pruneStaleFridayProgress();
}

document.querySelector<HTMLAnchorElement>(".skip-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  const focusMainContent = () => {
    const mainContent = document.getElementById("main-content");
    mainContent?.focus();
    return Boolean(mainContent);
  };
  if (focusMainContent()) return;

  const observer = new MutationObserver(() => {
    if (focusMainContent()) observer.disconnect();
  });
  observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
});

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <Suspense fallback={<ScreenFallback language={isMarketingLanding ? "en" : initialAppearance.language} />}>
      {isMarketingLanding ? <MarketingLanding /> : <App loadStartupState={loadStartupState} />}
    </Suspense>
  </AppErrorBoundary>,
);

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

if (import.meta.env.MODE === "android") {
  void import("./app/native/liveUpdate")
    .then(({ initializeNativeLiveUpdate }) => initializeNativeLiveUpdate())
    .catch((error) => reportError(error, "native-live-update-startup"));
  void import("./app/native/reminders")
    .then(({ initializeNativeNotifications }) => initializeNativeNotifications())
    .catch((error) => reportError(error, "native-startup"));
}

const updateServiceWorker =
  import.meta.env.MODE === "android"
    ? async () => {}
    : registerSW({
        onNeedRefresh() {
          window.dispatchEvent(new Event("azkar-update-available"));
        },
        /**
         * Ask for the update ourselves.
         *
         * `registerType: "prompt"` means the new worker installs and then waits, which
         * is what lets the reader choose the moment. But the browser only *looks* for
         * a new worker on navigation, and an installed PWA is resumed rather than
         * navigated — so on a phone the notice could go unseen for days while the
         * mechanism behind it worked perfectly. Checking when the app becomes visible
         * covers that case; the interval covers a session left open all day, and the
         * online handler covers coming back from a tunnel or a flight.
         *
         * `registration.update()` is a conditional request: when nothing has shipped
         * it costs one 304 and changes nothing.
         */
        onRegisteredSW(_swUrl, registration) {
          if (!registration) return;

          const checkForUpdate = () => {
            if (!navigator.onLine) return;
            void registration.update().catch(() => {
              // A failed check is not worth surfacing: the next one will retry.
            });
          };

          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") checkForUpdate();
          });
          window.addEventListener("online", checkForUpdate);
          window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
          checkForUpdate();
        },
      });

// Preparation never grants consent to activate: Later keeps this build running.
let preparationAttempt: AbortController | undefined;
window.addEventListener("azkar-prepare-update", () => {
  if (import.meta.env.MODE === "android") return;
  preparationAttempt?.abort();
  const attempt = new AbortController();
  preparationAttempt = attempt;
  const timer = window.setTimeout(() => attempt.abort(new Error("Update preparation timed out")), 120_000);
  const aborted = new Promise<never>((_, reject) => {
    attempt.signal.addEventListener("abort", () => reject(attempt.signal.reason), { once: true });
  });
  void Promise.race([
    prepareServiceWorkerUpdate(
      () => navigator.serviceWorker?.getRegistration?.() ?? Promise.resolve(undefined),
      attempt.signal,
    ),
    aborted,
  ])
    .then((registration) => {
      if (registration && !registration.waiting) throw new Error("Update is not ready yet");
      window.dispatchEvent(new Event("azkar-update-available"));
    })
    .catch(() => {
      if (preparationAttempt === attempt) window.dispatchEvent(new Event("azkar-update-preparation-failed"));
    })
    .finally(() => {
      window.clearTimeout(timer);
      if (preparationAttempt === attempt) preparationAttempt = undefined;
    });
});

let updateAttempt: AbortController | undefined;
window.addEventListener("azkar-apply-update", () => {
  if (import.meta.env.MODE === "android") {
    void import("./app/native/liveUpdate")
      .then(({ applyNativeLiveUpdate }) => applyNativeLiveUpdate())
      .catch((error) => {
        reportError(error, "native-live-update-apply");
        window.dispatchEvent(new Event("azkar-update-failed"));
      });
    return;
  }
  updateAttempt?.abort();
  const attempt = new AbortController();
  updateAttempt = attempt;
  let timeoutId = 0;
  const timeout = new Promise<never>((_, reject) => {
    // Installation downloads the complete offline shell; mobile connections
    // need more than the old 15s handover-only allowance.
    timeoutId = window.setTimeout(() => {
      const error = new Error("Service worker update timed out");
      attempt.abort(error);
      reject(error);
    }, 120_000);
  });
  void Promise.race([
    applyServiceWorkerUpdate({
      getRegistration: () => navigator.serviceWorker?.getRegistration?.() ?? Promise.resolve(undefined),
      updateServiceWorker,
      signal: attempt.signal,
      reload: () => window.location.reload(),
      /* Four seconds is a handover, not a download: the new worker has already
         installed and precached by this point, and all that remains is for it
         to take control. If that has not happened by now it is not going to,
         and reloading is better than a spinner with no end. */
      awaitHandover: () =>
        new Promise<boolean>((resolve) => {
          const timer = window.setTimeout(() => {
            finish(false);
          }, 4000);
          function finish(changed: boolean) {
            window.clearTimeout(timer);
            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
            attempt.signal.removeEventListener("abort", onAbort);
            resolve(changed);
          }
          function onAbort() {
            finish(false);
          }
          function onControllerChange() {
            finish(true);
          }
          navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true });
          attempt.signal.addEventListener("abort", onAbort, { once: true });
        }),
    }),
    timeout,
  ])
    .catch((error) => {
      if (updateAttempt !== attempt) return;
      reportError(error, "pwa-update");
      window.dispatchEvent(new Event("azkar-update-failed"));
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
      attempt.abort();
      if (updateAttempt === attempt) updateAttempt = undefined;
    });
});

import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { pruneStaleFridayProgress } from "./app/fridayProgress.ts";
import { loadAppState } from "./app/state.ts";
import { applyAppAppearance } from "./app/theme.ts";
import { reportError, startPerformanceMonitoring } from "./lib/observability.ts";
import "./styles/index.css";

import { registerSW } from "virtual:pwa-register";

const App = lazy(() => import("./app/App.tsx"));
const MarketingLanding = lazy(() => import("./app/screens/MarketingLanding.tsx"));
const isMarketingLanding =
  window.location.pathname.replace(/\/$/, "").endsWith("/landing") ||
  new URLSearchParams(window.location.search).get("view") === "landing";
const Root = isMarketingLanding ? MarketingLanding : App;
const initialAppearance = loadAppState().settings;
applyAppAppearance(isMarketingLanding ? { ...initialAppearance, language: "en", forceRtl: false } : initialAppearance);
startPerformanceMonitoring();
// Best-effort startup cleanup, alongside cleanupStaleAudioDownloads below.
if (!isMarketingLanding) {
  pruneStaleFridayProgress();
  void import("./app/content/qcfMushaf.ts").then((module) => module.discardRetiredCaches());
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
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </AppErrorBoundary>,
);

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

const updateServiceWorker = registerSW({
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
  },
});

if (!isMarketingLanding && "caches" in window) {
  void import("./app/audio/audioOfflineCache.ts")
    .then(({ cleanupStaleAudioDownloads }) => cleanupStaleAudioDownloads())
    .catch(() => {
      // Offline cleanup is best-effort and must not block reading the app.
    });
}

/**
 * Applying an update has to work from a cold prompt, not only from one the
 * service worker itself raised.
 *
 * `updateServiceWorker(true)` skips the waiting worker and reloads when the new
 * controller takes over — but if no worker is waiting yet it resolves having
 * done nothing, and the reader who just pressed "update" is left on the version
 * they pressed it to leave. That is the common case now that the prompt can
 * also come from the deployed release notes disagreeing with this bundle's own
 * stamp: the app knows an update exists before the worker has looked for it.
 *
 * So: ask the registration to look first, hand over if something is waiting,
 * and otherwise reload — by then the caches hold the new build either way.
 */
async function applyServiceWorkerUpdate(): Promise<void> {
  const registration = await navigator.serviceWorker?.getRegistration?.();

  if (registration) {
    await registration.update().catch(() => {
      // A failed check is not a failed update: fall through to the reload,
      // which is what the reader asked for.
    });
    if (registration.waiting || registration.installing) {
      await updateServiceWorker(true);
      return;
    }
  }

  window.location.reload();
}

window.addEventListener("azkar-apply-update", () => {
  let timeoutId = 0;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Service worker update timed out")), 15_000);
  });
  void Promise.race([applyServiceWorkerUpdate(), timeout])
    .catch((error) => {
      reportError(error, "pwa-update");
      window.dispatchEvent(new Event("azkar-update-failed"));
    })
    .finally(() => window.clearTimeout(timeoutId));
});

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
if (!isMarketingLanding) pruneStaleFridayProgress();

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

const updateServiceWorker = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event("azkar-update-available"));
  },
});

if (!isMarketingLanding && "caches" in window) {
  void import("./app/audio/audioOfflineCache.ts")
    .then(({ cleanupStaleAudioDownloads }) => cleanupStaleAudioDownloads())
    .catch(() => {
      // Offline cleanup is best-effort and must not block reading the app.
    });
}

window.addEventListener("azkar-apply-update", () => {
  let timeoutId = 0;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Service worker update timed out")), 15_000);
  });
  void Promise.race([updateServiceWorker(true), timeout])
    .catch((error) => {
      reportError(error, "pwa-update");
      window.dispatchEvent(new Event("azkar-update-failed"));
    })
    .finally(() => window.clearTimeout(timeoutId));
});

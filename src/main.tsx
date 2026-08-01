import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { loadAppState } from "./app/state.ts";
import { applyAppAppearance } from "./app/theme.ts";
import { startPerformanceMonitoring } from "./lib/observability.ts";
import { AudioProvider } from "./app/audio/AudioProvider.tsx";
import "./styles/index.css";

import { registerSW } from "virtual:pwa-register";

const MarketingLanding = lazy(() => import("./app/screens/MarketingLanding.tsx"));
const Root = window.location.pathname.replace(/\/$/, "").endsWith("/landing") ? MarketingLanding : App;
const initialAppearance = loadAppState().settings;
applyAppAppearance(initialAppearance);
startPerformanceMonitoring();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <AudioProvider>
      <Suspense fallback={null}>
        <Root />
      </Suspense>
    </AudioProvider>
  </AppErrorBoundary>,
);

const updateServiceWorker = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event("azkar-update-available"));
  },
});

if ("caches" in window) {
  void import("./app/audio/audioOfflineCache.ts")
    .then(({ cleanupStaleAudioDownloads }) => cleanupStaleAudioDownloads())
    .catch(() => {
      // Offline cleanup is best-effort and must not block reading the app.
    });
}

window.addEventListener("azkar-apply-update", () => {
  void updateServiceWorker(true);
});

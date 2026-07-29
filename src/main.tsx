import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { loadAppState } from "./app/state.ts";
import { applyAppAppearance } from "./app/theme.ts";
import { startPerformanceMonitoring } from "./lib/observability.ts";
import "./styles/index.css";

import { registerSW } from "virtual:pwa-register";

const MarketingLanding = lazy(() => import("./app/screens/MarketingLanding.tsx"));
const Root = window.location.pathname.replace(/\/$/, "").endsWith("/landing") ? MarketingLanding : App;
const initialAppearance = loadAppState().settings;
applyAppAppearance(initialAppearance);
startPerformanceMonitoring();

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

window.addEventListener("azkar-apply-update", () => {
  void updateServiceWorker(true);
});

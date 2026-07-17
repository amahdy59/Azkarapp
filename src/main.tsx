import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import MarketingLanding from "./app/screens/MarketingLanding.tsx";
import "./styles/index.css";

import { registerSW } from "virtual:pwa-register";

const Root = window.location.pathname.replace(/\/$/, "").endsWith("/landing") ? MarketingLanding : App;
createRoot(document.getElementById("root")!).render(<Root />);

const updateServiceWorker = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event("azkar-update-available"));
  },
});

window.addEventListener("azkar-apply-update", () => {
  void updateServiceWorker(true);
});

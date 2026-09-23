import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";

const API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || "https://azkarapp-api.amahdy59.workers.dev";
const VISITOR_KEY = "azkarapp.visitor-id.v1";
const HEARTBEAT_INTERVAL_MS = 30_000;
const ActiveVisitorCountContext = createContext<number | null>(null);

function getVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function ActiveVisitorPresence({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const visitorId = getVisitorId();
    const sendHeartbeat = () => {
      if (document.visibilityState === "hidden") return;
      void fetch(`${API_URL}/v1/visitors`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId }),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { active?: number } | null) => {
          if (active && typeof data?.active === "number") setCount(data.active);
        })
        .catch(() => undefined);
    };
    const handleVisibilityChange = () => sendHeartbeat();

    sendHeartbeat();
    const heartbeat = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <ActiveVisitorCountContext.Provider value={count}>{children}</ActiveVisitorCountContext.Provider>;
}

export function VisitorCount({ language }: { language: AppLanguage }) {
  const count = useContext(ActiveVisitorCountContext);

  if (count === null) return null;
  return (
    <p
      className="mt-6 pb-2 text-center text-xs text-muted-foreground"
      aria-label={t(language, "accountData.visitorCountLabel")}
    >
      {t(language, "accountData.visitorCount", {
        count: count.toLocaleString(language === "ar" ? "ar-EG" : "en-US"),
      })}
    </p>
  );
}

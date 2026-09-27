import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { sendActiveVisitorHeartbeat } from "../../lib/cloudflareSync";

const HEARTBEAT_INTERVAL_MS = 30_000;
const ActiveVisitorCountContext = createContext<number | null>(null);

function useActiveVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const sendHeartbeat = () => {
      if (document.visibilityState === "hidden") return;
      void sendActiveVisitorHeartbeat()
        .then((nextCount) => {
          if (active && nextCount !== null) setCount(nextCount);
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

  return count;
}

export function ActiveVisitorPresence({ children }: { children: ReactNode }) {
  const count = useActiveVisitorCount();

  return <ActiveVisitorCountContext.Provider value={count}>{children}</ActiveVisitorCountContext.Provider>;
}

export function VisitorCount({ language, onMedia = false }: { language: AppLanguage; onMedia?: boolean }) {
  const count = useContext(ActiveVisitorCountContext);

  if (count === null) return null;
  return (
    <p
      className={`mt-6 pb-2 text-center text-xs transition-colors ${
        onMedia ? "text-on-media-muted drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]" : "text-muted-foreground"
      }`}
      aria-label={t(language, "accountData.visitorCountLabel")}
    >
      {t(language, "accountData.visitorCount", {
        count: count.toLocaleString(language === "ar" ? "ar-EG" : "en-US"),
      })}
    </p>
  );
}

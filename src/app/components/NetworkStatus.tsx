import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Announces connectivity changes while allowing locally stored reading and counting to continue. */
export function NetworkStatus({ language = "en" }: { language?: AppLanguage }) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [isExpanded, setIsExpanded] = useState(() => !isOnline);
  const [showReconnected, setShowReconnected] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    const collapseSoon = () => {
      clearTimer();
      timerRef.current = window.setTimeout(() => setIsExpanded(false), 5000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      setIsExpanded(true);
      collapseSoon();
    };
    const handleOnline = () => {
      clearTimer();
      setIsOnline(true);
      setShowReconnected(true);
      timerRef.current = window.setTimeout(() => setShowReconnected(false), 3000);
    };
    if (!navigator.onLine) collapseSoon();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      clearTimer();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="sync-status" role="status" aria-live="polite">
        {t(language, "syncStatus.backOnline")}
      </div>
    );
  }

  return (
    <div className={`network-status ${isExpanded ? "" : "bg-transparent text-end text-foreground"}`}>
      <span className="sr-only" role="status" aria-live="polite">
        {t(language, "syncStatus.offlineNotice")}
      </span>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((value) => !value)}
        className={`min-h-11 rounded-full px-3 font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${isExpanded ? "" : "bg-destructive/10 text-foreground"}`}
      >
        {isExpanded ? t(language, "syncStatus.offlineNotice") : t(language, "syncStatus.offlineCompact")}
      </button>
    </div>
  );
}

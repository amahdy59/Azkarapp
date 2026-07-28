import { useEffect, useState } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Announces connectivity changes while allowing locally stored reading and counting to continue. */
export function NetworkStatus({ language = "en" }: { language?: AppLanguage }) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="network-status" role="status" aria-live="polite">
      {t(language, "syncStatus.offlineNotice")}
    </div>
  );
}

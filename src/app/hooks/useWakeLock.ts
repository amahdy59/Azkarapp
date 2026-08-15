import { useEffect, useRef, useState } from "react";

/**
 * Hook to manage the Screen Wake Lock API.
 * Requests a wake lock on mount (if enabled) and re-requests it if the document becomes visible again.
 */
export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported("wakeLock" in navigator);
  }, []);

  useEffect(() => {
    if (!enabled || !isSupported) return;

    let isMounted = true;

    const requestWakeLock = async () => {
      try {
        if (wakeLockRef.current !== null) return;
        wakeLockRef.current = await navigator.wakeLock.request("screen");
        wakeLockRef.current.addEventListener("release", () => {
          if (isMounted) {
            wakeLockRef.current = null;
          }
        });
      } catch (err) {
        // Wake Lock may be denied due to battery settings or not being active tab
        console.warn(`Wake Lock error: ${err}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [enabled, isSupported]);
}

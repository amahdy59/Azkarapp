import { useEffect, useLayoutEffect, useRef } from "react";
import { saveAppState } from "../state";
import type { AppStateSnapshot } from "../types";

/** Coalesce rapid changes, but save before the browser can freeze the page. */
export function useAppStatePersistence(snapshot: AppStateSnapshot, onResult: (saved: boolean) => void) {
  const pending = useRef(false);
  const latest = useRef({ snapshot, onResult });

  useLayoutEffect(() => {
    // A reload may start as soon as updated progress is painted. Make its
    // snapshot available to pagehide before passive effects can be deferred.
    latest.current = { snapshot, onResult };
    pending.current = true;
    const timer = window.setTimeout(() => {
      if (!pending.current) return;
      pending.current = false;
      onResult(saveAppState(snapshot));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [snapshot, onResult]);

  useEffect(() => {
    const flush = () => {
      if (!pending.current) return;
      pending.current = false;
      latest.current.onResult(saveAppState(latest.current.snapshot));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);
}

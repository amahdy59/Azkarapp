import { useEffect, useLayoutEffect, useRef } from "react";
import { createAppStateWriter } from "../state";
import type { AppStateSnapshot } from "../types";

/** Coalesce rapid changes, but save before the browser can freeze the page. */
export function useAppStatePersistence(snapshot: AppStateSnapshot, onResult: (saved: boolean) => void) {
  const writer = useRef<ReturnType<typeof createAppStateWriter> | null>(null);
  if (!writer.current) writer.current = createAppStateWriter();
  const pending = useRef(false);
  const latest = useRef({ snapshot, onResult });
  const previousPartialCounts = useRef(snapshot.partialZikrCounts);

  useLayoutEffect(() => {
    // A reload may start as soon as updated progress is painted. Make its
    // snapshot available to pagehide before passive effects can be deferred.
    latest.current = { snapshot, onResult };
    pending.current = true;
    // A displayed tally must survive even a reload that skips lifecycle events.
    // Keep other snapshot changes coalesced, using the same normalized save boundary.
    if (previousPartialCounts.current !== snapshot.partialZikrCounts) {
      previousPartialCounts.current = snapshot.partialZikrCounts;
      pending.current = false;
      onResult(writer.current!(snapshot));
      return;
    }
    const timer = window.setTimeout(() => {
      if (!pending.current) return;
      pending.current = false;
      onResult(writer.current!(snapshot));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [snapshot, onResult]);

  useEffect(() => {
    const flush = () => {
      if (!pending.current) return;
      pending.current = false;
      latest.current.onResult(writer.current!(latest.current.snapshot));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);
}

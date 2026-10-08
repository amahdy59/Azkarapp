import { useEffect, useState } from "react";

export const COUNTER_GUIDANCE_DISMISSED_KEY = "azkarapp.counter-guidance.v1";

type GuidanceStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): GuidanceStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function readDismissed(storage: GuidanceStorage | undefined = browserStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(COUNTER_GUIDANCE_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

function writeDismissed(storage: GuidanceStorage | undefined = browserStorage()): void {
  try {
    storage?.setItem(COUNTER_GUIDANCE_DISMISSED_KEY, "true");
  } catch {
    // Guidance is optional; counting remains usable when storage is unavailable.
  }
}

/** Keeps the first-use counting explanation out of the way after the first count. */
export function useCounterGuidance(hasStarted: boolean) {
  const [expanded, setExpanded] = useState(() => !hasStarted && !readDismissed());
  // A reopened explanation must remain open even when the current zikr was
  // already partly counted before the component mounted.
  const [hasAutoDismissed, setHasAutoDismissed] = useState(() => hasStarted);

  useEffect(() => {
    if (!hasStarted || hasAutoDismissed) return;
    writeDismissed();
    setHasAutoDismissed(true);
    setExpanded(false);
  }, [hasAutoDismissed, hasStarted]);

  return {
    expanded,
    reopen: () => setExpanded(true),
    dismiss: () => {
      writeDismissed();
      setHasAutoDismissed(true);
      setExpanded(false);
    },
  };
}

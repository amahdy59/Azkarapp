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
    if (storage.getItem(COUNTER_GUIDANCE_DISMISSED_KEY) === "true") return true;
    if (storage.getItem("azkarapp.onboarding-complete.v1") === "true") return true;
    return false;
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
  const [dismissed, setDismissed] = useState(() => readDismissed());

  useEffect(() => {
    if (!hasStarted || dismissed) return;
    writeDismissed();
    setDismissed(true);
  }, [hasStarted, dismissed]);

  return {
    isFirstTime: !dismissed && !hasStarted,
    expanded: !dismissed && !hasStarted,
    reopen: () => undefined,
    dismiss: () => {
      writeDismissed();
      setDismissed(true);
    },
  };
}

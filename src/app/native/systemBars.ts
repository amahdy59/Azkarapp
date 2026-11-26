import { isNativeAndroid } from "./platform";

/** Appearance is best effort: older APKs and browsers must still open/read offline. */
export function applyNativeSystemBars(color: string): void {
  if (!isNativeAndroid()) return;
  try {
    // Browser startup must not acquire the native plugin runtime for appearance.
    void import("./systemBarsBridge")
      .then(({ setSystemBarBackground }) => setSystemBarBackground(color))
      .catch(() => {});
  } catch {
    // A missing bridge never interrupts application appearance or reading.
  }
}

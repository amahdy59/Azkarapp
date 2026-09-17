/**
 * Shared gate for interaction feedback (haptics and celebratory motion).
 *
 * MOTION_SYSTEM.md §7 requires reduced motion to honour *both* the OS
 * `prefers-reduced-motion` query and the app-level Reduce Motion setting, and
 * haptics to honour the app-level Haptic Feedback setting. Screens that reached
 * for `navigator.vibrate` or `matchMedia` directly bypassed one or the other, so
 * the checks live here instead of being re-derived per screen.
 *
 * `scripts/check-motion-rules.mjs` only parses CSS, so these JS-driven effects
 * are invisible to it — that is precisely why they need a single call path.
 */

/** True when either the OS or the in-app setting asks for reduced motion. */
export function shouldReduceMotion(appReduceMotion = false): boolean {
  if (appReduceMotion) return true;
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Vibrate only when the user has left haptic feedback enabled. */
export function vibrateIfEnabled(hapticFeedback: boolean, pattern: number | number[]): void {
  if (!hapticFeedback) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

/** Scroll behaviour that collapses to an instant jump under reduced motion. */
export function scrollBehavior(appReduceMotion = false): ScrollBehavior {
  return shouldReduceMotion(appReduceMotion) ? "auto" : "smooth";
}

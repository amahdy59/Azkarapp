/**
 * Safely executes a callback wrapped in the View Transitions API,
 * respecting the user's reduced motion preference.
 */
export function startSafeViewTransition(callback: () => void, prefersReducedMotion: boolean = false) {
  if (
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    callback();
    return;
  }
  document.startViewTransition(callback);
}

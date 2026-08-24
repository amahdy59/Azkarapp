/**
 * Safely executes a callback wrapped in the View Transitions API,
 * respecting the user's reduced motion preference.
 */
export function startSafeViewTransition(callback: () => void, prefersReducedMotion: boolean = false) {
  const systemPrefersReducedMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof document.startViewTransition !== "function" || prefersReducedMotion || systemPrefersReducedMotion) {
    callback();
    return;
  }

  const transition = document.startViewTransition(callback);

  // Browsers are allowed to skip a transition when a newer navigation wins or
  // the DOM update misses their deadline. `ready` rejects in that case even
  // though the callback has already updated the screen successfully. Consume
  // only that animation-level rejection; callback failures still surface via
  // `updateCallbackDone` / `finished` and remain observable.
  void transition.ready.catch(() => undefined);
}

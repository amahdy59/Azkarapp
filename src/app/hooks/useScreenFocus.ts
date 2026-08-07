import { useEffect, useRef } from "react";

/**
 * Sets the document title for the current screen.
 *
 * Focus movement deliberately does NOT live here. Screens are lazily mounted,
 * so every navigation mounts a fresh instance of this hook — a per-instance
 * "skip the first run" guard is therefore always true and never moves focus.
 * Focus on view change is owned by {@link useViewFocus} at the app level,
 * where the view identity actually persists across navigations.
 */
export function useScreenFocus(screenName?: string) {
  useEffect(() => {
    if (screenName) {
      document.title = `${screenName} - Azkar`;
    }
  }, [screenName]);
}

/**
 * Moves focus to the app's single main landmark whenever the view changes, so
 * keyboard and screen-reader users land in the new screen's content instead of
 * being left on a control that no longer exists.
 *
 * Skips the initial load so it never steals focus on first paint.
 */
export function useViewFocus(view: string) {
  const isInitialView = useRef(true);

  useEffect(() => {
    if (isInitialView.current) {
      isInitialView.current = false;
      return;
    }

    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [view]);
}

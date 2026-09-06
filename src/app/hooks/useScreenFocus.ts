import { useEffect, useRef } from "react";
import { t } from "../i18n";

/**
 * Sets the document title for the current screen.
 *
 * The app's name is read from the reader's language rather than hardcoded. It
 * had been left as "Azkar" by the rename, so every tab and every bookmark still
 * said the old name — the one place a reader sees the app named that no screen
 * renders.
 *
 * The language comes from `documentElement.lang`, which the app already sets,
 * rather than from a prop: this hook is used through `ScreenContainer`, which
 * is generic and has no language of its own, and threading one through every
 * screen for a single string would be the worse trade. The hook already owns
 * document-level state.
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
      const language = document.documentElement.lang === "ar" ? "ar" : "en";
      document.title = `${screenName} - ${t(language, "common.appName")}`;
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

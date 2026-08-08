import { useState, useEffect } from "react";

/**
 * Subscribes to a single CSS media query. Defaults to `false` (including when
 * `matchMedia` is unavailable, e.g. jsdom in unit tests or older embedded
 * webviews) so callers get a safe, narrower layout until the browser proves
 * otherwise. Mirrors the matchMedia + change-listener pattern in useLayoutMode.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, [query]);

  return matches;
}

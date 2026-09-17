import { useState, useEffect } from "react";

export type LayoutMode = "compact" | "medium" | "expanded" | "large";

/**
 * Returns the current layout mode based on window width.
 * Uses matchMedia and subscribes to changes — do NOT use window.innerWidth alone.
 *
 * Breakpoints:
 *   compact  < 600px
 *   medium   600–899px
 *   expanded 900–1199px
 *   large    1200px+
 *
 * Use this ONLY for JS-driven decisions (navigation type, sheet vs dialog vs panel).
 * Prefer CSS media queries for purely visual layout differences.
 */
function getLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "compact";
  const w = window.innerWidth;
  if (w >= 1200) return "large";
  if (w >= 900) return "expanded";
  if (w >= 600) return "medium";
  return "compact";
}

export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(getLayoutMode);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const compact = window.matchMedia("(max-width: 599px)");
    const medium = window.matchMedia("(min-width: 600px) and (max-width: 899px)");
    const expanded = window.matchMedia("(min-width: 900px) and (max-width: 1199px)");
    const large = window.matchMedia("(min-width: 1200px)");

    function update() {
      setMode(getLayoutMode());
    }

    const queries = [compact, medium, expanded, large];
    queries.forEach((q) => q.addEventListener?.("change", update));
    // Sync in case window changed between render and effect
    update();

    return () => {
      queries.forEach((q) => q.removeEventListener?.("change", update));
    };
  }, []);

  return mode;
}

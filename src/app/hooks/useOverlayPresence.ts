import { useLayoutEffect, useState } from "react";

/** Keep only the finite inert exit frame; a reversal cancels its removal. */
export function useOverlayPresence(open: boolean) {
  const [retained, setRetained] = useState(open);
  useLayoutEffect(() => {
    if (open) {
      setRetained(true);
      return;
    }
    const still =
      document.documentElement.classList.contains("reduce-motion") ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const token = getComputedStyle(document.documentElement).getPropertyValue("--motion-duration-fast").trim();
    const duration = parseFloat(token) * (token.endsWith("ms") ? 1 : 1000) || 150;
    const timer = window.setTimeout(() => setRetained(false), still ? 0 : duration);
    return () => window.clearTimeout(timer);
  }, [open]);
  return open || retained;
}

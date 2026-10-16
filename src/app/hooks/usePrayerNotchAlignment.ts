import { useLayoutEffect, useRef } from "react";
import type { PrayerName } from "../types";

/** One shared screen-space anchor keeps the decorative tips connected. */
export function usePrayerNotchAlignment(prayer: PrayerName | null, direction: "ltr" | "rtl") {
  const overviewRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const overview = overviewRef.current;
    const panel = panelRef.current;
    const card = overview?.querySelector<HTMLElement>(`[data-prayer="${prayer}"]`);
    const row = overview?.querySelector<HTMLElement>('[data-testid="home-all-prayers-row"]');
    if (!card || !panel || !row) return;
    let frame = 0;
    const align = () => {
      const small = card.getBoundingClientRect();
      const large = panel.getBoundingClientRect();
      const viewport = row.getBoundingClientRect();
      const start = Math.max(small.left + 20, large.left + 24, viewport.left + 20);
      const end = Math.min(small.right - 20, large.right - 24, viewport.right - 20);
      const x = Math.max(start, Math.min(end, small.left + small.width / 2));
      for (const [element, left] of [
        [card, small.left],
        [panel, large.left],
      ] as const) {
        element.style.setProperty("--prayer-notch-x", `${x - left - element.clientLeft}px`);
        element.style.setProperty("--prayer-notch-opacity", start <= end ? "1" : "0");
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(align);
    };
    const observer = new ResizeObserver(schedule);
    for (const element of [row, card, panel]) observer.observe(element);
    row.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    align();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      row.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      for (const element of [card, panel]) {
        element.style.removeProperty("--prayer-notch-x");
        element.style.removeProperty("--prayer-notch-opacity");
      }
    };
  }, [prayer, direction]);
  return { overviewRef, panelRef };
}

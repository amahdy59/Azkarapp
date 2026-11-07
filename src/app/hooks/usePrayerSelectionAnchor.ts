import { useLayoutEffect, type RefObject } from "react";
import type { PrayerName } from "../types";

/** Decorative alignment only: horizontal browsing never changes the selection. */
export function usePrayerSelectionAnchor(
  stripRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  prayer: PrayerName | null,
  direction: "rtl" | "ltr",
) {
  useLayoutEffect(() => {
    const row = stripRef.current?.querySelector<HTMLElement>('[data-testid="home-all-prayers-row"]');
    const panel = panelRef.current;
    const card = prayer && row?.querySelector<HTMLElement>(`[data-prayer="${prayer}"]`);
    if (!row || !panel || !card) return;

    let frameId = 0;
    const written = new Map<string, string>();
    const set = (name: string, value: number, unit = "px") => {
      const next = `${Math.round(value * 100) / 100}${unit}`;
      if (written.get(name) === next) return;
      written.set(name, next);
      panel.style.setProperty(name, next);
    };
    const measure = () => {
      frameId = 0;
      if (document.visibilityState === "hidden") return;
      const frame = row.getBoundingClientRect();
      const selected = card.getBoundingClientRect();
      const detail = panel.getBoundingClientRect();
      const center = selected.left + selected.width / 2 - detail.left;
      // Keep the receiving light clear of the panel's rounded corners.
      const width = Math.min(144, selected.width * 0.65, 2 * (Math.min(center, detail.width - center) - 24));
      const visible = Math.max(0, Math.min(selected.right, frame.right) - Math.max(selected.left, frame.left));
      // Firefox can place a flush card edge a fraction of a pixel outside the row.
      const visibleRatio = selected.width - visible < 0.01 ? 1 : visible / selected.width;
      const opacity = width > 0 && selected.width > 0 ? Math.max(0, Math.min(1, (visibleRatio - 0.6) / 0.4)) : 0;
      const clearance = stripRef.current!.getBoundingClientRect().bottom - selected.bottom;
      set("--prayer-panel-offset", 20 - clearance);
      set("--prayer-anchor-x", center);
      set("--prayer-anchor-width", Math.max(0, width));
      set("--prayer-anchor-opacity", opacity, "");
    };
    const schedule = () => {
      if (!frameId && document.visibilityState !== "hidden") frameId = requestAnimationFrame(measure);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") schedule();
      else if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };
    const observer = new ResizeObserver(schedule);
    for (const element of [row, card, panel]) observer.observe(element);
    row.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", onVisibility);
    measure();
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      row.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const name of ["x", "width", "opacity"]) panel.style.removeProperty(`--prayer-anchor-${name}`);
      panel.style.removeProperty("--prayer-panel-offset");
    };
  }, [stripRef, panelRef, prayer, direction]);
}

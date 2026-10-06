import { useLayoutEffect, useRef, useState } from "react";

export const COLLECTION_PANEL_MIN = 380;
export const COLLECTION_PANEL_DEFAULT = 420;
export const COLLECTION_PANEL_MAX = 600;
export const COLLECTION_READING_MIN = 480;
export const COLLECTION_PANEL_GUTTER = 12;

export function collectionPanelBounds(workspace: number) {
  const maximum = Math.floor(
    Math.min(COLLECTION_PANEL_MAX, workspace * 0.45, workspace - COLLECTION_READING_MIN - COLLECTION_PANEL_GUTTER),
  );
  return { minimum: COLLECTION_PANEL_MIN, maximum, canDock: maximum >= COLLECTION_PANEL_MIN };
}

/** Visit-local sizing: never changes reading preferences or synchronized data. */
export function useCollectionPanelSize(enabled: boolean) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState(0);
  const [preferredWidth, setPreferredWidth] = useState(COLLECTION_PANEL_DEFAULT);
  useLayoutEffect(() => {
    const element = workspaceRef.current;
    if (!enabled || !element) return;
    const measure = () => setWorkspace(element.getBoundingClientRect().width);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);
  const bounds = collectionPanelBounds(workspace);
  const width = Math.max(bounds.minimum, Math.min(preferredWidth, bounds.maximum));
  return {
    workspaceRef,
    ...bounds,
    width,
    setWidth: (next: number) => setPreferredWidth(Math.max(bounds.minimum, Math.min(next, bounds.maximum))),
    resetWidth: () => setPreferredWidth(COLLECTION_PANEL_DEFAULT),
  };
}

import { useLayoutEffect, useRef } from "react";

export type OverlayOrigin = "top" | "bottom";
interface OverlaySource {
  origin: OverlayOrigin;
  opener: HTMLElement | null;
  host: HTMLElement | null;
  frame: HTMLElement | null;
  touch: boolean;
}

let listeners = 0;
let activated: HTMLElement | null = null;
let activatedAt = 0;
let touch = false;
const openers = new WeakMap<Element, HTMLElement>();
export function registerOverlayOpener(surface: Element, opener: HTMLElement | null) {
  if (opener) openers.set(surface, opener);
}

export function overlayReturnTarget(opener: HTMLElement | null, frame?: HTMLElement | null): HTMLElement | null {
  const visible = (node: HTMLElement | null): node is HTMLElement => {
    if (!node?.isConnected || node.closest("[hidden], [inert], [aria-hidden=true]")) return false;
    for (let parent: HTMLElement | null = node; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden") return false;
    }
    return true;
  };
  if (visible(opener)) return opener;
  // A responsive reader may replace the phone opener with its wider tool rail.
  if (frame?.isConnected) {
    for (const id of ["mushaf-rail-more", "mushaf-rail-settings", "mushaf-more-actions", "mushaf-immersive-more"]) {
      const candidate = frame.querySelector<HTMLElement>(`[data-testid="${id}"]`);
      if (visible(candidate)) return candidate;
    }
  }
  return null;
}
function remember(event: Event) {
  if (!(event.target instanceof Element)) return;
  if (event.type === "pointerdown") touch = "pointerType" in event && event.pointerType === "touch";
  if (event.type === "keydown") touch = false;
  activated = event.target.closest<HTMLElement>('button, [role="button"], [role^="menuitem"], [role="combobox"]');
  activatedAt = Date.now();
}

/** One shared capture listener also remembers touch openers that Safari never focuses. */
function track() {
  if (listeners++ === 0) {
    document.addEventListener("pointerdown", remember, true);
    document.addEventListener("click", remember, true);
    document.addEventListener("focusin", remember, true);
    document.addEventListener("keydown", remember, true);
  }
  return () => {
    if (--listeners !== 0) return;
    document.removeEventListener("pointerdown", remember, true);
    document.removeEventListener("click", remember, true);
    document.removeEventListener("focusin", remember, true);
    document.removeEventListener("keydown", remember, true);
    activated = null;
    touch = false;
  };
}

function source(preferred?: OverlayOrigin): OverlaySource {
  const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const trigger = activated?.isConnected && Date.now() - activatedAt < 1500 ? activated : focused;
  const parent = trigger?.closest<HTMLElement>("[data-overlay-origin]");
  const opener = (parent && openers.get(parent)) ?? trigger;
  const inherited = parent?.dataset.overlayOrigin;
  const edge = opener?.closest<HTMLElement>("[data-overlay-edge]")?.dataset.overlayEdge;
  const rect = opener?.getBoundingClientRect();
  const origin =
    preferred ??
    (inherited === "top" || inherited === "bottom"
      ? inherited
      : edge === "top" || edge === "bottom"
        ? edge
        : rect && rect.height > 0 && rect.top + rect.height / 2 < window.innerHeight / 2
          ? "top"
          : "bottom");
  return {
    origin,
    opener: opener === document.body ? null : opener,
    touch,
    frame: opener?.closest<HTMLElement>("[data-toolbar-panel-frame]") ?? null,
    host:
      opener?.closest("[data-toolbar-panel-frame]")?.querySelector<HTMLElement>("[data-toolbar-panel-host]") ?? null,
  };
}

/** Freeze the physical origin for an opening, including nested-menu handoffs. */
export function useOverlayOrigin(open: boolean, preferred?: OverlayOrigin) {
  const snapshot = useRef<OverlaySource | null>(null);
  const wasOpen = useRef(false);
  // Capture before the new focus scope runs, never after autofocus moved inside.
  if (!snapshot.current || (open && !wasOpen.current)) snapshot.current = source(preferred);
  wasOpen.current = open;
  useLayoutEffect(track, []);
  return snapshot.current;
}

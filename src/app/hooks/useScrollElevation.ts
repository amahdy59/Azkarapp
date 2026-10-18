import { useEffect, useState, type RefObject } from "react";

/** Find the vertical viewport that carries content past this header. */
export function headerScrollViewport(anchor: HTMLElement): HTMLElement | null {
  const scope =
    anchor.closest<HTMLElement>(
      ".settings-nav-pane, .settings-detail-pane, .progress-screen-shell, .app-screen-surface, [data-testid='settings-screen']",
    ) ?? anchor.parentElement;
  const isViewport = (node: HTMLElement) =>
    !node.closest(".reader-text-scroll") && /^(auto|scroll)$/.test(getComputedStyle(node).overflowY);
  if (anchor.hasAttribute("data-header-scroll-owner")) return anchor;
  const explicit = scope?.querySelector<HTMLElement>("[data-header-scroll-owner]");
  // Sticky headers can live inside their viewport (Progress, wide Settings).
  for (let node = anchor.parentElement; node; node = node.parentElement) {
    // A fixed header's surrounding shell can also allow scrolling. Its marked
    // records viewport owns elevation; nearer enclosing viewports still win.
    if (node === scope && explicit) return explicit;
    if (isViewport(node)) return node;
    if (node === scope) break;
  }
  // Fixed headers can instead be siblings of their scrolling content. Prefer
  // an explicit owner, then the nearest vertical sibling branch. Never observe
  // arbitrary descendant scroll events such as charts, tabs or reading cards.
  if (explicit) return explicit;
  for (let parent = anchor.parentElement; parent; parent = parent.parentElement) {
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement) || child.contains(anchor)) continue;
      if (isViewport(child)) return child;
      const viewport = [...child.querySelectorAll<HTMLElement>("*")].find(isViewport);
      if (viewport) return viewport;
    }
    if (parent === scope) break;
  }
  return null;
}

/** Threshold-only state, initialized from restored scroll, with hysteresis. */
export function useScrollElevation(anchorRef: RefObject<HTMLElement>, enabled = true): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!enabled || !anchor) {
      setScrolled(false);
      return;
    }
    let viewport: HTMLElement | null = null;
    let elevated = false;
    const update = () => {
      const next = (viewport?.scrollTop ?? 0) > (elevated ? 2 : 8);
      if (next !== elevated) {
        elevated = next;
        setScrolled(next);
      }
    };
    const bind = () => {
      const next = headerScrollViewport(anchor);
      if (next !== viewport) {
        viewport?.removeEventListener("scroll", update);
        viewport = next;
        viewport?.addEventListener("scroll", update, { passive: true });
      }
      update();
    };
    bind();
    window.addEventListener("resize", bind, { passive: true });
    return () => {
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", bind);
    };
  }, [anchorRef, enabled]);
  return enabled && scrolled;
}

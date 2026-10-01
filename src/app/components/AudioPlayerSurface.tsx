import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Replace only the reading canvas; the header and app navigation stay usable. */
export function AudioPlayerSurface({
  dockedInReader,
  onCollapse,
  children,
}: {
  dockedInReader: boolean;
  onCollapse: () => void;
  children: ReactNode;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef(onCollapse);
  collapseRef.current = onCollapse;

  useLayoutEffect(() => {
    // Resolve after commit: playback status can replace the Reader's dock in
    // the same render. A document query during render can select its old canvas.
    setHost(
      dockedInReader
        ? (anchorRef.current?.closest<HTMLElement>('[data-testid="reader-card"]') ?? null)
        : document.querySelector<HTMLElement>("#main-content"),
    );
  }, [dockedInReader]);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    // Hidden reading controls must not remain in keyboard or screen-reader order.
    const covered = host ? Array.from(host.children).filter((child) => child !== surface) : [];
    const previous = covered.map((child) => ({
      child,
      inert: child.hasAttribute("inert"),
      hidden: child.getAttribute("aria-hidden"),
    }));
    surface.querySelector<HTMLButtonElement>("button")?.focus();
    for (const { child } of previous) {
      child.setAttribute("inert", "");
      child.setAttribute("aria-hidden", "true");
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector('[role="listbox"], [role="menu"], [role="dialog"]')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      collapseRef.current();
    };
    const onNavigate = () => collapseRef.current();
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("hashchange", onNavigate);
    return () => {
      const restoreStoppedFocus = surface.contains(document.activeElement);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("hashchange", onNavigate);
      for (const { child, inert, hidden } of previous) {
        if (!inert) child.removeAttribute("inert");
        if (hidden === null) child.removeAttribute("aria-hidden");
        else child.setAttribute("aria-hidden", hidden);
      }
      if (restoreStoppedFocus && dockedInReader) {
        requestAnimationFrame(() => {
          // Collapse restores Expand itself. Stop instead remounts the counter.
          if (host?.isConnected && document.activeElement === document.body) {
            host.querySelector<HTMLElement>('[data-testid="counter-surface"]')?.focus();
          }
        });
      }
    };
  }, [dockedInReader, host]);

  const surface = (
    <div ref={surfaceRef} className={`audio-player-surface${host ? "" : " audio-player-surface--viewport"}`}>
      {children}
    </div>
  );
  return (
    <>
      <span ref={anchorRef} hidden />
      {host === undefined ? null : host ? createPortal(surface, host) : surface}
    </>
  );
}

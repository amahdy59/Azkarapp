import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { useOverlayPresence } from "../hooks/useOverlayPresence";
import { createPortal } from "react-dom";
import { topOverlay, useOverlayBack } from "../hooks/useOverlayBack";
import { useToolbarPanel } from "../hooks/useToolbarPanel";
import { overlayReturnTarget, registerOverlayOpener, type OverlayOrigin } from "../hooks/useOverlayOrigin";

/** Non-modal reader content: the surrounding bars remain available to every input method. */
export function ToolbarPanel({
  open,
  onClose,
  host,
  opener,
  origin,
  title,
  direction,
  children,
  testId,
  className,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: {
  open: boolean;
  onClose: () => void;
  host: HTMLElement;
  opener: HTMLElement | null;
  origin: OverlayOrigin;
  title: string;
  direction: "ltr" | "rtl";
  children: ReactNode;
  testId?: string;
  className?: string;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  const back = useOverlayBack(open, onClose);
  const replaced = useToolbarPanel(open, ref, onClose);
  const retained = useOverlayPresence(open);
  const callbacks = useRef({ onClose, onCloseAutoFocus, onOpenAutoFocus });
  callbacks.current = { onClose, onCloseAutoFocus, onOpenAutoFocus };
  useLayoutEffect(() => {
    if (!open) return;
    const panel = ref.current;
    const frame = host.closest<HTMLElement>(".mushaf-reader-viewer");
    if (panel) registerOverlayOpener(panel, opener);
    const openEvent = new Event("openAutoFocus", { cancelable: true });
    callbacks.current.onOpenAutoFocus?.(openEvent);
    if (!openEvent.defaultPrevented) panel?.focus({ preventScroll: true });
    return () => {
      queueMicrotask(() => {
        // Run after any replaced Radix scope has released its focus ownership.
        const active = document.activeElement;
        if (active !== document.body && active && !panel?.contains(active)) return;
        const event = new Event("closeAutoFocus", { cancelable: true });
        callbacks.current.onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) overlayReturnTarget(opener, frame)?.focus({ preventScroll: true });
      });
    };
  }, [open, opener, host]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || topOverlay() !== ref.current) return;
      event.preventDefault();
      event.stopPropagation();
      callbacks.current.onClose();
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return open || (retained && !replaced.current)
    ? createPortal(
        <section
          ref={ref}
          tabIndex={-1}
          aria-labelledby={titleId}
          dir={direction}
          {...(!open ? { inert: "" } : {})}
          aria-hidden={!open || undefined}
          data-toolbar-panel=""
          data-overlay-surface="panel"
          data-overlay-origin={origin}
          data-state={open ? "open" : "closed"}
          data-back-dismiss={back}
          data-testid={testId}
          data-prevent-count="true"
          className={`toolbar-panel ${className ?? ""}`}
        >
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
          {children}
        </section>,
        host,
      )
    : null;
}

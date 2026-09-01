import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, type ReactNode } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { useLayoutMode } from "../hooks/useLayoutMode";

/**
 * Returns focus to whatever was focused before the surface opened.
 *
 * Radix and Vaul both restore focus on close, but only while their root stays
 * mounted. Callers here conditionally render (`if (!open) return null`), so the
 * root is torn down in the same commit and the built-in restore is lost —
 * focus falls back to `<body>`. Restoring from an effect cleanup runs after
 * React has committed the removal, which works for both mount patterns.
 */
function useRestoreFocusOnClose(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Required accessible name. Rendered visually hidden — content supplies its own visible heading. */
  title: string;
  direction: "ltr" | "rtl";
  children: ReactNode;
  testId?: string;
  describedById?: string;
  /** Defaults to the DEC-004 reading measure. */
  maxWidthClassName?: string;
  className?: string;
  /**
   * Overrides the scrim. A surface whose controls change what is behind it —
   * the Mushaf's reading settings — wants the page legible while it is open,
   * rather than choosing a theme against a grey field.
   *
   * Keep utility-shaped words out of this comment: Tailwind v4 scans comments
   * for class candidates, and a bare one here compiles a rule nothing uses.
   */
  overlayClassName?: string;
}

/**
 * Centered modal dialog built on Radix Dialog: real focus containment, focus
 * restore to the trigger on close, Escape dismissal, and background scroll
 * locking. The hand-rolled `role="dialog"` overlays this replaces had none of
 * that — see DEC-025.
 */
export function Modal({
  open,
  onClose,
  title,
  direction,
  children,
  testId,
  describedById,
  maxWidthClassName = "max-w-[var(--content-reading)]",
  className = "",
  overlayClassName,
}: ModalProps) {
  useRestoreFocusOnClose(open);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={
            overlayClassName
              ? `fixed inset-0 z-[100] animate-in fade-in-0 duration-standard ${overlayClassName}`
              : "fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-standard"
          }
        />
        <DialogPrimitive.Content
          data-testid={testId}
          data-prevent-count="true"
          aria-describedby={describedById}
          dir={direction}
          // A modal consumes Escape. Without this the same keypress also
          // reaches the app's global shortcut handlers — e.g. ReaderScreen
          // treats Escape as "leave the reader", so dismissing a dialog would
          // exit the reading session underneath it.
          onEscapeKeyDown={(event) => event.stopPropagation()}
          className={`fixed left-1/2 top-1/2 z-[100] flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col ${maxWidthClassName} max-h-[85vh] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-overlay outline-none animate-in fade-in-0 zoom-in-95 duration-standard ${className}`.trim()}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface SidePanelProps extends Omit<ModalProps, "maxWidthClassName"> {
  /** The physical edge the panel docks to. */
  side: "right" | "left";
  /**
   * Pixels to hold back from that edge, so the panel can dock against a tool
   * rail rather than over it. The rail stays visible as the thing the panel
   * came out of, even while the modal makes it inert.
   */
  inset?: number;
}

/**
 * A panel docked to one edge of the screen, full height.
 *
 * The Mushaf's reading settings act on the page behind them — theme, type size,
 * how many pages are showing. A centred dialog sits on top of the thing it is
 * changing; a docked panel sits beside it, so the reader can watch the page
 * respond while they choose. It is only worth the width where there is width to
 * spare, which is the same landscape screen that carries the tool rail.
 *
 * Modality, focus containment, Escape, and focus restore all come from Radix,
 * exactly as {@link Modal} does — the scrim is lighter, not absent (DEC-025).
 */
export function SidePanel({
  open,
  onClose,
  title,
  direction,
  children,
  testId,
  describedById,
  side,
  inset = 0,
  className = "",
}: SidePanelProps) {
  useRestoreFocusOnClose(open);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="animate-in fade-in-0 fixed inset-0 z-[100] bg-black/25 duration-standard" />
        <DialogPrimitive.Content
          data-testid={testId}
          data-prevent-count="true"
          data-side={side}
          aria-describedby={describedById}
          dir={direction}
          // See Modal: a modal consumes Escape so it never also reaches the
          // reader's own shortcut handlers underneath.
          onEscapeKeyDown={(event) => event.stopPropagation()}
          style={inset > 0 ? { [side]: `${inset}px` } : undefined}
          className={`animate-in fixed inset-y-0 z-[100] flex w-[22rem] max-w-[calc(100%-3rem)] flex-col overflow-y-auto bg-card shadow-overlay duration-standard outline-none ${
            side === "right" ? "right-0 border-l slide-in-from-right" : "left-0 border-r slide-in-from-left"
          } border-border/60 ${className}`.trim()}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface ResponsiveSheetProps extends Omit<ModalProps, "className"> {
  /** Extra classes for the desktop dialog surface only. */
  dialogClassName?: string;
  /** Extra classes for the compact drawer surface only. */
  drawerClassName?: string;
}

/**
 * One modal surface with two presentations: a Vaul bottom sheet on compact
 * viewports and a centered {@link Modal} on medium and up. Both branches
 * provide focus containment, focus restore, Escape dismissal, and scroll lock.
 */
export function ResponsiveSheet({
  open,
  onClose,
  title,
  direction,
  children,
  testId,
  describedById,
  maxWidthClassName,
  overlayClassName,
  dialogClassName = "",
  drawerClassName = "",
}: ResponsiveSheetProps) {
  const layoutMode = useLayoutMode();
  const isCompact = layoutMode === "compact";
  // Modal runs this itself; only the drawer branch needs it here.
  useRestoreFocusOnClose(isCompact && open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, onClose]);

  if (!isCompact) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        direction={direction}
        testId={testId}
        describedById={describedById}
        maxWidthClassName={maxWidthClassName}
        overlayClassName={overlayClassName}
        className={dialogClassName}
      >
        {children}
      </Modal>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DrawerContent
        data-testid={testId}
        data-prevent-count="true"
        aria-describedby={describedById}
        dir={direction}
        className={`fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-lg flex-col rounded-t-3xl border-t border-border/40 bg-background shadow-overlay outline-none focus-visible:outline-none max-h-[88vh] pb-safe ${drawerClassName}`.trim()}
      >
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

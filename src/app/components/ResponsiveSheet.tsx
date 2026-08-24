import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, type ReactNode } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "./ui/drawer";
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in-0 duration-standard" />
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
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
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
  dialogClassName = "",
  drawerClassName = "",
}: ResponsiveSheetProps) {
  const layoutMode = useLayoutMode();
  const isCompact = layoutMode === "compact";
  // Modal runs this itself; only the drawer branch needs it here.
  useRestoreFocusOnClose(isCompact && open);

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
        <DrawerDescription className="sr-only">{title}</DrawerDescription>
        {children}
      </DrawerContent>
    </Drawer>
  );
}

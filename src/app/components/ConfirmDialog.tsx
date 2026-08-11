import { type ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** When true, the confirm button uses destructive (red) styling */
  destructive?: boolean;
  /** Optional extra content rendered inside the dialog body */
  children?: ReactNode;
}

/**
 * Accessible confirmation dialog built on Radix AlertDialog.
 *
 * Replaces native `window.confirm()` throughout the app, providing:
 * - Proper keyboard trap focus inside the dialog
 * - Full dark/light mode & RTL-aware theming
 * - WCAG-compliant ARIA roles (`role="alertdialog"` via Radix)
 * - Visible, styled confirm and cancel buttons instead of OS-native chrome
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  secondaryLabel,
  onSecondary,
  destructive = false,
  children,
}: ConfirmDialogProps) {
  const appShell = typeof document === "undefined" ? undefined : document.querySelector<HTMLElement>(".app-shell");
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    try {
      setErrorMessage("");
      setIsConfirming(true);
      await onConfirm();
    } catch (error) {
      const isArabic = typeof document !== "undefined" && document.documentElement.lang === "ar";
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isArabic
            ? "تعذر إكمال الإجراء. حاول مرة أخرى."
            : "The action could not be completed. Try again.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isConfirming) onCancel();
      }}
    >
      <AlertDialogContent
        portalContainer={appShell}
        className="rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[1.0625rem] font-bold text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        {errorMessage && (
          <p
            className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
        <AlertDialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isConfirming}
            className="h-11 rounded-xl border border-border-control bg-background px-5 text-[0.9375rem] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {cancelLabel}
          </AlertDialogCancel>
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              disabled={isConfirming}
              className="h-11 rounded-xl border border-border-control bg-muted px-5 text-[0.9375rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {secondaryLabel}
            </button>
          )}
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            disabled={isConfirming}
            aria-busy={isConfirming || undefined}
            className={`h-11 rounded-xl px-5 text-[0.9375rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

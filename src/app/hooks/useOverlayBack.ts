import { useEffect, useId } from "react";

const dismissers = new Map<string, () => void>();
const layers = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';

export function topOverlay(): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(layers)]
    .filter(
      (node) =>
        !node.closest('[aria-hidden="true"], [inert], [hidden], [data-state="closed"]') &&
        getComputedStyle(node).display !== "none" &&
        getComputedStyle(node).visibility !== "hidden",
    )
    .at(-1);
}

/** Hardware Back belongs to the foremost overlay before route history. */
export function dismissTopOverlay(): boolean {
  const layer = topOverlay();
  if (!layer) return false;
  const dismiss = dismissers.get(layer.dataset.backDismiss ?? "");
  if (dismiss) dismiss();
  else layer.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  return true;
}

export function useOverlayBack(open: boolean, onClose: () => void): string {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    dismissers.set(id, onClose);
    return () => {
      dismissers.delete(id);
    };
  }, [id, onClose, open]);
  return id;
}

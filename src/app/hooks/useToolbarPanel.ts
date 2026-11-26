import { useId, useLayoutEffect, useRef, type RefObject } from "react";

const panelEvent = "azkar-toolbar-panel-open";

/** A reader has one ordinary panel; nested blocking dialogs remain independent. */
export function useToolbarPanel(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const id = useId();
  const close = useRef(onClose);
  const replaced = useRef(false);
  close.current = onClose;
  useLayoutEffect(() => {
    if (!open) return;
    replaced.current = false;
    const host = ref.current?.closest("[data-toolbar-panel-frame]");
    if (!host) return;
    const replace = (event: Event) => {
      const detail = (event as CustomEvent<{ host: Element; id: string }>).detail;
      if (detail.host === host && detail.id !== id) {
        replaced.current = true;
        close.current();
      }
    };
    document.addEventListener(panelEvent, replace);
    document.dispatchEvent(new CustomEvent(panelEvent, { detail: { host, id } }));
    return () => document.removeEventListener(panelEvent, replace);
  }, [open, id, ref]);
  return replaced;
}

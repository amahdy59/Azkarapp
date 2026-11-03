import { useEffect, useRef, type RefObject } from "react";

/** Touch dismissal must run before reading surfaces consume bubbling clicks. */
export function usePopoverOutsideDismiss(
  open: boolean,
  dismiss: () => void,
  trigger: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>,
  childSelector?: string,
) {
  const outside = useRef(false);
  useEffect(() => {
    if (!open) return;
    outside.current = false;
    const pointer = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        trigger.current?.contains(target) ||
        content.current?.contains(target) ||
        (childSelector && target.closest(childSelector))
      )
        return;
      outside.current = true;
      dismiss();
    };
    document.addEventListener("pointerdown", pointer, true);
    return () => document.removeEventListener("pointerdown", pointer, true);
  }, [open, dismiss, trigger, content, childSelector]);
  return (event: Event) => {
    if (outside.current) event.preventDefault();
  };
}

import { useEffect, useRef } from "react";

/** A reading viewport shows its boundary for Tab entry, not counting/device keys. */
export function useReadingFocusIndicator() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tabEntry = false;
    const clear = () => {
      tabEntry = false;
      ref.current?.removeAttribute("data-reading-keyboard-focus");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      tabEntry = event.key === "Tab";
      if (event.key === " " || event.code === "Space" || /^(Audio)?Volume(Up|Down|Mute)$/.test(event.key)) {
        clear();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target === ref.current) {
        ref.current?.toggleAttribute("data-reading-keyboard-focus", tabEntry);
      }
      tabEntry = false;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (event.target === ref.current) ref.current?.removeAttribute("data-reading-keyboard-focus");
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", clear, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    window.addEventListener("blur", clear);
    return () => {
      clear();
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", clear, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return ref;
}

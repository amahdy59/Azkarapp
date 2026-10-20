import { useEffect } from "react";

/** Native :active misses Enter on buttons; keep the same response for keyboards. */
export function useControlFeedback() {
  useEffect(() => {
    let pressed: HTMLElement | null = null;
    let released: HTMLElement | null = null;
    const clearReleased = () => {
      released?.removeAttribute("data-key-released");
      released = null;
    };
    const release = () => {
      if (!pressed) return;
      clearReleased();
      // WebKit can retain native :active after Space + Tab. Let keyboard
      // release win until the next real pointer or keyboard activation.
      released = pressed;
      released.setAttribute("data-key-released", "");
      pressed?.removeAttribute("data-key-pressed");
      pressed = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.repeat ||
        (event.key !== "Enter" && event.key !== " ")
      )
        return;
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        target.isContentEditable ||
        target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      const control = target.closest<HTMLElement>(
        'button, a[href], [role="button"], [role="radio"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="checkbox"], summary',
      );
      if (
        !control ||
        control.matches(':disabled, [aria-disabled="true"], [data-disabled], [aria-readonly="true"], .no-press')
      )
        return;
      if (event.key === " " && control.matches("a[href]")) return;
      release();
      clearReleased();
      pressed = control;
      control.setAttribute("data-key-pressed", "");
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") release();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    document.addEventListener("focusout", release, true);
    document.addEventListener("pointercancel", release, true);
    document.addEventListener("pointerdown", clearReleased, true);
    document.addEventListener("visibilitychange", release);
    window.addEventListener("blur", release);
    return () => {
      release();
      clearReleased();
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      document.removeEventListener("focusout", release, true);
      document.removeEventListener("pointercancel", release, true);
      document.removeEventListener("pointerdown", clearReleased, true);
      document.removeEventListener("visibilitychange", release);
      window.removeEventListener("blur", release);
    };
  }, []);
}

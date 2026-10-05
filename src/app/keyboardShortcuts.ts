import { useSyncExternalStore } from "react";

// A visit-local preference: no new persisted or synchronized user data.
let characterShortcutsEnabled = true;
const listeners = new Set<() => void>();

export function setCharacterShortcutsEnabled(enabled: boolean) {
  characterShortcutsEnabled = enabled;
  listeners.forEach((listener) => listener());
}

export function useCharacterShortcutsEnabled() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => characterShortcutsEnabled,
    () => true,
  );
}

export function isCounterShortcutBlocked(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return true;
  if (event.key.length === 1 && event.key !== " " && (!characterShortcutsEnabled || event.repeat)) return true;
  // Native controls and modal surfaces own all their keys, including Escape.
  if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return true;
  const active = document.activeElement;
  return (
    active instanceof Element &&
    Boolean(
      active.closest(
        'button, a[href], input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="checkbox"], [role="combobox"], [role="menu"], [role="menuitem"], [role="option"], [role="radio"], [role="slider"], [role="separator"], [role="switch"], [role="tab"], [role="textbox"], [inert]',
      ),
    )
  );
}

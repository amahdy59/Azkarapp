import { afterEach, describe, expect, it } from "vitest";
import { isCounterShortcutBlocked, setCharacterShortcutsEnabled } from "./keyboardShortcuts";

afterEach(() => {
  document.body.innerHTML = "";
  setCharacterShortcutsEnabled(true);
});

describe("counter shortcut boundaries", () => {
  it("leaves resizing keys to a focused interactive separator", () => {
    const separator = document.createElement("div");
    separator.setAttribute("role", "separator");
    separator.tabIndex = 0;
    document.body.append(separator);
    separator.focus();
    for (const key of ["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "])
      expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key }))).toBe(true);
  });
  it("disables character shortcuts without disabling counting or navigation", () => {
    setCharacterShortcutsEnabled(false);
    for (const key of ["r", "R", "ق", "s", "b", "[", "?"])
      expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key }))).toBe(true);
    for (const key of [" ", "ArrowLeft", "ArrowRight", "Escape"])
      expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key }))).toBe(false);
  });
  it("leaves editing, modal, modified, and composing keys to their owners", () => {
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "r" }))).toBe(true);
    input.remove();
    for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }])
      expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "r", ...options }))).toBe(true);
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "Escape" }))).toBe(true);
  });
  it("does not repeat destructive character actions while allowing deliberate Space repeats", () => {
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "r", repeat: true }))).toBe(true);
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: " ", repeat: true }))).toBe(false);
  });
});

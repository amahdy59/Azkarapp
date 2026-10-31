import { afterEach, expect, it } from "vitest";
import { isCounterShortcutBlocked, setCharacterShortcutsEnabled } from "./keyboardShortcuts";
afterEach(() => {
  document.body.replaceChildren();
  setCharacterShortcutsEnabled(true);
});
it("only explicitly permits Reader shortcuts from its counter, preserving consumed keys and modal protection", () => {
  const button = document.createElement("button");
  button.dataset.testid = "counter-surface";
  document.body.append(button);
  button.focus();
  const reset = new KeyboardEvent("keydown", { key: "r", cancelable: true });
  expect(isCounterShortcutBlocked(reset)).toBe(true);
  expect(isCounterShortcutBlocked(reset, true)).toBe(false);
  reset.preventDefault();
  expect(isCounterShortcutBlocked(reset, true)).toBe(true);
  const arrow = new KeyboardEvent("keydown", { key: "ArrowLeft" });
  const dialog = document.createElement("section");
  dialog.setAttribute("role", "dialog");
  document.body.append(dialog);
  expect(isCounterShortcutBlocked(arrow, true)).toBe(true);
  dialog.remove();
  setCharacterShortcutsEnabled(false);
  expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "r" }), true)).toBe(true);
  delete button.dataset.testid;
  expect(isCounterShortcutBlocked(arrow, true)).toBe(true);
});

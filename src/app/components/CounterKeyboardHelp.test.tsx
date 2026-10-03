import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CounterKeyboardHelp } from "./CounterKeyboardHelp";
import { isCounterShortcutBlocked, setCharacterShortcutsEnabled } from "../keyboardShortcuts";

afterEach(() => setCharacterShortcutsEnabled(true));
describe("counter keyboard help", () => {
  it("opens from a visible control, disables character shortcuts, and restores focus", async () => {
    render(<CounterKeyboardHelp shortcuts={[{ keys: ["R"], label: "Reset" }]} language="en" direction="ltr" />);
    const trigger = screen.getByRole("button", { name: "Keyboard shortcuts" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Enable single-key shortcuts for this visit" }));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    trigger.blur();
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: "r" }))).toBe(true);
    expect(isCounterShortcutBlocked(new KeyboardEvent("keydown", { key: " " }))).toBe(false);
  });
  it("opens with question mark on the reading surface without intercepting typing", () => {
    render(
      <>
        <input aria-label="Search" />
        <CounterKeyboardHelp shortcuts={[]} language="en" direction="ltr" />
      </>,
    );
    screen.getByRole("textbox").focus();
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    screen.getByRole("textbox").blur();
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

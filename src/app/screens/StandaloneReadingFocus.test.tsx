import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CustomCounterScreen } from "./CustomCounterScreen";
import { FridaySalawatScreen } from "./FridaySalawatScreen";

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

it.each(["masbaha", "salawat"] as const)(
  "%s shares reader focus without changing the tally or leaving the screen",
  async (kind) => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(
      kind === "masbaha" ? (
        <CustomCounterScreen isArabic={false} direction="ltr" onBack={onBack} />
      ) : (
        <FridaySalawatScreen language="en" direction="ltr" onBack={onBack} />
      ),
    );
    const counter = screen.getByTestId(kind === "masbaha" ? "custom-counter-surface" : "salawat-counter");
    fireEvent.click(counter);
    const tally = counter.getAttribute("aria-label");
    const toggle = screen.getByTestId("reader-tools-toggle");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveFocus();
    expect(counter).toHaveAttribute("aria-label", tally);
    expect(screen.queryByRole("button", { name: "Mute counter sound" })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("region", { name: "Zikr reading text" })).toHaveFocus();
    expect(counter).toHaveAttribute("aria-label", tally);
    expect(onBack).not.toHaveBeenCalled();
  },
);

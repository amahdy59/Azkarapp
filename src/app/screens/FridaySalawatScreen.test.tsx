import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFridaySalawatProgress } from "../fridayProgress";
import { FridaySalawatScreen } from "./FridaySalawatScreen";

describe("FridaySalawatScreen", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("counts across the devotional canvas, supports targets, and resets", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 100 });
    await user.click(screen.getByTestId("counter-target-filter"));
    await user.click(screen.getByRole("menuitemradio", { name: "10" }));
    const counter = screen.getByTestId("salawat-counter");
    expect(counter).toHaveAttribute("data-counter-shape", "rectangle");
    for (let count = 0; count < 10; count += 1) fireEvent.click(counter);

    expect(counter).toHaveAccessibleName("Completed 10 / 10");
    expect(readFridaySalawatProgress()).toEqual({ count: 10, target: 10 });

    fireEvent.click(screen.getByRole("button", { name: "Reset counter" }));
    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 10 });
  });

  it("supports an arbitrary target without offering an open-ended Friday goal", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    await user.click(screen.getByTestId("counter-target-filter"));
    expect(screen.queryByRole("menuitemradio", { name: "Open" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Custom" }));
    const input = screen.getByRole("spinbutton", { name: /^Target:?$/ });
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: /Apply Target/i }));

    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 250 });
    expect(screen.getByTestId("salawat-counter")).toHaveAccessibleName(/0 \/ 250/);
  });

  it("opens both authentic hadith references from the header benefits action", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    await user.click(screen.getByRole("button", { name: "Authentic benefits" }));
    expect(screen.getByRole("link", { name: /Sahih Muslim 408/ })).toHaveAttribute(
      "href",
      "https://sunnah.com/muslim:408",
    );
    expect(screen.getByRole("link", { name: /Sunan Abi Dawud 1047/ })).toHaveAttribute(
      "href",
      "https://sunnah.com/abudawud:1047",
    );
  });
});

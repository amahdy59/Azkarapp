import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFridaySalawatProgress } from "../fridayProgress";
import { FridaySalawatScreen } from "./FridaySalawatScreen";

describe("FridaySalawatScreen", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("counts only through the counter, supports targets, and resets", () => {
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "10" }));
    const counter = screen.getByTestId("salawat-counter");
    expect(counter).toHaveAttribute("data-counter-shape", "rectangle");
    for (let count = 0; count < 10; count += 1) fireEvent.click(counter);

    expect(counter).toHaveAccessibleName("Completed 10 / 10");
    expect(readFridaySalawatProgress()).toEqual({ count: 10, target: 10 });

    fireEvent.click(screen.getByRole("button", { name: "Reset counter" }));
    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 10 });
  });

  it("links both authentic hadith references", () => {
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

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

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NetworkStatus } from "./NetworkStatus";

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

describe("NetworkStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
    setOnline(true);
  });

  it("collapses an offline notice and confirms reconnection", () => {
    vi.useFakeTimers();
    setOnline(false);
    render(<NetworkStatus language="en" />);

    expect(screen.getByRole("button", { name: /reading and progress continue locally/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    act(() => vi.advanceTimersByTime(5000));
    const compact = screen.getByRole("button", { name: "Offline" });
    expect(compact).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(compact);
    expect(screen.getByRole("button", { name: /reading and progress continue locally/i })).toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.getByRole("status")).toHaveTextContent("You’re back online");
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

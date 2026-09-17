import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

function Clock() {
  const now = useNow();
  return <span data-testid="clock">{now.toISOString()}</span>;
}

const reading = () => screen.getByTestId("clock").textContent;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useNow", () => {
  it("moves the reading forward on the wall-clock minute", () => {
    vi.setSystemTime(new Date("2026-08-19T10:30:20Z"));
    render(<Clock />);
    expect(reading()).toBe("2026-08-19T10:30:20.000Z");

    // Aligned to the boundary, not 60s after mount: the reading changes in the
    // same second the minute a screen displays does.
    act(() => void vi.advanceTimersByTime(40_000));
    expect(reading()).toBe("2026-08-19T10:30:20.000Z");
    act(() => void vi.advanceTimersByTime(50));
    expect(reading()).toBe("2026-08-19T10:31:00.050Z");
  });

  it("crosses midnight, so the day a screen writes to is the day it is", () => {
    vi.setSystemTime(new Date("2026-08-19T23:59:30Z"));
    render(<Clock />);
    expect(reading()?.startsWith("2026-08-19")).toBe(true);

    act(() => void vi.advanceTimersByTime(60_000));
    expect(reading()?.startsWith("2026-08-20")).toBe(true);
  });

  it("resynchronises on return rather than trusting a throttled timer", () => {
    vi.setSystemTime(new Date("2026-08-19T22:00:00Z"));
    render(<Clock />);

    // What a backgrounded tab looks like: hours pass with no timer firing.
    const hidden = vi.spyOn(document, "visibilityState", "get");
    hidden.mockReturnValue("hidden");
    vi.setSystemTime(new Date("2026-08-20T07:30:00Z"));
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    expect(reading()?.startsWith("2026-08-19")).toBe(true);

    hidden.mockReturnValue("visible");
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    expect(reading()).toBe("2026-08-20T07:30:00.000Z");
    hidden.mockRestore();
  });
});

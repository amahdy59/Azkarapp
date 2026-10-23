import { useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrayerCountdown } from "./usePrayerCountdown";
import type { PrayerCountdownInterval } from "../prayerCountdown";

const base = Date.parse("2026-10-20T10:00:00Z");
const interval = { startsAt: base - 60_000, endsAt: base + 3600_000 };
function Clock({ target = interval }: { target?: PrayerCountdownInterval }) {
  const ref = useRef<HTMLDivElement>(null);
  const now = usePrayerCountdown(ref, target);
  return (
    <div ref={ref} data-testid="clock">
      {now}
    </div>
  );
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(base);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("next prayer card clock", () => {
  it("aligns to real seconds, catches up after suspension, and stops at the deadline", () => {
    const { unmount } = render(<Clock target={{ ...interval, endsAt: base + 5000 }} />);
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(1015));
    expect(screen.getByTestId("clock")).toHaveTextContent(String(base + 1015));
    // A delayed callback must read wall time, never decrement a stale counter.
    vi.setSystemTime(base + 10_000);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("clock")).toHaveTextContent(String(base + 11_000));
    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });
  it("stops while hidden and resynchronizes immediately on return", () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(<Clock />);
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(base + 100_000);
    visibility.mockReturnValue("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(screen.getByTestId("clock")).toHaveTextContent(String(base + 100_000));
    expect(vi.getTimerCount()).toBe(1);
    visibility.mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does no offscreen work and disconnects the observer/timer on unmount", () => {
    let notify: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    const { unmount } = render(<Clock />);
    const update = (isIntersecting: boolean) =>
      act(() => notify([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(vi.getTimerCount()).toBe(0);
    update(true);
    expect(vi.getTimerCount()).toBe(1);
    update(false);
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(base + 35_000);
    update(true);
    expect(screen.getByTestId("clock")).toHaveTextContent(String(base + 35_000));
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("replaces interval ownership without duplicating ticks and rejects malformed intervals", () => {
    const { rerender } = render(<Clock />);
    rerender(<Clock target={{ ...interval, endsAt: base + 7200_000 }} />);
    expect(vi.getTimerCount()).toBe(1);
    rerender(<Clock target={{ startsAt: base, endsAt: base }} />);
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByTestId("clock")).toBeEmptyDOMElement();
    rerender(<Clock target={{ startsAt: NaN, endsAt: Infinity }} />);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses current wall time when a previously inactive card becomes next before visibility delivery", () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    const { rerender } = render(<Clock target={{ startsAt: base, endsAt: base }} />);
    vi.setSystemTime(base + 300_000);
    rerender(<Clock />);
    expect(screen.getByTestId("clock")).toHaveTextContent(String(base + 300_000));
    expect(vi.getTimerCount()).toBe(0);
  });
});

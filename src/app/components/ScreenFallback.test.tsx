import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScreenFallback } from "./ScreenFallback";

afterEach(() => vi.useRealTimers());

describe("ScreenFallback", () => {
  it("offers safe refresh after sustained loading and cancels its timer on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<ScreenFallback language="en" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button")).toBeNull();
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole("status")).toHaveTextContent("Your local progress is safe");
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false");
    expect(screen.getByRole("button", { name: "Refresh app" })).toBeVisible();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses Arabic recovery copy without making the refresh button part of the live region", () => {
    vi.useFakeTimers();
    render(<ScreenFallback language="ar" />);
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole("status")).toHaveTextContent("تقدمك المحلي محفوظ");
    expect(screen.getByRole("status")).not.toContainElement(screen.getByRole("button", { name: "تحديث التطبيق" }));
  });
});

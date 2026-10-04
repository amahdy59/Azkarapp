import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  afterEach(() => vi.useRealTimers());

  it("retains labelled progress and clamps the visual fill across updates", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<ProgressBar value={5} max={20} direction="rtl" aria-label="Reading" />);
    act(() => vi.advanceTimersByTime(32));
    const track = screen.getByRole("progressbar", { name: "Reading" });
    const fill = container.querySelector<HTMLElement>('[data-slot="progress-fill"]')!;
    expect(track).toHaveAttribute("dir", "rtl");
    expect(track).toHaveAttribute("aria-valuenow", "5");
    expect(fill.style.getPropertyValue("--progress-ratio")).toBe("0.25");
    rerender(<ProgressBar value={20} max={20} direction="rtl" aria-label="Reading" />);
    expect(fill.style.getPropertyValue("--progress-ratio")).toBe("1");
    rerender(<ProgressBar value={0} max={0} direction="ltr" aria-label="Reading" />);
    expect(fill.style.getPropertyValue("--progress-ratio")).toBe("0");
    expect(track).toHaveAttribute("dir", "ltr");
    expect(fill.style.width).toBe("");
  });
});

import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DownloadProgress } from "./DownloadProgress";

describe("DownloadProgress", () => {
  afterEach(() => vi.useRealTimers());

  it("renders with accessible progressbar attributes, value, and direction in English", () => {
    vi.useFakeTimers();
    const { container } = render(
      <DownloadProgress
        completed={250}
        total={1000}
        label="Adhkar audio"
        language="en"
        direction="ltr"
        active={true}
      />,
    );
    act(() => vi.advanceTimersByTime(32));

    const progress = screen.getByRole("progressbar", { name: "Adhkar audio" });
    expect(progress).toHaveAttribute("value", "250");
    expect(progress).toHaveAttribute("aria-valuenow", "250");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "1000");
    expect(progress).toHaveAttribute("aria-valuetext", "25% downloaded");
    expect(progress).toHaveAttribute("dir", "ltr");

    // Localized visible percentage text
    expect(screen.getByText("25% downloaded")).toBeInTheDocument();

    // Screen reader milestone announcement
    const status = container.querySelector('[role="status"]');
    expect(status).toHaveTextContent("Adhkar audio: 25% downloaded");
  });

  it("formats numerals and supports RTL direction in Arabic", () => {
    vi.useFakeTimers();
    const { container } = render(
      <DownloadProgress
        completed={500}
        total={1000}
        label="تسجيلات الأذكار"
        language="ar"
        direction="rtl"
        active={true}
      />,
    );
    act(() => vi.advanceTimersByTime(32));

    const progress = screen.getByRole("progressbar", { name: "تسجيلات الأذكار" });
    expect(progress).toHaveAttribute("value", "500");
    expect(progress).toHaveAttribute("aria-valuenow", "500");
    expect(progress).toHaveAttribute("dir", "rtl");
    expect(progress).toHaveAttribute("aria-valuetext", "تم تنزيل ٥٠%");

    expect(screen.getByText("تم تنزيل ٥٠%")).toBeInTheDocument();

    const status = container.querySelector('[role="status"]');
    expect(status).toHaveTextContent("تسجيلات الأذكار: تم تنزيل ٥٠%");
  });

  it("clamps percentages between 0 and 100 gracefully", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <DownloadProgress completed={0} total={0} label="Empty test" language="en" direction="ltr" />,
    );
    act(() => vi.advanceTimersByTime(32));
    expect(screen.getByText("0% downloaded")).toBeInTheDocument();

    rerender(<DownloadProgress completed={200} total={100} label="Over test" language="en" direction="ltr" />);
    expect(screen.getByText("100% downloaded")).toBeInTheDocument();
  });
});

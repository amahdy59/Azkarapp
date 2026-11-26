import { chooseProgressOption } from "../../test/progressSelect";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import * as dashboardDomain from "../progressDashboard";
import * as dailyPathDomain from "../dailyPath";
import type { DailyCollectionCompletion } from "../types";

async function choosePeriod(period: string) {
  fireEvent.click(screen.getByTestId("progress-filters-toggle"));
  await chooseProgressOption(screen.getAllByRole("combobox")[0]!, period);
}

describe("ProgressScreen", () => {
  it.each(["Escape", "Close", "preset", "custom"])(
    "restores the date opener after %s even when opening did not focus it",
    async (action) => {
      render(
        <ProgressScreen
          dailyCompletions={[]}
          progressDayStartHour={3}
          calendarType="gregorian"
          language="en"
          direction="ltr"
          onOpenShareModal={vi.fn()}
        />,
      );
      const opener = screen.getByTestId("progress-filters-toggle");
      expect(opener).not.toHaveFocus();
      fireEvent.click(opener);
      const dialog = screen.getByRole("dialog", { name: "Date filters" });
      if (action === "Escape") {
        fireEvent.keyDown(dialog, { key: "Escape" });
      } else if (action === "Close") {
        fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
      } else {
        await chooseProgressOption(within(dialog).getByRole("combobox"), action === "custom" ? "custom" : "week");
        if (action === "custom") fireEvent.click(screen.getByRole("button", { name: "Apply", exact: true }));
        expect(opener).toHaveAttribute("data-progress-value", action === "custom" ? "custom" : "week");
      }
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(opener).toHaveFocus());
    },
  );
  it("defaults to Month and leaves optional reflection calculations unmounted", () => {
    const pathIndex = vi.spyOn(dailyPathDomain, "createDailyPathIndex");
    try {
      render(
        <ProgressScreen
          dailyCompletions={[]}
          progressDayStartHour={3}
          calendarType="gregorian"
          language="en"
          direction="ltr"
          onOpenShareModal={vi.fn()}
        />,
      );
      expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "month");
      expect(screen.queryByRole("combobox", { name: "Date range" })).not.toBeInTheDocument();
      expect(screen.getByTestId("garden-view-date")).toHaveTextContent("Month");
      expect(screen.getByTestId("progress-heatmap")).toBeInTheDocument();
      expect(pathIndex).not.toHaveBeenCalled();
    } finally {
      pathIndex.mockRestore();
    }
  });
  it("uses a chosen calendar month including leap days without a redundant empty-state card", async () => {
    const onOpenHome = vi.fn();
    const onOpenKhatmah = vi.fn();
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={[]}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
        onOpenHome={onOpenHome}
        onOpenKhatmah={onOpenKhatmah}
      />,
    );
    expect(screen.queryByRole("button", { name: "Go to Home" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open Quran plan" })).not.toBeInTheDocument();
    expect(onOpenHome).not.toHaveBeenCalled();
    expect(onOpenKhatmah).not.toHaveBeenCalled();
    await choosePeriod("custom");
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2024-02-01" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2024-02-29" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent(/1\s*–\s*29 Feb 2024/);
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "custom");
    expect(screen.queryByRole("combobox", { name: "Show dates in" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.queryByTestId("progress-tab-records")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByTestId("progress-empty-period")).not.toBeInTheDocument();
  });
  it("restores focused record controls after delayed native focus scrolling", () => {
    let nextFrame: FrameRequestCallback | undefined;
    const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame = callback;
      return 91;
    });
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const { container, unmount } = render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={[]}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );
    const viewport = container.querySelector<HTMLElement>(".progress-screen")!;
    const controls = screen.getByTestId("progress-sticky-controls");
    fireEvent.click(screen.getByTestId("progress-tab-trends"));
    const target = screen.getByRole("combobox", { name: "Show trend for" });
    const controlsBounds = vi
      .spyOn(controls, "getBoundingClientRect")
      .mockReturnValue({ top: 0, bottom: 100 } as DOMRect);
    const targetBounds = vi
      .spyOn(target, "getBoundingClientRect")
      .mockImplementation(() => ({ top: 250 - viewport.scrollTop }) as DOMRect);
    try {
      viewport.scrollTop = 200;
      act(() => target.focus());
      expect(viewport.scrollTop).toBe(134);
      // Simulate the browser completing its own focus scrolling afterward.
      viewport.scrollTop = 180;
      act(() => nextFrame?.(0));
      expect(viewport.scrollTop).toBe(134);
      expect(target.getBoundingClientRect().top).toBeGreaterThanOrEqual(controls.getBoundingClientRect().bottom);
      // A late frame must not scroll the view for a control that lost focus.
      act(() => target.blur());
      viewport.scrollTop = 180;
      act(() => nextFrame?.(0));
      expect(viewport.scrollTop).toBe(180);
    } finally {
      unmount();
      controlsBounds.mockRestore();
      targetBounds.mockRestore();
      request.mockRestore();
      cancel.mockRestore();
    }
  });
  it("keeps historical calculations stable on scroll and invalidates changed records", () => {
    const index = vi.spyOn(dashboardDomain, "indexProgressDashboard");
    const props = {
      dailyCompletions: [] as DailyCollectionCompletion[],
      progressDayStartHour: 3,
      calendarType: "gregorian" as const,
      language: "en" as const,
      direction: "ltr" as const,
      onOpenShareModal: vi.fn(),
    };
    const { container, rerender } = render(<ProgressScreen {...props} />);
    const count = index.mock.calls.length;
    fireEvent.scroll(container.querySelector(".progress-screen")!, { target: { scrollTop: 120 } });
    expect(index.mock.calls.length).toBe(count);
    rerender(
      <ProgressScreen {...props} dailyCompletions={[{ dayKey: "2026-08-01", category: "morning", timeZone: "UTC" }]} />,
    );
    expect(index.mock.calls.length).toBeGreaterThan(count);
    index.mockRestore();
  });
  it.each(["ar", "en"] as const)(
    "keeps %s Overview focused and historical details discoverable in Trends",
    async (language) => {
      render(
        <ProgressScreen
          dailyCompletions={[]}
          progressDayStartHour={3}
          calendarType="gregorian"
          language={language}
          direction={language === "ar" ? "rtl" : "ltr"}
          onOpenShareModal={vi.fn()}
        />,
      );
      expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
      expect(screen.queryByTestId("progress-detailed-context")).not.toBeInTheDocument();
      expect(screen.queryByTestId("oasis-stage-card")).not.toBeInTheDocument();
      expect(screen.queryByTestId("progress-routine-bars")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId("progress-tab-trends"));
      const selector = screen.getByRole("combobox", { name: language === "ar" ? "عرض اتجاه" : "Show trend for" });
      await chooseProgressOption(selector, "zikr");
      expect(screen.getByTestId("zikr-insights")).toBeInTheDocument();
      expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
      await chooseProgressOption(selector, "friday");
      expect(screen.queryByTestId("zikr-insights")).not.toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    },
  );
});

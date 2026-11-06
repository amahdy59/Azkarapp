import { chooseProgressOption } from "../../test/progressSelect";
import { describe, it, expect, onTestFinished, vi } from "vitest";
import { act, render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import * as progressDomain from "../progress";
import * as dashboardDomain from "../progressDashboard";
import * as dailyPathDomain from "../dailyPath";
import type { DailyCollectionCompletion, DailyHabitCompletion } from "../types";

function openDetailedContext() {
  const details = screen.getByTestId("progress-detailed-context") as HTMLDetailsElement;
  details.open = true;
  fireEvent(details, new Event("toggle"));
}
async function chooseDetail(topic: string) {
  await chooseProgressOption(screen.getByRole("combobox", { name: /Explore details|استكشاف التفاصيل/ }), topic);
}
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
  it("refreshes memoized statistics at the configured devotional-day boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 20, 2, 59, 30));
    const summary = vi.spyOn(progressDomain, "getGardenSummary");
    try {
      render(
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
      openDetailedContext();
      const initialCalculations = summary.mock.calls.length;
      expect(summary.mock.results.at(-1)?.value.today.dayKey).toBe("2026-10-19");
      act(() => vi.advanceTimersByTime(30050));
      expect(summary.mock.calls.length).toBeGreaterThan(initialCalculations);
      expect(summary.mock.results.at(-1)?.value.today.dayKey).toBe("2026-10-20");
    } finally {
      summary.mockRestore();
      vi.useRealTimers();
    }
  });
  it("reuses unchanged historical calculations during header scrolling and recomputes changed records", () => {
    const summary = vi.spyOn(progressDomain, "getGardenSummary");
    const index = vi.spyOn(dashboardDomain, "indexProgressDashboard");
    const pathIndex = vi.spyOn(dailyPathDomain, "createDailyPathIndex");
    const props = {
      dailyCompletions: [{ dayKey: "2026-08-01", category: "morning", timeZone: "UTC" }] as DailyCollectionCompletion[],
      progressDayStartHour: 3,
      calendarType: "gregorian" as const,
      language: "en" as const,
      direction: "ltr" as const,
      onOpenShareModal: vi.fn(),
    };
    const { container, rerender } = render(<ProgressScreen {...props} />);
    const viewport = container.querySelector<HTMLElement>(".progress-screen")!;
    viewport.style.overflowY = "auto";
    fireEvent.resize(window);
    const initialCalculations = summary.mock.calls.length;
    const initialIndexes = index.mock.calls.length;
    expect(pathIndex).not.toHaveBeenCalled();
    expect(initialCalculations).toBe(0);
    fireEvent.scroll(viewport, { target: { scrollTop: 120 } });
    expect(screen.getByTestId("progress-sticky-controls")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(viewport, { target: { scrollTop: 0 } });
    expect(screen.getByTestId("progress-sticky-controls")).not.toHaveAttribute("data-scrolled");
    expect(summary.mock.calls.length).toBe(initialCalculations);
    expect(index.mock.calls.length).toBe(initialIndexes);
    expect(pathIndex).not.toHaveBeenCalled();
    openDetailedContext();
    expect(pathIndex).toHaveBeenCalledTimes(1);
    rerender(
      <ProgressScreen
        initialPeriod="day"
        {...props}
        dailyCompletions={[...props.dailyCompletions, { dayKey: "2026-08-01", category: "evening", timeZone: "UTC" }]}
      />,
    );
    expect(summary.mock.calls.length).toBeGreaterThan(initialCalculations);
    expect(index.mock.calls.length).toBeGreaterThan(initialIndexes);
    expect(pathIndex).toHaveBeenCalledTimes(2);
    summary.mockRestore();
    index.mockRestore();
    pathIndex.mockRestore();
  });
  const mockCompletions: DailyCollectionCompletion[] = [
    { dayKey: "2026-08-01", category: "morning", timeZone: "UTC" },
    { dayKey: "2026-08-01", category: "evening", timeZone: "UTC" },
    { dayKey: "2026-08-01", category: "before_sleep", timeZone: "UTC" },
  ];

  const mockDailyHabits: DailyHabitCompletion[] = [
    { dayKey: "2026-08-01", habit: "quran_wird", timeZone: "UTC" },
    { dayKey: "2026-08-01", habit: "mosque_3", timeZone: "UTC" },
  ];

  it("renders Arabic version with Oasis Stage Card and 7-day rhythm strip in Day view", async () => {
    const onOpenShareModal = vi.fn();
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="ar"
        direction="rtl"
        onOpenShareModal={onOpenShareModal}
      />,
    );

    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    expect(screen.queryByTestId("oasis-stage-card")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "مشاركة بطاقة التقدم" })).not.toBeInTheDocument();
    openDetailedContext();
    expect(screen.getByTestId("progress-prayer-group")).toBeInTheDocument();
    await chooseDetail("reflection");
    // Oasis Stage Card remains available as optional context.
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
    expect(screen.getByTestId("oasis-stage-card")).not.toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: "كيف تُضاف النخلة", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("الواحة ومحطاتك السابقة")).toBeInTheDocument();
    expect(screen.getByText("تأمل فيما سجلته من ممارسات.")).toBeInTheDocument();
    expect(screen.queryByText(/ليس مقياساً للإيمان أو الأجر/)).not.toBeInTheDocument();

    // Prophetic Constancy Hadith Touchstone
    expect(screen.getByText(/أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ/)).toBeInTheDocument();

    // Summary Strip in Day view
    expect(screen.getByTestId("progress-summary-strip")).toBeInTheDocument();
    expect(screen.getByText("أيام المواظبة المتتالية")).toBeInTheDocument();
    expect(screen.getByText("النخيل المثمر")).toBeInTheDocument();

    // The owner removed the visible header actions; semantic title remains.
    expect(
      within(screen.getByTestId("progress-sticky-controls")).queryByRole("button", { name: "مشاركة بطاقة التقدم" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("shared-screen-header")).toContainElement(
      screen.getByRole("heading", { name: "التقدم", exact: true }),
    );
    expect(onOpenShareModal).not.toHaveBeenCalled();

    // 7-Day Rhythm Strip without star glyphs
    expect(screen.getByText("إيقاع الأيام السبعة")).toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();

    await chooseDetail("routines");
    // Quran and remembrance are available in their own topic.
    expect(screen.getByTestId("today-garden-card")).toBeInTheDocument();
    expect(screen.getByText("الورد اليومي")).toBeInTheDocument();

    expect(screen.queryByTestId("progress-prayer-group")).not.toBeInTheDocument();

    // Progress uses efficient themed rows, not Home's decorative photo cards.
    expect(screen.getByTestId("today-garden-card").querySelector("img")).toBeNull();
  });

  it("renders English version with proper headings and LTR layout", async () => {
    const onOpenShareModal = vi.fn();
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={onOpenShareModal}
      />,
    );

    expect(screen.getByRole("heading", { name: "Your progress" })).toBeInTheDocument();
    openDetailedContext();
    await chooseDetail("reflection");
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
    expect(screen.getByText("Garden and past milestones")).toBeInTheDocument();
    expect(screen.getByText("7-Day Rhythm")).toBeInTheDocument();
    (screen.getByTestId("oasis-stage-card") as HTMLDetailsElement).open = true;
    fireEvent.click(screen.getByRole("button", { name: "Share Progress Card" }));
    expect(onOpenShareModal).toHaveBeenCalledOnce();
    await chooseDetail("routines");
    expect(screen.getByTestId("today-garden-card")).toBeInTheDocument();
    expect(screen.getByText("Daily wird records")).toBeInTheDocument();
  });

  it("shows read-only daily statistics without Quran or prayer recording actions", () => {
    const onToggleDailyHabit = vi.fn();
    const onTogglePrayerTracking = vi.fn();
    const { container } = render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="ar"
        direction="rtl"
        onOpenShareModal={vi.fn()}
        onToggleDailyHabit={onToggleDailyHabit}
        onTogglePrayerTracking={onTogglePrayerTracking}
      />,
    );
    openDetailedContext();
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(screen.queryByRole("button", { name: /ورد القرآن/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("prayer-progress-summary")).toBeInTheDocument();
    expect(onToggleDailyHabit).not.toHaveBeenCalled();
    expect(onTogglePrayerTracking).not.toHaveBeenCalled();
  });

  it("switches the shared range between Day, Week, Month, and Year", async () => {
    // Use a week with elapsed devotional days and no recorded Quran goal.
    vi.setSystemTime(new Date(2026, 10, 6, 12));
    onTestFinished(() => {
      vi.useRealTimers();
    });
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="ar"
        direction="rtl"
        onOpenShareModal={vi.fn()}
      />,
    );

    // Switch to Week tab
    openDetailedContext();
    await choosePeriod("week");
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "week");
    // Oasis stage card is exclusive to Day view
    expect(screen.queryByTestId("oasis-stage-card")).not.toBeInTheDocument();
    await chooseDetail("routines");
    expect(await screen.findByRole("heading", { name: "إيقاع أذكارك" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("progress-detailed-context")).queryByRole("progressbar")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("progress-overview")).getAllByRole("progressbar")).toHaveLength(2);

    // Switch to Month tab
    await choosePeriod("month");
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "month");

    // Switch to Year tab
    await choosePeriod("year");
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "year");

    // Switch back to Day tab
    await choosePeriod("day");
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "day");
    await chooseDetail("reflection");
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
  });

  it("keeps per-prayer detail optional without prayer-entry links", () => {
    const onPrayerResume = vi.fn();
    const { container } = render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={[]}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
        onPrayerResume={onPrayerResume}
      />,
    );
    openDetailedContext();
    const summary = screen.getByTestId("prayer-progress-summary");
    expect(summary.querySelector("details, table")).toBeNull();
    expect(summary.querySelectorAll("li")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "Open Fajr" })).not.toBeInTheDocument();
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(onPrayerResume).not.toHaveBeenCalled();
  });

  it("shows the configured weekly intention on the Week view", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={mockCompletions}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
        weeklyGoalDays={4}
      />,
    );

    openDetailedContext();
    await choosePeriod("week");
    await chooseDetail("routines");
    expect(await screen.findByText("Your seven-day intention")).toBeInTheDocument();
  });

  it("keeps both today and past-day statistics read-only", async () => {
    const onTogglePrayerTracking = vi.fn();
    const { container } = render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={[]}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
        onTogglePrayerTracking={onTogglePrayerTracking}
      />,
    );
    openDetailedContext();
    await choosePeriod("custom");
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2024-02-01" } });
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2024-02-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(screen.getByTestId("progress-metric-prayers")).toBeInTheDocument();
    await choosePeriod("day");
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(onTogglePrayerTracking).not.toHaveBeenCalled();
  });
});

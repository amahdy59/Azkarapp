import { chooseProgressOption } from "../../test/progressSelect";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
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
async function choosePeriod(period: string) {
  await chooseProgressOption(screen.getAllByRole("combobox")[0]!, period);
}

describe("ProgressScreen", () => {
  it("restores focused record controls after delayed native focus scrolling", () => {
    let nextFrame: FrameRequestCallback | undefined;
    const request = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      nextFrame = callback;
      return 91;
    });
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    const { container, unmount } = render(
      <ProgressScreen
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
          dailyCompletions={[]}
          progressDayStartHour={3}
          calendarType="gregorian"
          language="en"
          direction="ltr"
          onOpenShareModal={vi.fn()}
        />,
      );
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
    expect(pathIndex).toHaveBeenCalledTimes(1);
    expect(initialCalculations).toBeGreaterThan(0);
    fireEvent.scroll(viewport, { target: { scrollTop: 120 } });
    expect(screen.getByTestId("progress-sticky-controls")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(viewport, { target: { scrollTop: 0 } });
    expect(screen.getByTestId("progress-sticky-controls")).not.toHaveAttribute("data-scrolled");
    expect(summary.mock.calls.length).toBe(initialCalculations);
    expect(index.mock.calls.length).toBe(initialIndexes);
    expect(pathIndex).toHaveBeenCalledTimes(1);
    rerender(
      <ProgressScreen
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

  it("renders Arabic version with Oasis Stage Card and 7-day rhythm strip in Day view", () => {
    const onOpenShareModal = vi.fn();
    render(
      <ProgressScreen
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
    openDetailedContext();
    // Oasis Stage Card remains available as optional context.
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
    expect(screen.getByTestId("oasis-stage-card")).not.toHaveAttribute("open");
    expect(screen.getByRole("heading", { name: "كيف تُضاف النخلة", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("الواحة ومحطاتك السابقة")).toBeInTheDocument();
    expect(screen.getByText("تأمل لطيف فيما سجلته، وليس مقياساً للإيمان أو الأجر.")).toBeInTheDocument();

    // Prophetic Constancy Hadith Touchstone
    expect(screen.getByText(/أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ/)).toBeInTheDocument();

    // Summary Strip in Day view
    expect(screen.getByTestId("progress-summary-strip")).toBeInTheDocument();
    expect(screen.getByText("أيام المواظبة المتتالية")).toBeInTheDocument();
    expect(screen.getByText("النخيل المثمر")).toBeInTheDocument();

    // Share action in Header
    const shareBtn = screen.getByRole("button", { name: "مشاركة بطاقة التقدم" });
    expect(shareBtn).toBeInTheDocument();
    fireEvent.click(shareBtn);
    expect(onOpenShareModal).toHaveBeenCalledTimes(1);

    // 7-Day Rhythm Strip without star glyphs
    expect(screen.getByText("إيقاع الأيام السبعة")).toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();

    // Qur'an and remembrance follow the primary prayer group.
    expect(screen.getByTestId("today-garden-card")).toBeInTheDocument();
    expect(screen.getByText("الورد اليومي")).toBeInTheDocument();

    expect(screen.getByTestId("progress-prayer-group")).toBeInTheDocument();

    // Progress uses efficient themed rows, not Home's decorative photo cards.
    expect(screen.getByTestId("today-garden-card").querySelector("img")).toBeNull();
  });

  it("renders English version with proper headings and LTR layout", () => {
    const onOpenShareModal = vi.fn();
    render(
      <ProgressScreen
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={onOpenShareModal}
      />,
    );

    expect(screen.getByRole("heading", { name: "Your recorded progress" })).toBeInTheDocument();
    openDetailedContext();
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
    expect(screen.getByText("Garden and past milestones")).toBeInTheDocument();
    expect(screen.getByText("7-Day Rhythm")).toBeInTheDocument();
    expect(screen.getByTestId("today-garden-card")).toBeInTheDocument();
    expect(screen.getByText("Daily wird records")).toBeInTheDocument();
  });

  it("shows read-only daily statistics without Quran or prayer recording actions", () => {
    const onToggleDailyHabit = vi.fn();
    const onTogglePrayerTracking = vi.fn();
    const { container } = render(
      <ProgressScreen
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
    render(
      <ProgressScreen
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
    expect(screen.getByRole("combobox", { name: "الفترة" })).toHaveAttribute("data-progress-value", "week");
    // Oasis stage card is exclusive to Day view
    expect(screen.queryByTestId("oasis-stage-card")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "إيقاع أذكارك" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    // Switch to Month tab
    await choosePeriod("month");
    expect(screen.getByRole("combobox", { name: "الفترة" })).toHaveAttribute("data-progress-value", "month");

    // Switch to Year tab
    await choosePeriod("year");
    expect(screen.getByRole("combobox", { name: "الفترة" })).toHaveAttribute("data-progress-value", "year");

    // Switch back to Day tab
    await choosePeriod("day");
    expect(screen.getByRole("combobox", { name: "الفترة" })).toHaveAttribute("data-progress-value", "day");
    expect(screen.getByTestId("oasis-stage-card")).toBeInTheDocument();
  });

  it("keeps per-prayer detail optional without prayer-entry links", () => {
    const onPrayerResume = vi.fn();
    const { container } = render(
      <ProgressScreen
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
    expect(await screen.findByText("Your seven-day intention")).toBeInTheDocument();
  });

  it("keeps both today and past-day statistics read-only", () => {
    const onTogglePrayerTracking = vi.fn();
    const { container } = render(
      <ProgressScreen
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
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(screen.getByTestId("prayer-progress-summary")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next period" }));
    expect(container.querySelector('input[type="checkbox"], textarea')).toBeNull();
    expect(onTogglePrayerTracking).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import type { DailyCollectionCompletion, DailyHabitCompletion } from "../types";

describe("ProgressScreen", () => {
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

    // Oasis Stage Card
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
    expect(container.querySelector("input, select, textarea")).toBeNull();
    expect(screen.queryByRole("button", { name: /ورد القرآن/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("prayer-progress-summary")).toBeInTheDocument();
    expect(onToggleDailyHabit).not.toHaveBeenCalled();
    expect(onTogglePrayerTracking).not.toHaveBeenCalled();
  });

  it("switches tabs between Day, Week, Month, and Year", async () => {
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
    const weekTab = screen.getByRole("tab", { name: "أسبوع" });
    fireEvent.click(weekTab);
    expect(weekTab).toHaveAttribute("aria-selected", "true");
    // Oasis stage card is exclusive to Day view
    expect(screen.queryByTestId("oasis-stage-card")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "إيقاع أذكارك" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    // Switch to Month tab
    const monthTab = screen.getByRole("tab", { name: "شهر" });
    fireEvent.click(monthTab);
    expect(monthTab).toHaveAttribute("aria-selected", "true");

    // Switch to Year tab
    const yearTab = screen.getByRole("tab", { name: "سنة" });
    fireEvent.click(yearTab);
    expect(yearTab).toHaveAttribute("aria-selected", "true");

    // Switch back to Day tab
    const dayTab = screen.getByRole("tab", { name: "يوم" });
    fireEvent.click(dayTab);
    expect(dayTab).toHaveAttribute("aria-selected", "true");
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
    const summary = screen.getByTestId("prayer-progress-summary");
    expect(summary.querySelector("details, table")).toBeNull();
    expect(summary.querySelectorAll("li")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "Open Fajr" })).not.toBeInTheDocument();
    expect(container.querySelector("input, select, textarea")).toBeNull();
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

    fireEvent.click(screen.getByRole("tab", { name: "Week" }));
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
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(container.querySelector("input, select, textarea")).toBeNull();
    expect(screen.getByTestId("prayer-progress-summary")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next period" }));
    expect(container.querySelector("input, select, textarea")).toBeNull();
    expect(onTogglePrayerTracking).not.toHaveBeenCalled();
  });
});

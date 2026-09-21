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
    expect(screen.getByText("مرحلة الواحة الروحية")).toBeInTheDocument();
    expect(screen.getByText("تأمل لطيف فيما سجلته، وليس مقياساً للإيمان أو الأجر.")).toBeInTheDocument();

    // Prophetic Constancy Hadith Touchstone
    expect(screen.getByText(/أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ/)).toBeInTheDocument();

    // Summary Strip in Day view
    expect(screen.getByTestId("progress-summary-strip")).toBeInTheDocument();
    expect(screen.getByText("سلسلة الحفظ")).toBeInTheDocument();
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
    expect(screen.getByTestId("daily-companions-card")).toBeInTheDocument();
    expect(screen.getByText("القرآن والذكر")).toBeInTheDocument();

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
    expect(screen.getByText("Daily Oasis Stage")).toBeInTheDocument();
    expect(screen.getByText("7-Day Rhythm")).toBeInTheDocument();
    expect(screen.getByTestId("daily-companions-card")).toBeInTheDocument();
    expect(screen.getByText("Qur'an and remembrance")).toBeInTheDocument();
  });

  it("records the Quran from its focused group without duplicating mosque tracking", () => {
    const onToggleDailyHabit = vi.fn();
    const onCycleMosqueHabit = vi.fn();

    render(
      <ProgressScreen
        dailyCompletions={mockCompletions}
        dailyHabits={mockDailyHabits}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="ar"
        direction="rtl"
        onOpenShareModal={vi.fn()}
        onToggleDailyHabit={onToggleDailyHabit}
        onCycleMosqueHabit={onCycleMosqueHabit}
      />,
    );

    // Toggle Quran Wird
    const quranButton = screen.getByRole("button", { name: /ورد القرآن/ });
    fireEvent.click(quranButton);
    expect(onToggleDailyHabit).toHaveBeenCalledTimes(1);
    expect(onToggleDailyHabit).toHaveBeenCalledWith(expect.any(String), "quran_wird");

    expect(screen.queryByRole("button", { name: /صلوات المسجد/ })).not.toBeInTheDocument();
    expect(onCycleMosqueHabit).not.toHaveBeenCalled();
  });

  it("switches tabs between Day, Week, Month, and Year", () => {
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
    expect(screen.getAllByRole("progressbar")).toHaveLength(3);

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
});

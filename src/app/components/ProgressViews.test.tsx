import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgressDayView, ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressViews";
import type { GardenSummary } from "../progress";
import type { DailyCollectionCompletion } from "../types";

const mockSummary: GardenSummary = {
  today: {
    dayKey: "2026-08-05",
    date: new Date("2026-08-05"),
    completedCategories: ["morning"],
    goldenLeafCount: 1,
    greenLeafCount: 0,
    leafCount: 1,
    extraLeafCount: 0,
    isPalm: false,
    isToday: true,
  },
  days: [],
  activeDaysLast7: 6,
  palmDaysLast7: 4,
  lifetimeGoldenLeaves: 30,
  lifetimeGreenLeaves: 15,
  lifetimeLeaves: 45,
  lifetimePalms: 12,
  currentPalmRhythm: 3,
  longestPalmRhythm: 7,
  currentUsageStreak: 5,
  longestUsageStreak: 14,
  messageKind: "partial",
  yesterdayLeafCount: 2,
  milestones: [],
};

const mockCompletions: DailyCollectionCompletion[] = [
  { dayKey: "2026-08-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-01", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-01", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-02", category: "morning", timeZone: "Africa/Cairo" },
];

describe("ProgressViews components", () => {
  afterEach(() => vi.useRealTimers());

  it("shows neutral future chart data and formats elapsed rates consistently", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 12));
    render(
      <ProgressYearView
        language="en"
        targetYear={2026}
        dailyCompletions={[{ dayKey: "2026-01-01", category: "morning", timeZone: "Africa/Cairo" }]}
      />,
    );
    fireEvent.click(screen.getByText("View chart data"));
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("17%");
    expect(rows[2]).toHaveTextContent("Upcoming");
    expect(rows[2]).not.toHaveTextContent("0%");
  });
  it("keeps Progress rows photograph-free and uses ordinary navigation buttons", () => {
    const onSelectCategory = vi.fn();
    const { container } = render(
      <ProgressDayView
        summary={mockSummary}
        language="en"
        dynamicSubtitle="Recorded routines"
        visibleCategoryIds={["morning", "evening", "before_sleep"]}
        onMedia={false}
        onSelectCategory={onSelectCategory}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    const morning = screen.getByRole("button", { name: "Morning Azkar - Completed" });
    expect(morning).not.toHaveAttribute("aria-pressed");
    fireEvent.click(morning);
    expect(onSelectCategory).toHaveBeenCalledWith("morning");
  });
  it("renders ProgressDayView with a responsive routine card grid in Arabic", () => {
    render(
      <ProgressDayView summary={mockSummary} language="ar" dynamicSubtitle="أكملت 1 من أصل 3 أوراد رئيسية اليوم" />,
    );

    expect(screen.getByText("وردك اليوم")).toBeInTheDocument();
    expect(screen.getByText("أذكار الصباح")).toBeInTheDocument();
    expect(screen.getByText("أذكار المساء")).toBeInTheDocument();
    expect(screen.getByText("أذكار النوم")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أذكار الصباح - مكتملة" })).toBeInTheDocument();
    expect(screen.getByText("مكتملة")).toHaveClass("rounded-full", "px-3", "py-1");
  });

  it("adds the recommendation to a routine's name without displacing its status", () => {
    render(
      <ProgressDayView
        summary={mockSummary}
        language="en"
        dynamicSubtitle="One of three routines complete"
        recommendedCategoryId="evening"
      />,
    );

    // Substituting the recommendation for the status left a screen-reader user
    // knowing this routine was suggested but not whether they had done it, and
    // it silently dropped the row out of every "- Not completed" query.
    expect(screen.getByRole("button", { name: "Evening Azkar - Start now - Not completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Morning Azkar - Completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sleep Azkar - Not completed" })).toBeInTheDocument();
  });

  it("adds Quran as the fourth tracked item in the Home wird", () => {
    const onPress = vi.fn();
    render(
      <ProgressDayView
        summary={mockSummary}
        language="en"
        dynamicSubtitle="One routine complete"
        visibleCategoryIds={["morning", "evening", "before_sleep"]}
        quranWird={{ progress: 2, goal: 4, complete: false, active: true, onPress }}
      />,
    );

    expect(screen.getByText("1 / 4")).toBeInTheDocument();
    const quran = screen.getByRole("button", { name: "Quran Wird - 2 of 4 pages" });
    fireEvent.click(quran);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("does not recommend a routine the reader already completed today", () => {
    render(
      <ProgressDayView
        summary={mockSummary}
        language="en"
        dynamicSubtitle="One of three routines complete"
        recommendedCategoryId="morning"
      />,
    );

    expect(screen.getByRole("button", { name: "Morning Azkar - Completed" })).toBeInTheDocument();
  });

  it("reveals the palm explanation inside the card instead of an anchored overflow", () => {
    render(<ProgressDayView summary={mockSummary} language="en" dynamicSubtitle="One of three routines complete" />);

    fireEvent.click(screen.getByRole("button", { name: "How a palm is earned" }));
    const explanation = screen.getByRole("tooltip");
    expect(explanation).toHaveTextContent(/Morning, Evening, and Before Sleep/i);
    expect(explanation).toHaveClass("w-full");
    expect(explanation).not.toHaveClass("absolute");
  });

  it("renders ProgressWeekView with commitment matrix in Arabic", () => {
    render(<ProgressWeekView language="ar" dailyCompletions={mockCompletions} referenceDate={new Date(2026, 7, 5)} />);

    expect(screen.getByText("التزامك هذا الأسبوع")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByText("ملخص الأوراد هذا الأسبوع")).not.toBeInTheDocument();
    expect(screen.queryByText("أكثر الأوراد حفظاً")).not.toBeInTheDocument();
    expect(screen.queryByText("أكثر ورد فاتك")).not.toBeInTheDocument();
  });

  it("shows the saved active-day intention separately from seven-day routine totals", () => {
    render(
      <ProgressWeekView
        language="en"
        dailyCompletions={mockCompletions}
        referenceDate={new Date(2026, 7, 5)}
        weeklyGoalDays={4}
        activeDays={2}
      />,
    );

    expect(screen.getByText("Your seven-day intention")).toBeInTheDocument();
    expect(screen.getByText("2 of 4 active days")).toBeInTheDocument();
    expect(screen.queryByText("Partial")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
  });

  it("renders ProgressMonthView with calendar matrix in Arabic", () => {
    render(<ProgressMonthView language="ar" targetYear={2026} targetMonth={7} dailyCompletions={mockCompletions} />);

    expect(screen.getByTestId("garden-month-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("month-weekly-chart")).toBeInTheDocument();
    expect(screen.getByTestId("garden-month-calendar")).not.toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "التقويم" }));
    expect(screen.getByTestId("garden-month-calendar")).toBeVisible();
    expect(screen.queryByTestId("month-weekly-chart")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "الاتجاه" }));
    expect(screen.getByTestId("month-weekly-chart")).toBeVisible();
  });

  it("compares routines using elapsed days and ignores future duplicate records", () => {
    render(
      <ProgressWeekView
        language="en"
        referenceDate={new Date(2026, 9, 12, 12)}
        now={new Date(2026, 9, 12, 12)}
        dailyCompletions={[
          { dayKey: "2026-10-11", category: "morning", timeZone: "Africa/Cairo" },
          { dayKey: "2026-10-11", category: "morning", timeZone: "Africa/Cairo" },
          { dayKey: "2026-10-16", category: "morning", timeZone: "Africa/Cairo" },
        ]}
      />,
    );
    const disclosure = screen.getByText("Compare routines").closest("details")!;
    expect(disclosure).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Compare routines"));
    expect(within(disclosure).getByRole("img", { name: "Morning: 1 of 2 days" })).toBeVisible();
  });

  it("renders ProgressYearView with one trend and twelve selectable months in Arabic", () => {
    render(<ProgressYearView language="ar" targetYear={2026} dailyCompletions={mockCompletions} />);

    expect(screen.getByTestId("year-monthly-chart")).toBeInTheDocument();
    expect(screen.queryByText("نظرة سريعة")).not.toBeInTheDocument();
    expect(screen.queryByTestId("year-heatmap-0")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("data-slot", "select-trigger");
  });

  it("renders empty progress periods with recorded zero values and neutral guidance", () => {
    const { rerender } = render(
      <ProgressWeekView language="en" dailyCompletions={[]} referenceDate={new Date(2026, 7, 5)} />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(8);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    rerender(<ProgressMonthView language="en" targetYear={2026} targetMonth={7} dailyCompletions={[]} />);

    expect(screen.getByText(/Your record begins with a completed routine/)).toBeInTheDocument();
    expect(screen.queryByText("Your consistency improved")).not.toBeInTheDocument();

    rerender(<ProgressYearView language="en" targetYear={2026} dailyCompletions={[]} />);

    expect(screen.getByText(/Morning, evening and sleep azkar/)).toBeInTheDocument();
    expect(screen.getByText(/Your record begins with a completed routine/)).toBeInTheDocument();
    expect(screen.queryByText(/improved by 12%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/14367|214 active|32 days|78/)).not.toBeInTheDocument();
  });
});

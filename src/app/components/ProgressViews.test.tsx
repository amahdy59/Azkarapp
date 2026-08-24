import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  it("renders ProgressDayView with a responsive routine card grid in Arabic", () => {
    render(
      <ProgressDayView summary={mockSummary} language="ar" dynamicSubtitle="أكملت 1 من أصل 3 أوراد رئيسية اليوم" />,
    );

    expect(screen.getByText("وردك اليوم")).toBeInTheDocument();
    expect(screen.getByText("أذكار الصباح")).toBeInTheDocument();
    expect(screen.getByText("أذكار المساء")).toBeInTheDocument();
    expect(screen.getByText("أذكار النوم")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "أذكار الصباح - مكتملة" })).toBeInTheDocument();
  });

  it("reveals the palm explanation inside the card instead of an anchored overflow", () => {
    render(<ProgressDayView summary={mockSummary} language="en" dynamicSubtitle="One of three routines complete" />);

    fireEvent.click(screen.getByRole("button", { name: "How a palm is earned" }));
    const explanation = screen.getByRole("tooltip");
    expect(explanation).toHaveTextContent(
      "Complete Morning, Evening, and Before Sleep Azkar each day to grow your palm streak.",
    );
    expect(explanation).toHaveClass("w-full");
    expect(explanation).not.toHaveClass("absolute");
  });

  it("renders ProgressWeekView with commitment matrix in Arabic", () => {
    render(<ProgressWeekView language="ar" dailyCompletions={mockCompletions} referenceDate={new Date(2026, 7, 5)} />);

    expect(screen.getByText("التزامك هذا الأسبوع")).toBeInTheDocument();
    expect(screen.getByText("ملخص الأوراد هذا الأسبوع")).toBeInTheDocument();
  });

  it("renders ProgressMonthView with calendar matrix in Arabic", () => {
    render(<ProgressMonthView language="ar" targetYear={2026} targetMonth={7} dailyCompletions={mockCompletions} />);

    expect(screen.getByTestId("garden-month-calendar")).toBeInTheDocument();
    expect(screen.getByText("سجل هذا الشهر")).toBeInTheDocument();
  });

  it("renders ProgressYearView with monthly completion rate and heatmaps in Arabic", () => {
    render(<ProgressYearView language="ar" targetYear={2026} dailyCompletions={mockCompletions} />);

    expect(screen.getByText("معدل الاكتمال الشهري")).toBeInTheDocument();
    expect(screen.getByText("نظرة سريعة")).toBeInTheDocument();
  });

  it("renders empty progress periods with recorded zero values and neutral guidance", () => {
    const { rerender } = render(
      <ProgressWeekView language="en" dailyCompletions={[]} referenceDate={new Date(2026, 7, 5)} />,
    );

    expect(screen.getByText("Completed all three routines on 0 days")).toBeInTheDocument();
    expect(screen.getByText("No routine activity recorded for this period.")).toBeInTheDocument();
    expect(screen.getAllByText("0 of 7")).toHaveLength(4);

    rerender(<ProgressMonthView language="en" targetYear={2026} targetMonth={7} dailyCompletions={[]} />);

    expect(screen.getByText("This month's record")).toBeInTheDocument();
    expect(screen.getByText("0 full days recorded this month.")).toBeInTheDocument();
    expect(screen.queryByText("Your consistency improved")).not.toBeInTheDocument();

    rerender(<ProgressYearView language="en" targetYear={2026} dailyCompletions={[]} />);

    expect(screen.getByText("Recorded completion rate by month.")).toBeInTheDocument();
    expect(screen.getByText("Complete a routine to begin your yearly record.")).toBeInTheDocument();
    expect(screen.queryByText(/improved by 12%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/14367|214 active|32 days|78/)).not.toBeInTheDocument();
  });
});

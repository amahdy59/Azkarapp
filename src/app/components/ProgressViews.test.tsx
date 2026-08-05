import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressDayView, ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressViews";
import type { GardenSummary } from "../progress";
import type { DailyCollectionCompletion } from "../types";

const mockSummary: GardenSummary = {
  today: {
    dayKey: "2026-08-05",
    completedCategories: ["morning"],
    isFullDay: false,
    earnedLeaf: true,
    earnedPalm: false,
  },
  yesterday: null,
  activeDaysLast30: 20,
  palmDaysLast30: 15,
  activeDaysLast7: 6,
  palmDaysLast7: 4,
  currentUsageStreak: 5,
  currentPalmRhythm: 3,
  lifetimePalms: 12,
  lifetimeLeaves: 45,
  completionRatePercent: 78,
  bestStreakDays: 14,
  unlockedMilestones: ["first_palm", "streak_7"],
  recentMilestone: null,
  recentMilestones: [],
  upcomingMilestone: {
    id: "streak_30",
    titleKey: "garden.milestoneStreak30Title",
    descKey: "garden.milestoneStreak30Desc",
    threshold: 30,
    current: 5,
    kind: "palm_streak",
  },
  growthStage: "sapling",
};

const mockCompletions: DailyCollectionCompletion[] = [
  { dayKey: "2026-08-01", category: "morning", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-01", category: "evening", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-01", category: "before_sleep", timeZone: "Africa/Cairo" },
  { dayKey: "2026-08-02", category: "morning", timeZone: "Africa/Cairo" },
];

describe("ProgressViews components", () => {
  it("renders ProgressDayView with routine list and stats in Arabic", () => {
    render(
      <ProgressDayView summary={mockSummary} language="ar" dynamicSubtitle="أكملت 1 من أصل 3 أوراد رئيسية اليوم" />,
    );

    expect(screen.getByText("وردك اليوم")).toBeInTheDocument();
    expect(screen.getByText("أذكار الصباح")).toBeInTheDocument();
    expect(screen.getByText("أذكار المساء")).toBeInTheDocument();
    expect(screen.getByText("أذكار النوم")).toBeInTheDocument();
  });

  it("renders ProgressWeekView with commitment matrix in Arabic", () => {
    render(
      <ProgressWeekView
        summary={mockSummary}
        language="ar"
        dailyCompletions={mockCompletions}
        referenceDate={new Date(2026, 7, 5)}
      />,
    );

    expect(screen.getByText("التزامك هذا الأسبوع")).toBeInTheDocument();
    expect(screen.getByText("ملخص الأوراد هذا الأسبوع")).toBeInTheDocument();
  });

  it("renders ProgressMonthView with calendar matrix in Arabic", () => {
    render(<ProgressMonthView language="ar" targetYear={2026} targetMonth={7} dailyCompletions={mockCompletions} />);

    expect(screen.getByTestId("garden-month-calendar")).toBeInTheDocument();
    expect(screen.getByText("انتظامك تحسن هذا الشهر")).toBeInTheDocument();
  });

  it("renders ProgressYearView with monthly completion rate and heatmaps in Arabic", () => {
    render(<ProgressYearView language="ar" targetYear={2026} dailyCompletions={mockCompletions} />);

    expect(screen.getByText("معدل الاكتمال الشهري")).toBeInTheDocument();
    expect(screen.getByText("نظرة سريعة")).toBeInTheDocument();
  });
});

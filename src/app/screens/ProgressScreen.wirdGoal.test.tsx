import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import { getProgressDayKey } from "../progress";
import type { DailyCollectionCompletion, QuranWirdPlan } from "../types";

describe("ProgressScreen Quran wird completion consistency", () => {
  const now = new Date();
  const dayKey = getProgressDayKey(now, 3);

  const completions: DailyCollectionCompletion[] = [{ dayKey, category: "morning", timeZone: "UTC" }];

  const fourPagePlan: QuranWirdPlan = {
    kind: "daily",
    dailyPages: 4,
    startedDayKey: dayKey,
  };

  const freeReadingPlan: QuranWirdPlan = {
    kind: "free",
    dailyPages: 0,
    startedDayKey: dayKey,
  };

  it("marks wird as incomplete when 0 pages of goal are read", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{}}
        quranWirdPlan={fourPagePlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
  });

  it("marks wird as incomplete and displays fractional progress when 1 of 4 pages is read", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{ [dayKey]: [42] }}
        quranWirdPlan={fourPagePlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
  });

  it("marks wird as completed when full goal of 4 pages is reached", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{ [dayKey]: [42, 43, 44, 45] }}
        quranWirdPlan={fourPagePlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("1 of 1");
  });

  it("hides completion tracking in free reading even with existing history", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{ [dayKey]: [42] }}
        quranWirdPlan={freeReadingPlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.queryByText("Quran Wird", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByTestId("daily-companions-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("No known goal days");
  });

  it("honors manual habit tick even when pages read is 0", async () => {
    render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[{ dayKey, habit: "quran_wird", timeZone: "UTC" }]}
        wirdHistory={{}}
        quranWirdPlan={fourPagePlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("1 of 1");
  });

  it("marks repeating wird as complete only when all pages in repeat range are read today", async () => {
    const repeatingPlan: QuranWirdPlan = {
      kind: "repeating",
      dailyPages: 20,
      repeatStartPage: 1,
      repeatEndPage: 20,
      repeatScope: "juz",
      repeatNumber: 1,
      startedDayKey: dayKey,
    };

    const { rerender } = render(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{ [dayKey]: [1, 2, 3] }}
        quranWirdPlan={repeatingPlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");

    const fullRange = Array.from({ length: 20 }, (_, i) => i + 1);
    rerender(
      <ProgressScreen
        initialPeriod="day"
        dailyCompletions={completions}
        dailyHabits={[]}
        wirdHistory={{ [dayKey]: fullRange }}
        quranWirdPlan={repeatingPlan}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={vi.fn()}
      />,
    );

    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("1 of 1");
  });
});

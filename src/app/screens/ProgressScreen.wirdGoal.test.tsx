import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

  it("marks wird as incomplete when 0 pages of goal are read", () => {
    render(
      <ProgressScreen
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

    const wirdButton = screen.getByRole("button", { name: /Qur'an Wird|Quran Wird/i });
    expect(wirdButton).toHaveAttribute("aria-pressed", "false");
    expect(within(wirdButton).getByText("0 / 4 pages")).toBeInTheDocument();
  });

  it("marks wird as incomplete and displays fractional progress when 1 of 4 pages is read", () => {
    render(
      <ProgressScreen
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

    const wirdButton = screen.getByRole("button", { name: /Qur'an Wird|Quran Wird/i });
    expect(wirdButton).toHaveAttribute("aria-pressed", "false");
    expect(within(wirdButton).getByText("1 / 4 pages")).toBeInTheDocument();
  });

  it("marks wird as completed when full goal of 4 pages is reached", () => {
    render(
      <ProgressScreen
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

    const wirdButton = screen.getByRole("button", { name: /Qur'an Wird|Quran Wird/i });
    expect(wirdButton).toHaveAttribute("aria-pressed", "true");
    expect(within(wirdButton).getByText("Completed")).toBeInTheDocument();
  });

  it("hides completion tracking in free reading even with existing history", () => {
    render(
      <ProgressScreen
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

    expect(screen.queryByTestId("daily-companions-card")).not.toBeInTheDocument();
    expect(screen.queryByText(/pages/i)).not.toBeInTheDocument();
  });

  it("honors manual habit tick even when pages read is 0", () => {
    render(
      <ProgressScreen
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

    const wirdButton = screen.getByRole("button", { name: /Qur'an Wird|Quran Wird/i });
    expect(wirdButton).toHaveAttribute("aria-pressed", "true");
    expect(within(wirdButton).getByText("Completed")).toBeInTheDocument();
  });
});

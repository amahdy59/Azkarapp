import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getProgressDayKey } from "../progress";
import { QuranWirdScreen } from "./QuranWirdScreen";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";

function renderScreen() {
  const today = getProgressDayKey(new Date(), 4);
  const props = {
    language: "en" as const,
    direction: "ltr" as const,
    position: { page: 22, surahNumber: 2, ayahNumber: 142, juzNumber: 2 },
    plan: { kind: "daily" as const, dailyPages: 4 },
    wirdHistory: { [today]: [20, 21] },
    quranWirdDailyGoals: { [today]: 4 },
    onBack: vi.fn(),
    onPlanChange: vi.fn(),
    onContinue: vi.fn(),
    onUndoReadingEvent: vi.fn(),
    progressDayStartHour: 4,
  };
  render(<QuranWirdScreen {...props} />);
  return props;
}

describe("QuranWirdScreen", () => {
  it("makes continuation primary and exposes a text equivalent for the progress track", () => {
    renderScreen();

    expect(screen.getByRole("button", { name: /continue reading/i })).toBeInTheDocument();
    // The first progress bar should be the daily goal
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars[0]).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText(/Surah Al-Baqarah/)).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /record a page/i })).not.toBeInTheDocument();
  });

  it("offers a draft mode for plan changes", () => {
    const props = renderScreen();
    // Start drafting
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("spinbutton", { name: "Pages per day" })).toBeInTheDocument();

    // Open the plan type select
    const select = screen.getByRole("combobox", { name: "Choose a plan" });
    fireEvent.click(select);

    // Choose Finish by a date
    fireEvent.click(screen.getByRole("option", { name: /Finish by a date/i }));

    // Save the plan
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(props.onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "custom",
        durationDays: 30,
        dailyPages: 20,
        startPage: 22,
        targetPage: 604,
      }),
    );
  });

  it("builds today's target from unread pages instead of counting an already credited page twice", () => {
    const props = renderScreen();
    const today = getProgressDayKey(new Date(), 4);
    render(<QuranWirdScreen {...props} wirdHistory={{ [today]: [22, 24] }} />);

    expect(screen.getByText("Pages 23–25")).toBeInTheDocument();
  });

  it("undoes the complete last reading event rather than guessing one page", () => {
    const props = renderScreen();
    const today = getProgressDayKey(new Date(), 4);
    render(
      <QuranWirdScreen
        {...props}
        lastReadingEvent={{ dayKey: today, pages: [22, 23] }}
        onUndoReadingEvent={props.onUndoReadingEvent}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Undo pages 22–23" }));
    expect(props.onUndoReadingEvent).toHaveBeenCalledOnce();
  });

  it("shows an expired plan as an action state, not as completed progress", () => {
    const props = renderScreen();
    render(
      <QuranWirdScreen
        {...props}
        plan={{
          kind: "custom",
          dailyPages: 20,
          durationDays: 1,
          startedDayKey: "2026-01-01",
          startPage: 22,
          targetPage: 604,
        }}
      />,
    );

    expect(screen.getByText("Your plan has ended. Choose a new completion date.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adjust plan" })).toBeInTheDocument();
  });

  it("uses a Saturday-to-Friday week and fills Arabic progress from the right", () => {
    expect(currentSaturdayWeekKeys(new Date("2026-08-22T12:00:00"))).toEqual([
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
    ]);

    const props = renderScreen();
    render(<QuranWirdScreen {...props} language="ar" direction="rtl" />);
    expect(screen.getAllByTestId("quran-wird-content")[1]).toHaveClass("text-right");
    // The Khatmah progressbar is the 2nd one now, maybe check the first one.
    expect(screen.getAllByRole("progressbar")[2]).toHaveAttribute("dir", "rtl");
  });
});

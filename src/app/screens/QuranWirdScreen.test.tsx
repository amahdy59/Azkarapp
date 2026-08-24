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
    onBack: vi.fn(),
    onPlanChange: vi.fn(),
    onContinue: vi.fn(),
    onUndoPage: vi.fn(),
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

    // Open the plan type select
    const select = screen.getByRole("combobox", { name: "Change plan" });
    fireEvent.click(select);

    // Choose Finish by a date
    fireEvent.click(screen.getByRole("option", { name: /Finish by a date/i }));

    // Save the plan
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(props.onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "custom", durationDays: 30, dailyPages: 20 }),
    );
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
    // The Khatmah progressbar is the 2nd one now, maybe check the first one.
    expect(screen.getAllByRole("progressbar")[2]).toHaveAttribute("dir", "rtl");
  });
});

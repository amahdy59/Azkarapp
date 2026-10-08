import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("spinbutton", { name: "Pages per day" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Finish in one Gregorian month/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(props.onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "gregorianMonth",
        durationDays: expect.any(Number),
        startPage: 22,
        targetPage: 604,
      }),
    );
  });

  it("offers free reading without goals or history summaries", () => {
    const props = renderScreen();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("radio", { name: /Read freely/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(props.onPlanChange).toHaveBeenCalledWith(expect.objectContaining({ kind: "free", dailyPages: 0 }));

    cleanup();
    render(<QuranWirdScreen {...props} plan={{ kind: "free", dailyPages: 0, startedDayKey: "2026-08-24" }} />);
    expect(screen.getByText("Free reading is on")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "This week" })).not.toBeInTheDocument();
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

  it("names the selected calendar month and replaces duplicate overview clutter with month progress", () => {
    const props = renderScreen();
    cleanup();
    render(
      <QuranWirdScreen
        {...props}
        plan={{
          kind: "gregorianMonth",
          dailyPages: 19,
          durationDays: 31,
          startedDayKey: "2026-08-01",
          startPage: 22,
          targetPage: 604,
        }}
        wirdHistory={{ "2026-08-24": [22, 23] }}
      />,
    );

    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText("Progress this month")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /2 of 583 plan pages completed in August 2026/ })).toHaveAttribute(
      "dir",
      "ltr",
    );
    expect(screen.queryByText("Your Mushaf position")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "This week" })).not.toBeInTheDocument();
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
    expect(screen.getAllByRole("progressbar")[1]).toHaveAttribute("dir", "rtl");

    fireEvent.click(screen.getByRole("button", { name: "تعديل" }));
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio.closest("label")?.querySelector("span")).toHaveClass("text-right");
    }
  });

  it("configures a repeating wird plan for juz, surah, or custom page range", () => {
    const props = renderScreen();
    cleanup();
    const onPlanChange = vi.fn();
    render(<QuranWirdScreen {...props} onPlanChange={onPlanChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("radio", { name: /Daily fixed section/i }));

    // Juz scope defaults to the reader's current position (Juz 2: pages 22-41)
    const juzSelect = screen.getByRole("combobox", { name: /Juz/i });
    expect(juzSelect).toBeInTheDocument();
    expect(juzSelect).toHaveTextContent("Juz 2");

    // Change to Juz 1
    fireEvent.click(juzSelect);
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("Juz 1"));
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "repeating",
        repeatScope: "juz",
        repeatNumber: 1,
        repeatStartPage: 1,
        repeatEndPage: 21,
        dailyPages: 21,
      }),
    );

    // Now test custom scope
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("radio", { name: /Daily fixed section/i }));
    fireEvent.click(screen.getByRole("button", { name: "Custom range" }));
    const startInput = screen.getByLabelText("From page");
    const endInput = screen.getByLabelText("To page");
    fireEvent.change(startInput, { target: { value: "10" } });
    fireEvent.change(endInput, { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "repeating",
        repeatScope: "custom",
        repeatStartPage: 10,
        repeatEndPage: 25,
        dailyPages: 16,
      }),
    );
  });

  it("displays repeating plan with restart action, accurate progress, and week completion", () => {
    const today = getProgressDayKey(new Date(), 4);
    const onContinue = vi.fn();
    const props = renderScreen();
    cleanup();

    // Juz 1: pages 1 to 21 (21 pages). Suppose user read 5 pages in range and 10 pages outside range (e.g. 50..59)
    render(
      <QuranWirdScreen
        {...props}
        onContinue={onContinue}
        plan={{
          kind: "repeating",
          repeatScope: "juz",
          repeatNumber: 1,
          repeatStartPage: 1,
          repeatEndPage: 21,
          dailyPages: 21,
          startedDayKey: today,
        }}
        wirdHistory={{
          [today]: [1, 2, 3, 4, 5, 50, 51, 52, 53, 54],
        }}
      />,
    );

    // Range display and context
    expect(screen.getByText("Pages 1–21")).toBeInTheDocument();
    expect(screen.getAllByText(/Juz 1/).length).toBeGreaterThanOrEqual(1);

    // Progress should only count the 5 pages in range, not the 10 outside
    expect(screen.getByText("5 of 21 completed")).toBeInTheDocument();

    // "Start section again" action
    const startAgainBtn = screen.getByRole("button", { name: /Start section again/i });
    expect(startAgainBtn).toBeInTheDocument();
    fireEvent.click(startAgainBtn);
    expect(onContinue).toHaveBeenCalledWith(1);

    // Regular continue reading
    fireEvent.click(screen.getByRole("button", { name: /Continue reading/i }));
    expect(onContinue).toHaveBeenCalledWith();

    // Now test when 100% of the repeating section is read
    cleanup();
    const all21Pages = Array.from({ length: 21 }, (_, i) => i + 1);
    render(
      <QuranWirdScreen
        {...props}
        onContinue={onContinue}
        plan={{
          kind: "repeating",
          repeatScope: "juz",
          repeatNumber: 1,
          repeatStartPage: 1,
          repeatEndPage: 21,
          dailyPages: 21,
          startedDayKey: today,
        }}
        wirdHistory={{
          [today]: all21Pages,
        }}
      />,
    );

    expect(screen.getByText("21 of 21 completed")).toBeInTheDocument();
    expect(screen.getByText("Today's Wird complete")).toBeInTheDocument();
  });

  it("configures a custom plan with start page, target page, and duration days", () => {
    const props = renderScreen();
    cleanup();
    const onPlanChange = vi.fn();
    render(<QuranWirdScreen {...props} onPlanChange={onPlanChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("radio", { name: /Custom Khatmah/i }));

    const startInput = screen.getByLabelText("From page");
    const targetInput = screen.getByLabelText("To page");
    const daysInput = screen.getByLabelText("Days to complete");

    fireEvent.change(startInput, { target: { value: "10" } });
    fireEvent.change(targetInput, { target: { value: "100" } });
    fireEvent.change(daysInput, { target: { value: "30" } });

    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));

    expect(onPlanChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "custom",
        startPage: 10,
        targetPage: 100,
        durationDays: 30,
        dailyPages: expect.any(Number),
      }),
    );
  });

  it("displays overall Quran progress stats (completed pages and Juz count) inside the plan card", () => {
    const props = renderScreen();
    cleanup();
    const juz1Pages = Array.from({ length: 21 }, (_, i) => i + 1);

    render(
      <QuranWirdScreen
        {...props}
        plan={{ kind: "daily", dailyPages: 4 }}
        wirdHistory={{
          "2026-10-01": juz1Pages,
        }}
      />,
    );

    expect(screen.getByText("Overall Quran progress")).toBeInTheDocument();
    expect(screen.getByText("Completed pages")).toBeInTheDocument();
    expect(screen.getByText("Completed Juzs")).toBeInTheDocument();
    // 21 / 604 pages and 1 / 30 juzs
    expect(screen.getByText("21 / 604")).toBeInTheDocument();
    expect(screen.getByText("1 / 30")).toBeInTheDocument();
  });
});

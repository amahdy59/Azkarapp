import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { chooseProgressOption } from "../../test/progressSelect";
import { ProgressHeatmap } from "./ProgressHeatmap";
import { indexProgressDashboard } from "../progressDashboard";

const now = new Date(2026, 9, 20, 12);
const records = indexProgressDashboard(
  {
    dailyCompletions: [{ dayKey: "2026-10-19", category: "morning", timeZone: "Africa/Cairo" }],
    prayerTracking: [],
    dailyHabits: [],
    wirdHistory: { "2026-10-19": [1, 2] },
    quranWirdDailyGoals: {},
  },
  "2026-10-20",
);
const props = {
  records,
  now,
  range: { startKey: "2026-10-01", endKey: "2026-10-31" },
  dayStart: 3,
  currentDay: false,
  language: "en" as const,
  calendar: "gregorian" as const,
  period: "month" as const,
  displayDate: now,
};

describe("ProgressHeatmap", () => {
  it.each(["en", "ar"] as const)("keeps physical keys, selected date and exact values coherent in %s", (language) => {
    render(<ProgressHeatmap {...props} language={language} />);
    const grid = screen.getByRole("group", { name: /Recording dates|تواريخ التسجيل/ });
    const first = grid.querySelector<HTMLButtonElement>('[data-day="2026-10-19"]')!;
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("progress-date-details")).toHaveTextContent(language === "en" ? "1 of 3" : "١ من ٣");
    fireEvent.keyDown(first, { key: language === "ar" ? "ArrowRight" : "ArrowLeft" });
    expect(grid.querySelector('[data-day="2026-10-18"]')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(grid.querySelector('[data-day="2026-10-01"]')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(grid.querySelector('[data-day="2026-10-20"]')).toHaveFocus();
    expect(grid.querySelector('[data-day="2026-10-21"]')).toBeDisabled();
  });
  it("keeps unknown historical goals distinct from no saved completion and explains fixed page bands", async () => {
    render(<ProgressHeatmap {...props} />);
    await chooseProgressOption(screen.getByRole("combobox", { name: "Calendar practice" }), "quranGoals");
    const past = screen.getByRole("button", { name: /19 Oct 2026.*Quran-goal days: Unavailable/ });
    expect(past).toHaveAttribute("data-kind", "unavailable");
    fireEvent.click(past);
    expect(within(screen.getByTestId("progress-date-details")).getByRole("status")).toHaveTextContent("Unavailable");
    await chooseProgressOption(screen.getByRole("combobox", { name: "Calendar practice" }), "pages");
    expect(screen.getByTestId("progress-heatmap-legend")).toHaveTextContent("1–4 · 5–10 · 11–20 · 21+");
    expect(screen.getByTestId("progress-date-details")).toHaveTextContent("2 pages");
  });
  it("bounds year exploration, disables future months and never mutates the selected page range", () => {
    const range = { startKey: "2026-01-01", endKey: "2026-12-31" };
    render(<ProgressHeatmap {...props} period="year" range={range} />);
    const months = screen.getByRole("group", { name: "Explore a month" });
    expect(within(months).getAllByRole("button")).toHaveLength(12);
    expect(within(months).getByRole("button", { name: "November" })).toBeDisabled();
    fireEvent.click(within(months).getByRole("button", { name: "January" }));
    expect(screen.getByRole("button", { name: "Previous calendar month" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next calendar month" }));
    expect(screen.getByRole("heading", { name: "February 2026" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous calendar month" }));
    expect(screen.getByRole("heading", { name: "January 2026" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Recording dates/ }).querySelectorAll("button").length,
    ).toBeLessThanOrEqual(42);
    expect(range).toEqual({ startKey: "2026-01-01", endKey: "2026-12-31" });
  });
});

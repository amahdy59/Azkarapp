import { chooseProgressOption } from "../../test/progressSelect";
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrayerTrackerStats } from "./PrayerTrackerStats";
import { getCalendarMonthPeriod } from "../calendarPeriods";
import { saveFileToDevice } from "../share/shareDispatcher";
vi.mock("../share/shareDispatcher", () => ({ saveFileToDevice: vi.fn().mockResolvedValue(undefined) }));
describe("prayer recording insights", () => {
  it("includes the previous civil prayer day before the devotional-day rollover", () => {
    render(
      <PrayerTrackerStats
        records={[{ dayKey: "2026-10-17", prayer: "fajr", mosque: true, adhkar: false }]}
        activeTab="month"
        displayDate={new Date(2026, 9, 18, 2)}
        now={new Date(2026, 9, 18, 2)}
        language="en"
        calendarType="gregorian"
      />,
    );
    expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("17 complete days");
    expect(within(screen.getByTestId("insight-fajr")).getByRole("img")).toHaveAccessibleName(/1 day recorded/);
  });
  it.each(["gregorian", "hijri"] as const)("uses complete %s days and retains missing days", (calendarType) => {
    const month = getCalendarMonthPeriod(new Date(2026, 5, 15, 12), calendarType, "en");
    const props = {
      records: [],
      activeTab: "month" as const,
      displayDate: month.referenceDate,
      language: "en" as const,
      calendarType,
    };
    const { rerender } = render(<PrayerTrackerStats {...props} now={month.dates[2]} />);
    expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("2 complete days");
    expect(within(screen.getByRole("list")).getAllByRole("img")).toHaveLength(5);
    within(screen.getByRole("list"))
      .getAllByRole("img")
      .forEach((bar) => expect(bar).toHaveAccessibleName(/0%; 0 days recorded/));
    const after = new Date(month.endDate);
    after.setDate(after.getDate() + 1);
    rerender(<PrayerTrackerStats {...props} now={after} />);
    expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent(`${month.dates.length} complete days`);
  });
  it("keeps home, mosque and optional practices independent and offers exact JSON instead of a table", async () => {
    render(
      <PrayerTrackerStats
        language="en"
        calendarType="gregorian"
        activeTab="month"
        displayDate={new Date(2026, 0, 4)}
        now={new Date(2026, 0, 4, 12)}
        records={[
          { dayKey: "2026-01-01", prayer: "fajr", mosque: true, adhkar: true, sunnah: true },
          { dayKey: "2026-01-02", prayer: "fajr", mosque: false, location: "home", adhkar: false },
          { dayKey: "2026-01-01", prayer: "dhuhr", mosque: false, adhkar: true },
          { dayKey: "2026-01-05", prayer: "isha", mosque: true, adhkar: true },
        ]}
      />,
    );
    expect(within(screen.getByTestId("insight-fajr")).getByRole("img")).toHaveAccessibleName(
      "Fajr: 67%; 2 days recorded",
    );
    expect(within(screen.getByTestId("insight-dhuhr")).getByRole("img")).toHaveAccessibleName(/0%; 0 days/);
    await chooseProgressOption(screen.getByRole("combobox", { name: "Practice" }), "rawatib");
    expect(screen.getByRole("combobox", { name: "Practice" })).toHaveFocus();
    expect(within(screen.getByRole("list")).getAllByRole("img")).toHaveLength(4);
    expect(screen.queryByTestId("insight-asr")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("insight-fajr")).getByRole("img")).toHaveAccessibleName(/33%; 1 day/);
    await chooseProgressOption(screen.getByRole("combobox", { name: "Practice" }), "adhkar");
    expect(within(screen.getByTestId("insight-dhuhr")).getByRole("img")).toHaveAccessibleName(/33%; 1 day/);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Prayer JSON" }));
    await waitFor(() => expect(saveFileToDevice).toHaveBeenCalled());
    expect(vi.mocked(saveFileToDevice).mock.calls.at(-1)?.[0].name).toBe("prayer-patterns-2026-01-01.json");
    expect(await screen.findByText("Data file saved.")).toBeInTheDocument();
    expect(screen.getByText(/absent record does not mean a missed prayer/)).toBeInTheDocument();
  });
  it("shows no rate for an unavailable period and localizes Arabic percentages", () => {
    const props = {
      records: [
        { dayKey: "2026-01-01", prayer: "fajr" as const, location: "home" as const, mosque: false, adhkar: false },
      ],
      activeTab: "year" as const,
      displayDate: new Date(2026, 0, 2),
      now: new Date(2026, 0, 2, 12),
      language: "ar" as const,
      calendarType: "gregorian" as const,
    };
    const { rerender } = render(<PrayerTrackerStats {...props} />);
    expect(within(screen.getByTestId("insight-fajr")).getByText("١٠٠٪")).toBeInTheDocument();
    rerender(<PrayerTrackerStats {...props} displayDate={new Date(2027, 0, 2)} />);
    expect(screen.getAllByText("—")).toHaveLength(5);
  });
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PrayerTrackerStats } from "./PrayerTrackerStats";
import { getCalendarMonthPeriod } from "../calendarPeriods";

describe("compact prayer history", () => {
  it.each(["gregorian", "hijri"] as const)(
    "distinguishes elapsed days from the actual %s month length",
    (calendarType) => {
      const month = getCalendarMonthPeriod(new Date(2026, 5, 15, 12), calendarType, "en");
      const props = {
        records: [],
        activeTab: "month" as const,
        displayDate: month.referenceDate,
        language: "en" as const,
        calendarType,
      };
      const { rerender } = render(<PrayerTrackerStats {...props} now={month.dates[2]} />);
      expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent(`3 of ${month.dates.length} calendar days`);
      expect(screen.getByText("0 of 15 recorded", { selector: "bdi.text-xl" })).toBeVisible();
      for (const bar of screen.getAllByRole("img")) expect(bar).toHaveAccessibleName(/0 \/ 3/);
      const afterMonth = new Date(month.endDate);
      afterMonth.setDate(afterMonth.getDate() + 1);
      rerender(<PrayerTrackerStats {...props} now={afterMonth} />);
      expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent(`${month.dates.length} elapsed days`);
      expect(screen.getByText(`0 of ${month.dates.length * 5} recorded`, { selector: "bdi.text-xl" })).toBeVisible();
    },
  );
  it("compares five prayers and keeps location stacks independent from connected practices", async () => {
    const user = userEvent.setup();
    render(
      <PrayerTrackerStats
        language="en"
        calendarType="gregorian"
        activeTab="month"
        displayDate={new Date(2026, 0, 2)}
        now={new Date(2026, 0, 2, 12)}
        records={[
          { dayKey: "2026-01-01", prayer: "fajr", mosque: true, adhkar: true, sunnah: true },
          { dayKey: "2026-01-02", prayer: "fajr", mosque: false, location: "home", adhkar: false },
        ]}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(5);
    await user.click(screen.getByRole("combobox", { name: "Compare prayers" }));
    await user.click(screen.getByRole("option", { name: "Prayer locations" }));
    const fajr = screen.getByTestId("prayer-comparison-fajr");
    expect(within(fajr).getByRole("img")).toHaveAccessibleName(/At the mosque: 1; At home: 1; Not recorded: 0/i);
    expect(within(fajr).getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Sunan Rawātib", exact: true }));
    expect(screen.getByTestId("prayer-comparison-asr")).toHaveTextContent("Not applicable");
    expect(within(screen.getByTestId("prayer-comparison-asr")).queryByRole("img")).toBeNull();
    fireEvent.click(screen.getByText("View exact prayer records", { selector: "summary" }));
    expect(screen.getByRole("table")).toHaveTextContent("2 / 2");
    expect(screen.getByRole("table")).toHaveTextContent("Not applicable");
  });
});

it("keeps exact supporting records behind an accessible disclosure", async () => {
  const user = userEvent.setup();
  render(
    <PrayerTrackerStats
      records={[]}
      activeTab="week"
      displayDate={new Date(2026, 8, 21, 12)}
      now={new Date(2026, 8, 21, 12)}
      language="en"
      calendarType="gregorian"
    />,
  );
  expect(screen.getByText("Prayer records")).toBeVisible();
  const summary = screen.getByText("View exact prayer records", { selector: "summary" });
  expect(summary.closest("details")).not.toHaveAttribute("open");
  await user.click(summary);
  expect(summary.closest("details")).toHaveAttribute("open");
  expect(within(screen.getByRole("table")).getByRole("rowheader", { name: "Fajr" })).toBeVisible();
  expect(within(screen.getByRole("table")).getByRole("rowheader", { name: "Isha" })).toBeVisible();
});
it("measures annual coverage through today including unrecorded gaps and excluding future mosque records", async () => {
  const user = userEvent.setup();
  const records = (["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).flatMap((prayer) => [
    { dayKey: "2026-01-01", prayer, location: "home" as const, mosque: false, sunnah: true, adhkar: true },
    { dayKey: "2026-01-03", prayer, location: "mosque" as const, mosque: true, sunnah: true, adhkar: true },
  ]);
  render(
    <PrayerTrackerStats
      records={records}
      activeTab="year"
      displayDate={new Date(2026, 0, 2, 12)}
      now={new Date(2026, 0, 2, 12)}
      language="en"
      calendarType="gregorian"
    />,
  );
  expect(screen.queryByText(/1825/)).not.toBeInTheDocument();
  expect(screen.getByText("50%")).toBeInTheDocument();
  expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("2 elapsed days");
  expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("Unrecorded does not mean missed");
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: "At the mosque", exact: true }));
  expect(screen.getByRole("status")).toHaveTextContent("0 of 10 recorded");
  for (const bar of screen.getAllByRole("img")) expect(bar).toHaveAccessibleName(/0 \/ 2/);
});
it("shows a neutral unavailable rate for a period that has not started", () => {
  render(
    <PrayerTrackerStats
      records={[]}
      activeTab="year"
      displayDate={new Date(2027, 0, 2, 12)}
      now={new Date(2026, 0, 2, 12)}
      language="en"
      calendarType="gregorian"
    />,
  );
  expect(screen.queryByText("0%")).not.toBeInTheDocument();
  expect(screen.getAllByText("—").length).toBeGreaterThan(0);
});
it("localizes recording percentages in Arabic", () => {
  render(
    <PrayerTrackerStats
      records={[{ dayKey: "2026-01-01", prayer: "fajr", location: "home", mosque: false, adhkar: false }]}
      activeTab="year"
      displayDate={new Date(2026, 0, 1, 12)}
      now={new Date(2026, 0, 1, 12)}
      language="ar"
      calendarType="gregorian"
    />,
  );
  expect(screen.getByText("٢٠٪")).toBeInTheDocument();
});

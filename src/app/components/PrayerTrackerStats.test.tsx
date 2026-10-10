import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PrayerTrackerStats } from "./PrayerTrackerStats";

describe("PrayerTrackerStats", () => {
  it("keeps the per-prayer matrix behind an accessible disclosure", async () => {
    const user = userEvent.setup();
    render(
      <PrayerTrackerStats
        records={[]}
        activeTab="week"
        displayDate={new Date("2026-09-21T12:00:00")}
        language="en"
        calendarType="gregorian"
      />,
    );

    expect(screen.getByText("Total Obligatory Prayers")).toBeVisible();
    const disclosure = screen.getByText("View each prayer").closest("details");
    expect(disclosure).not.toHaveAttribute("open");

    await user.click(screen.getByText("View each prayer"));

    expect(disclosure).toHaveAttribute("open");
    expect(screen.getByText("Fajr")).toBeVisible();
    expect(screen.getByText("Isha")).toBeVisible();
  });

  it("measures annual recorded coverage through today, including unrecorded gaps", () => {
    const records = (["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).flatMap((prayer) => [
      { dayKey: "2026-01-01", prayer, location: "home" as const, sunnah: true, adhkar: true },
      { dayKey: "2026-01-03", prayer, location: "mosque" as const, sunnah: true, adhkar: true },
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
    expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
    expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("2 elapsed days");
    expect(screen.getByTestId("prayer-coverage-hint")).toHaveTextContent("Unrecorded does not mean missed");
    expect(screen.getAllByText("0%").length).toBeGreaterThan(0); // future mosque records excluded
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
        records={[{ dayKey: "2026-01-01", prayer: "fajr", location: "home" }]}
        activeTab="year"
        displayDate={new Date(2026, 0, 1, 12)}
        now={new Date(2026, 0, 1, 12)}
        language="ar"
        calendarType="gregorian"
      />,
    );
    expect(screen.getByText("٢٠٪")).toBeInTheDocument();
  });
});

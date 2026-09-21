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
});

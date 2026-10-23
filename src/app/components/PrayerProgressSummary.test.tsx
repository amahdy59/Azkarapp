import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrayerProgressSummary } from "./PrayerProgressSummary";
const dayKey = "2026-10-18";
describe("daily prayer diagram", () => {
  it("shows five native read-only statuses with independent practices and no table", () => {
    const { container } = render(
      <PrayerProgressSummary
        dayKey={dayKey}
        language="en"
        records={[
          { dayKey, prayer: "fajr", mosque: false, location: "home", adhkar: true, sunnahBefore: true },
          { dayKey, prayer: "dhuhr", mosque: false, adhkar: true },
          { dayKey: "2026-10-17", prayer: "isha", mosque: true, adhkar: true },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    const fajr = within(screen.getByText("Fajr").closest("li")!);
    expect(fajr.getByText("At home")).toBeVisible();
    expect(fajr.getByText("Sunan Rawātib")).toBeVisible();
    expect(screen.getAllByText("Completed the azkar")).toHaveLength(2);
    expect(container.querySelector("input, select, textarea, button, a, table, details")).toBeNull();
    expect(screen.getByText(/does not mean a missed prayer/)).toBeVisible();
  });
  it("reads legacy mosque facts and localizes empty Arabic statuses", () => {
    const { rerender } = render(
      <PrayerProgressSummary
        records={[{ dayKey, prayer: "fajr", mosque: true, adhkar: false }]}
        dayKey={dayKey}
        language="en"
      />,
    );
    expect(screen.getByText("At the mosque")).toBeVisible();
    rerender(<PrayerProgressSummary records={[]} dayKey={dayKey} language="ar" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("الفجر")).toBeVisible();
  });
});

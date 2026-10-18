import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrayerProgressSummary } from "./PrayerProgressSummary";

const dayKey = "2026-10-18";
describe("PrayerProgressSummary", () => {
  it("shows independent practice totals without any recording controls", () => {
    const { container } = render(
      <PrayerProgressSummary
        records={[
          { dayKey, prayer: "fajr", mosque: false, location: "home", adhkar: true, sunnah: true },
          { dayKey, prayer: "dhuhr", mosque: false, adhkar: true },
        ]}
        dayKey={dayKey}
        language="en"
      />,
    );
    expect(screen.getByText("1 recorded")).toBeInTheDocument();
    expect(screen.getByText("2 recorded")).toBeInTheDocument();
    expect(container.querySelector("input, select, textarea, button, a")).toBeNull();
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    const table = within(screen.getByRole("table", { hidden: true }));
    expect(table.getByText("At home")).toBeInTheDocument();
    expect(table.getAllByRole("row", { hidden: true })).toHaveLength(6);
    expect(screen.getByText(/does not mean a missed prayer/)).toBeInTheDocument();
  });
  it("reads legacy attendance and excludes records from other days", () => {
    render(
      <PrayerProgressSummary
        records={[
          { dayKey, prayer: "fajr", mosque: true, adhkar: false },
          { dayKey: "2026-10-17", prayer: "dhuhr", mosque: true, adhkar: true, sunnah: true },
        ]}
        dayKey={dayKey}
        language="en"
      />,
    );
    expect(screen.getAllByText("0 recorded")).toHaveLength(2);
    expect(within(screen.getByRole("table", { hidden: true })).getByText("At the mosque")).toBeInTheDocument();
  });
  it("renders empty Arabic records without implying missed worship", () => {
    const { container } = render(<PrayerProgressSummary records={[]} dayKey={dayKey} language="ar" />);
    expect(screen.getAllByText("٠ مسجّل")).toHaveLength(2);
    expect(screen.getByText("تفاصيل الصلوات")).toBeInTheDocument();
    expect(container.querySelector("input, select, textarea, button, a")).toBeNull();
  });
});

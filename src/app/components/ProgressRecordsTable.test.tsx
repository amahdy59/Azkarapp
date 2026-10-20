import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressRecordsTable } from "./ProgressRecordsTable";
import type { ProgressScopedDailyRecord } from "../progressDashboard";

const records: ProgressScopedDailyRecord[] = Array.from({ length: 24 }, (_, index) => ({
  dayKey: `2026-10-${String(index + 1).padStart(2, "0")}`,
  prayers: 1,
  mosque: 0,
  rawatib: 0,
  adhkar: 0,
  morning: 1,
  evening: 0,
  sleep: 0,
  routines: 1,
  pages: index + 1,
  quranGoals: index % 2 ? null : 1,
  quranGoal: index % 2 ? null : 4,
}));
const setup = () =>
  render(
    <ProgressRecordsTable
      records={records}
      metrics={["prayers", "pages", "quranGoals"]}
      language="en"
      calendar="gregorian"
    />,
  );
const dates = () => screen.getAllByRole("rowheader").map((row) => row.querySelector("time")!.dateTime);
describe("ProgressRecordsTable", () => {
  it("paginates exact records with a semantic caption and labelled scroll recovery", () => {
    setup();
    expect(screen.getByRole("table")).toHaveAccessibleName("Exact daily records");
    expect(screen.getByRole("region", { name: "Exact daily records" })).toHaveAttribute("tabindex", "0");
    expect(dates()).toHaveLength(10);
    expect(dates()[0]).toBe("2026-10-24");
    expect(screen.getByRole("button", { name: "Previous records" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next records" }));
    expect(dates()[0]).toBe("2026-10-14");
    fireEvent.click(screen.getByRole("button", { name: "Next records" }));
    expect(dates()).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Next records" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("21–24 of 24 days");
  });
  it("sorts numeric values in both directions without modifying the source records", () => {
    setup();
    const heading = screen.getByRole("columnheader", { name: /Quran pages read/ });
    fireEvent.click(within(heading).getByRole("button"));
    expect(heading).toHaveAttribute("aria-sort", "descending");
    expect(dates()[0]).toBe("2026-10-24");
    fireEvent.click(within(heading).getByRole("button"));
    expect(heading).toHaveAttribute("aria-sort", "ascending");
    expect(dates()[0]).toBe("2026-10-01");
    const goals = screen.getByRole("columnheader", { name: /Quran-goal days/ });
    fireEvent.click(within(goals).getByRole("button"));
    expect(dates().every((day) => Number(day.slice(-2)) % 2 === 1)).toBe(true);
    expect(records[0].dayKey).toBe("2026-10-01");
  });
  it("searches dates, resets pagination and exposes an honest empty match state", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Next records" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Find a date" }), { target: { value: "2026-10-0" } });
    expect(dates()).toHaveLength(9);
    expect(dates()[0]).toBe("2026-10-09");
    expect(screen.getByRole("button", { name: "Previous records" })).toBeDisabled();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "not a recorded day" } });
    expect(screen.queryByRole("rowheader")).not.toBeInTheDocument();
    expect(screen.getByText("No matching recorded days.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next records" })).toBeDisabled();
  });
  it("renders unavailable metric cells as a dash, distinct from a recorded zero", () => {
    setup();
    const row = screen.getAllByRole("row")[1]!;
    expect(within(row).getByText("—")).toBeInTheDocument();
    expect(within(row).getByText("1")).toBeInTheDocument();
  });
});

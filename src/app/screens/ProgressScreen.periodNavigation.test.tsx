import { chooseProgressOption } from "../../test/progressSelect";
import { useState } from "react";
import type { ProgressPreset } from "../progressDashboard";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressScreen } from "./ProgressScreen";
vi.mock("../hooks/useNow", () => ({ useNow: () => new Date(2026, 9, 12, 12) }));
function RoutedProgress() {
  const [period, setPeriod] = useState<ProgressPreset>("year");
  return (
    <>
      <button onClick={() => setPeriod("year")}>History back to year</button>
      <ProgressScreen
        dailyCompletions={[]}
        progressDayStartHour={3}
        calendarType="gregorian"
        language="en"
        direction="ltr"
        onOpenShareModal={() => undefined}
        initialPeriod={period}
        onPeriodChange={setPeriod}
      />
    </>
  );
}
async function selectRange(start: string, end: string) {
  fireEvent.click(screen.getByTestId("progress-filters-toggle"));
  await chooseProgressOption(screen.getByRole("combobox", { name: "Date range" }), "custom");
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: end } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
}
describe("Progress period navigation", () => {
  it("keeps the selected range across accessible tabs and opens a card's own trend", async () => {
    render(<RoutedProgress />);
    await selectRange("2025-01-01", "2025-12-31");
    const date = screen.getByTestId("garden-view-date").textContent;
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: "Explore Quran pages read" }));
    const trends = screen.getByRole("tab", { name: "Trends" });
    expect(trends).toHaveFocus();
    expect(trends).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("combobox", { name: "Show trend for" })).toHaveAttribute("data-progress-value", "pages");
    expect(screen.getByTestId("garden-view-date").textContent).toBe(date);
    fireEvent.keyDown(trends, { key: "End" });
    expect(screen.getByRole("tabpanel", { name: "Trends" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Export JSON" })).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-main-trend")).toBeInTheDocument();
    expect(screen.getByTestId("garden-view-date").textContent).toBe(date);
    fireEvent.keyDown(trends, { key: "Home" });
    expect(screen.getByRole("tabpanel", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByTestId("garden-view-date").textContent).toBe(date);
  });
  it("preserves historical ranges and synchronizes externally restored periods through the shared range selector", async () => {
    render(<RoutedProgress />);
    await selectRange("2025-01-01", "2025-12-31");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2025");
    fireEvent.click(screen.getByTestId("progress-tab-trends"));
    expect(screen.getByTestId("progress-main-trend")).toBeVisible();
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "custom");
    fireEvent.click(screen.getByTestId("progress-filters-toggle"));
    await chooseProgressOption(screen.getByRole("combobox", { name: "Date range" }), "month");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("1 – 31 Oct 2026");
    await selectRange("2026-09-01", "2026-09-30");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("1 – 30 Sept 2026");
    fireEvent.click(screen.getByRole("button", { name: "History back to year" }));
    expect(screen.getByTestId("progress-filters-toggle")).toHaveAttribute("data-progress-value", "year");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2026");
  });
});

import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressScreen } from "./ProgressScreen";
vi.mock("../hooks/useNow", () => ({ useNow: () => new Date(2026, 9, 12, 12) }));
function RoutedProgress() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("year");
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
describe("Progress period navigation", () => {
  it("preserves historical ranges and synchronizes externally restored periods without a long selector", () => {
    render(<RoutedProgress />);
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2025");
    expect(screen.getByTestId("routine-trends")).toBeVisible();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Month", exact: true }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("October");
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("September");
    fireEvent.click(screen.getByRole("button", { name: "History back to year" }));
    expect(screen.getByRole("tab", { name: "Year", exact: true })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2026");
  });
});

import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("Progress month exploration and routing", () => {
  it("preserves the selected historical month when routing echoes the new period and restores keyboard context", async () => {
    const user = userEvent.setup();
    render(<RoutedProgress />);
    await screen.findByRole("combobox", { name: "Explore a period" });
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    await waitFor(() => expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2025"));
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "February" }));
    fireEvent.click(screen.getByRole("button", { name: "Explore this month" }));
    await screen.findByTestId("month-weekly-chart");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("February");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2025");
    expect(screen.getByRole("tab", { name: "Month", exact: true })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "History back to year" }));
    await screen.findByTestId("year-monthly-chart");
    expect(screen.getByRole("tab", { name: "Year", exact: true })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2026");
  });
});

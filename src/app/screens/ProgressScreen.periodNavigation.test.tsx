import { chooseProgressOption } from "../../test/progressSelect";
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
  it("preserves historical ranges and synchronizes externally restored periods through the shared range selector", async () => {
    render(<RoutedProgress />);
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2025");
    expect(screen.getByTestId("progress-main-trend")).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveAttribute("data-progress-value", "year");
    await chooseProgressOption(screen.getByRole("combobox", { name: "Period" }), "month");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("1 – 31 Oct 2026");
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("1 – 30 Sept 2026");
    fireEvent.click(screen.getByRole("button", { name: "History back to year" }));
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveAttribute("data-progress-value", "year");
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("2026");
  });
});

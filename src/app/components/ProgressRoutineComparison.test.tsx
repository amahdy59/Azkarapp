import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressRoutineComparison } from "./ProgressRoutineComparison";

const range = { startKey: "2026-10-01", endKey: "2026-10-10" };
const value = (count: number, possible: number | null = 10) => ({ count, possible, days: 10, range });
describe("Progress routine comparison", () => {
  it("compares like denominators and discloses a separate exact composition of saved completions", async () => {
    render(
      <ProgressRoutineComparison language="en" values={{ morning: value(6), evening: value(3), sleep: value(1) }} />,
    );
    expect(screen.getAllByRole("progressbar").map((bar) => bar.getAttribute("aria-valuemax"))).toEqual([
      "10",
      "10",
      "10",
    ]);
    expect(screen.queryByTestId("progress-routine-composition")).not.toBeInTheDocument();
    expect(screen.queryByText("Your recorded routine breakdown")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-routine-bars")).toHaveTextContent("6 of 10");
  });
  it("does not draw a composition or false rate when there are no observations/opportunities", async () => {
    render(
      <ProgressRoutineComparison
        language="en"
        values={{ morning: value(0, 0), evening: value(0), sleep: value(0, null) }}
      />,
    );
    expect(screen.getAllByText("Unavailable")).toHaveLength(4);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

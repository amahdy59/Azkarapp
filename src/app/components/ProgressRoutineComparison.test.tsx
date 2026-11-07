import { fireEvent, render, screen, within } from "@testing-library/react";
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
    fireEvent.click(screen.getByText("Your recorded routine breakdown"));
    const composition = await screen.findByTestId("progress-routine-composition");
    expect(composition).toHaveTextContent("6 · 60%");
    expect(composition).toHaveTextContent("3 · 30%");
    expect(composition).toHaveTextContent("1 · 10%");
    expect(within(composition).getByRole("img")).toHaveAccessibleName(/breakdown/);
    expect(composition.querySelectorAll("circle")).toHaveLength(3);
  });
  it("does not draw a composition or false rate when there are no observations/opportunities", async () => {
    render(
      <ProgressRoutineComparison
        language="en"
        values={{ morning: value(0, 0), evening: value(0), sleep: value(0, null) }}
      />,
    );
    expect(screen.getAllByText("Unavailable")).toHaveLength(4);
    fireEvent.click(screen.getByText("Your recorded routine breakdown"));
    expect(await screen.findByText("Save a routine completion to see the breakdown.")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

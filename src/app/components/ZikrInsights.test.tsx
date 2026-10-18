import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ZikrInsights } from "./ZikrInsights";

describe("individual zikr insights", () => {
  it("shows honest early/tied states and bounded actionable item comparisons", () => {
    const props = { records: [], startKey: "2026-10-01", endKey: "2026-10-17", language: "en" as const };
    const { rerender } = render(<ZikrInsights {...props} />);
    expect(screen.getByText(/Patterns appear after three/)).toBeVisible();
    const records = [1, 2, 3].map((day) => ({
      dayKey: `2026-10-0${day}`,
      category: "morning" as const,
      offeredIds: ["m-hm-77m", "m-hm-78m"],
      completedIds: ["m-hm-77m"],
    }));
    rerender(<ZikrInsights {...props} records={records} />);
    const region = within(screen.getByTestId("zikr-insights"));
    expect(region.getByText("Give these attention")).toBeVisible();
    expect(region.getByText("Most consistent")).toBeVisible();
    expect(region.getAllByRole("link")).toHaveLength(2);
    expect(region.getAllByRole("link")[0]).toHaveAttribute("href", expect.stringContaining("mode=complete"));
    expect(region.getAllByRole("img")[0]).toHaveAccessibleName(/Completed on 0 of 3 recorded routine days/);
    rerender(<ZikrInsights {...props} records={records.map((row) => ({ ...row, completedIds: row.offeredIds }))} />);
    expect(screen.getByText(/evenly matched/)).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

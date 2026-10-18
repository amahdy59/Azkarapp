import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PeriodComparison } from "./PeriodComparison";

describe("matched-period comparison", () => {
  it("labels the measure, equal sample and percentage-point change; avoids absent history claims", () => {
    const props = {
      current: 30,
      previous: 15,
      possible: 51,
      days: 17,
      language: "en" as const,
      period: "month" as const,
      label: "All routines",
    };
    const { rerender } = render(<PeriodComparison {...props} />);
    expect(screen.getByTestId("period-comparison")).toHaveTextContent("Up 29 percentage points");
    expect(screen.getByText(/first 17 days of each/)).toBeVisible();
    rerender(<PeriodComparison {...props} current={0} />);
    expect(screen.getByText("Down 29 percentage points")).toBeVisible();
    rerender(<PeriodComparison {...props} current={15} />);
    expect(screen.getByText("No change")).toBeVisible();
    rerender(<PeriodComparison {...props} previous={0} />);
    expect(screen.queryByTestId("period-comparison")).not.toBeInTheDocument();
    rerender(<PeriodComparison {...props} days={2} />);
    expect(screen.queryByTestId("period-comparison")).not.toBeInTheDocument();
  });
});

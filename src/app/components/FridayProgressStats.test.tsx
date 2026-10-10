import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFridaySummary } from "../fridaySummary";
import { FridayProgressStats } from "./FridayProgressStats";

vi.mock("../fridaySummary", () => ({ getFridaySummary: vi.fn() }));
beforeEach(() => {
  vi.mocked(getFridaySummary).mockClear();
  vi.mocked(getFridaySummary).mockReturnValue({
    kahfOpened: true,
    salawatCount: 9,
    salawatTarget: 100,
    practicesDone: 1,
    practicesTotal: 6,
  });
});
describe("Friday period records", () => {
  it("excludes future Fridays and hides only the annual salawat tally", () => {
    render(
      <FridayProgressStats
        activeTab="year"
        displayDate={new Date(2026, 0, 2, 12)}
        now={new Date(2026, 0, 2, 12)}
        language="en"
        calendarType="gregorian"
        direction="ltr"
      />,
    );
    expect(getFridaySummary).toHaveBeenCalledExactlyOnceWith("2026-01-02");
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.queryByText("9")).not.toBeInTheDocument();
  });
  it("preserves recent salawat records and does not read future periods", () => {
    const props = {
      displayDate: new Date(2026, 0, 2, 12),
      now: new Date(2026, 0, 2, 12),
      language: "en" as const,
      calendarType: "gregorian" as const,
      direction: "ltr" as const,
    };
    const { rerender } = render(<FridayProgressStats {...props} activeTab="week" />);
    expect(screen.getByText("9")).toBeInTheDocument();
    vi.mocked(getFridaySummary).mockClear();
    rerender(<FridayProgressStats {...props} activeTab="year" displayDate={new Date(2027, 0, 2, 12)} />);
    expect(getFridaySummary).not.toHaveBeenCalled();
  });
});

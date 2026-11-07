import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFridaySummary } from "../fridaySummary";
import { FridayProgressStats } from "./FridayProgressStats";
import { t } from "../i18n";
import { formatRatio } from "../formatting";

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

describe("Friday progress presentation", () => {
  it.each(["ar", "en"] as const)("preserves exact ratios with accessible transform-based fills in %s", (language) => {
    vi.mocked(getFridaySummary).mockReturnValue({
      practicesDone: 2,
      practicesTotal: 4,
      kahfOpened: true,
      salawatCount: 10,
      salawatTarget: 100,
    });
    const direction = language === "ar" ? "rtl" : "ltr";
    render(
      <FridayProgressStats
        activeTab="week"
        displayDate={new Date(2026, 9, 16, 12)}
        now={new Date(2026, 9, 20, 12)}
        range={{ startKey: "2026-10-16", endKey: "2026-10-16" }}
        language={language}
        calendarType="gregorian"
        direction={direction}
      />,
    );
    const practices = screen.getByRole("progressbar", { name: t(language, "friday.practicesDone") });
    expect(practices).toHaveAttribute("aria-valuenow", "2");
    expect(practices).toHaveAttribute("aria-valuemax", "4");
    expect(practices).toHaveAttribute("aria-valuetext", formatRatio(2, 4, language));
    expect(practices).toHaveAttribute("dir", direction);
    const kahf = screen.getByRole("progressbar", { name: t(language, "friday.kahfOpened") });
    expect(kahf).toHaveAttribute("aria-valuenow", "1");
    expect(kahf).toHaveAttribute("aria-valuemax", "1");
    for (const track of [practices, kahf])
      expect(track.querySelector<HTMLElement>('[data-slot="progress-fill"]')?.style.width).toBe("");
  });
});

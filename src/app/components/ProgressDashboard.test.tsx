import { chooseProgressOption } from "../../test/progressSelect";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressDashboard } from "./ProgressDashboard";
import { indexProgressDashboard } from "../progressDashboard";
import type { DailyCollectionCompletion } from "../types";

const now = new Date(2026, 9, 20, 12);
const input = {
  dailyCompletions: Array.from({ length: 19 }, (_, index) => ({
    dayKey: `2026-10-${String(index + 1).padStart(2, "0")}`,
    category: "morning",
    timeZone: "Africa/Cairo",
  })) as DailyCollectionCompletion[],
  prayerTracking: [],
  dailyHabits: [],
  wirdHistory: Object.fromEntries(
    Array.from({ length: 19 }, (_, index) => [
      `2026-10-${String(index + 1).padStart(2, "0")}`,
      Array.from({ length: index + 1 }, (_, page) => page + 1),
    ]),
  ),
  quranWirdDailyGoals: {},
  quranWirdPlan: { kind: "daily" as const, dailyPages: 4 },
};
const records = indexProgressDashboard(input, "2026-10-20");
function props() {
  return {
    records,
    range: { startKey: "2026-10-01", endKey: "2026-10-31" },
    period: "month" as const,
    displayDate: now,
    now,
    dayStart: 3,
    currentDay: false,
    language: "en" as const,
    calendar: "gregorian" as const,
  };
}
describe("ProgressDashboard", () => {
  it("keeps truthful empty and target-only metrics without a redundant empty-period card", () => {
    const empty = indexProgressDashboard({ ...input, dailyCompletions: [], wirdHistory: {} }, "2026-10-20");
    const { rerender } = render(<ProgressDashboard {...props()} records={empty} />);
    expect(screen.queryByTestId("progress-empty-period")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
    expect(screen.getByTestId("progress-metric-prayers")).toHaveTextContent("No saved records yet");
    expect(screen.getByTestId("progress-metric-pages")).toHaveTextContent("No saved records yet");
    rerender(<ProgressDashboard {...props()} />);
    expect(screen.queryByTestId("progress-empty-period")).not.toBeInTheDocument();
  });
  it("distinguishes first records from an empty selection without repeating insight panels", () => {
    const { rerender } = render(<ProgressDashboard {...props()} records={[]} />);
    expect(screen.queryByTestId("progress-empty-period")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-pages")).toHaveTextContent("No saved records yet");
    rerender(<ProgressDashboard {...props()} range={{ startKey: "2026-09-01", endKey: "2026-09-30" }} />);
    expect(screen.queryByTestId("progress-empty-period")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-prayers")).toHaveTextContent("No saved records yet");
    rerender(<ProgressDashboard {...props()} />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    const heatmap = screen.getByTestId("progress-heatmap");
    expect(heatmap.querySelector('[data-day="2026-10-19"]')).toHaveAttribute("data-kind", "recorded");
    expect(heatmap.querySelector('[data-day="2026-10-20"]')).toHaveAttribute("data-kind", "none");
    const details = screen.getByTestId("progress-date-details");
    expect(details).toHaveTextContent("No pages recorded");
    expect(details).toHaveTextContent("0 of 1");
  });
  it("offers a real week action from a one-day trend without drawing a misleading line", () => {
    const onChooseWeek = vi.fn();
    render(<ProgressDashboard {...props()} period="day" view="trends" onChooseWeek={onChooseWeek} />);
    fireEvent.click(screen.getByRole("button", { name: "View this week" }));
    expect(onChooseWeek).toHaveBeenCalledOnce();
    expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
  });
  it("leads with four independent counts and truthful bars, with charts and records in their own views", async () => {
    const onShowTrend = vi.fn();
    const { rerender } = render(<ProgressDashboard {...props()} onShowTrend={onShowTrend} />);
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    expect(screen.getByTestId("progress-metric-routines")).toHaveTextContent("19 of 60");
    expect(screen.getByTestId("progress-metric-pages")).toHaveTextContent("190");
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
    expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Included:/)).toHaveLength(1);
    expect(within(screen.getByTestId("progress-metric-routines")).getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "19 of 60",
    );
    expect(within(screen.getByTestId("progress-metric-pages")).queryByRole("progressbar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore Quran pages read" }));
    expect(onShowTrend).toHaveBeenCalledOnce();
    rerender(<ProgressDashboard {...props()} view="trends" onShowTrend={onShowTrend} />);
    expect(screen.getAllByTestId("progress-main-trend")).toHaveLength(1);
    expect(screen.getByTestId("progress-main-trend")).toHaveTextContent("count scale starts at zero");
    expect(screen.getByTestId("recording-time-scale")).not.toHaveTextContent("%");
  });
  it("keeps the four summaries fixed and removes redundant overview controls", () => {
    render(<ProgressDashboard {...props()} />);
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Choose metrics" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("progress-routine-bars")).not.toBeInTheDocument();
    expect(screen.queryByTestId("progress-routine-composition")).not.toBeInTheDocument();
  });
  it("attaches routine comparisons to the matching trend and selects presentation automatically", async () => {
    render(<ProgressDashboard {...props()} view="trends" />);
    expect(screen.queryByRole("combobox", { name: "Chart display" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("progress-routine-bars")).not.toBeInTheDocument();
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show trend for" }), "routines");
    expect(screen.getByTestId("progress-routine-bars")).toHaveTextContent("19 of 20");
    expect(screen.queryByTestId("progress-routine-composition")).not.toBeInTheDocument();
  });
  it("uses a snapshot instead of a one-point line in Day view", () => {
    const { rerender } = render(
      <ProgressDashboard
        {...props()}
        period="day"
        range={{ startKey: "2026-10-20", endKey: "2026-10-20" }}
        currentDay
      />,
    );
    expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
    rerender(
      <ProgressDashboard
        {...props()}
        view="trends"
        period="day"
        range={{ startKey: "2026-10-20", endKey: "2026-10-20" }}
        currentDay
      />,
    );
    expect(screen.getByText(/One day is a snapshot/)).toBeInTheDocument();
    expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
  });
  it("keeps unknown past goals distinct from a zero completion rate", async () => {
    const { rerender } = render(
      <ProgressDashboard {...props()} range={{ startKey: "2026-10-01", endKey: "2026-10-19" }} />,
    );
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("—");
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("No known goal days");
    expect(within(screen.getByTestId("progress-metric-quranGoals")).queryByRole("progressbar")).not.toBeInTheDocument();
    rerender(<ProgressDashboard {...props()} view="trends" range={{ startKey: "2026-10-01", endKey: "2026-10-19" }} />);
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show trend for" }), "quranGoals");
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("—");
    expect(screen.queryByTestId("recording-time-line")).not.toBeInTheDocument();
  });
});

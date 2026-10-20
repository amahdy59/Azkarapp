import { chooseProgressOption } from "../../test/progressSelect";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    onExport: vi.fn().mockResolvedValue(undefined),
  };
}
function openRecords() {
  const details = screen.getByText("Exact daily records", { selector: "summary" }).parentElement as HTMLDetailsElement;
  details.open = true;
  fireEvent(details, new Event("toggle"));
}
describe("ProgressDashboard", () => {
  it("leads with four independent reconciled counts, one chart and no mounted table", async () => {
    render(<ProgressDashboard {...props()} />);
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    expect(screen.getByTestId("progress-metric-routines")).toHaveTextContent("19 of 60");
    expect(screen.getByTestId("progress-metric-pages")).toHaveTextContent("190");
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
    expect(screen.getAllByTestId("progress-main-trend")).toHaveLength(1);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Included:/)).toHaveLength(1);
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show trend for" }), "pages");
    expect(screen.getByTestId("progress-main-trend")).toHaveTextContent("count scale starts at zero");
    expect(screen.getByTestId("recording-time-scale")).not.toHaveTextContent("%");
  });
  it("keeps selection/order reversible and restores focus after Apply and Cancel", () => {
    render(<ProgressDashboard {...props()} />);
    const choose = screen.getByRole("button", { name: "Choose metrics" });
    fireEvent.click(choose);
    fireEvent.click(screen.getByRole("button", { name: "Move Quran pages read up" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Prayers at the mosque" }));
    expect(screen.queryByTestId("progress-metric-mosque")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(choose).toHaveFocus();
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    fireEvent.click(choose);
    fireEvent.click(screen.getByRole("button", { name: "Move Quran pages read up" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Prayers at the mosque" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(choose).toHaveFocus();
    expect(
      Array.from(screen.getByTestId("progress-overview").children).map((node) => node.getAttribute("data-testid")),
    ).toEqual([
      "progress-metric-prayers",
      "progress-metric-pages",
      "progress-metric-routines",
      "progress-metric-quranGoals",
      "progress-metric-mosque",
    ]);
    fireEvent.click(choose);
    fireEvent.click(screen.getByRole("button", { name: "Reset defaults" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
  });
  it("prevents an empty dashboard and keeps unsaved edits out of the table", () => {
    render(<ProgressDashboard {...props()} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose metrics" }));
    for (const checkbox of screen.getAllByRole("checkbox").filter((element) => (element as HTMLInputElement).checked))
      fireEvent.click(checkbox);
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    expect(screen.getByText("Choose at least one metric.")).toBeInTheDocument();
    expect(screen.getByTestId("progress-overview").children).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    openRecords();
    expect(within(screen.getByRole("table")).getAllByRole("columnheader")).toHaveLength(5);
    expect(screen.getAllByRole("rowheader")).toHaveLength(10);
  });
  it("uses a snapshot instead of a one-point line in Day view", () => {
    render(
      <ProgressDashboard
        {...props()}
        period="day"
        range={{ startKey: "2026-10-20", endKey: "2026-10-20" }}
        currentDay
      />,
    );
    expect(screen.queryByTestId("progress-main-trend")).not.toBeInTheDocument();
    expect(screen.getByText(/One day is a snapshot/)).toBeInTheDocument();
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("0 of 1");
  });
  it("keeps unknown past goals distinct from a zero completion rate", async () => {
    render(<ProgressDashboard {...props()} range={{ startKey: "2026-10-01", endKey: "2026-10-19" }} />);
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("—");
    expect(screen.getByTestId("progress-metric-quranGoals")).toHaveTextContent("No known goal days");
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show trend for" }), "quranGoals");
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("—");
    expect(screen.queryByTestId("recording-time-line")).not.toBeInTheDocument();
  });
  it("reports save errors and recovery without applying table pagination/search to the export", async () => {
    const properties = props();
    properties.onExport.mockRejectedValueOnce(new Error("cancelled"));
    render(<ProgressDashboard {...properties} />);
    openRecords();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "not a day" } });
    const button = screen.getByRole("button", { name: "Export JSON" });
    fireEvent.click(button);
    await screen.findByText("Could not save. Try again.");
    fireEvent.click(button);
    await screen.findByText("Selected-period data saved.");
    expect(properties.onExport).toHaveBeenCalledTimes(2);
    expect(button).not.toBeDisabled();
  });
  it("does not announce an earlier export as the newly selected period's success", async () => {
    let finish!: () => void;
    const properties = props();
    properties.onExport.mockImplementationOnce(() => new Promise<void>((resolve) => (finish = resolve)));
    const { rerender } = render(<ProgressDashboard {...properties} />);
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    rerender(<ProgressDashboard {...properties} range={{ startKey: "2026-09-01", endKey: "2026-09-30" }} />);
    await act(async () => finish());
    await waitFor(() => expect(screen.queryByText("Selected-period data saved.")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Export JSON" })).toBeEnabled();
  });
});

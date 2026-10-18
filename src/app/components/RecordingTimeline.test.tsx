import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecordingTimeline, type RecordingTimelineSeries } from "./RecordingTimeline";

const buckets = [
  { label: "1–7 Oct", axisLabel: "1 Oct", startKey: "2026-10-01", endKey: "2026-10-07", days: 7, partial: false },
  { label: "8–14 Oct", axisLabel: "8 Oct", startKey: "2026-10-08", endKey: "2026-10-14", days: 7, partial: false },
  { label: "15–16 Oct", axisLabel: "15 Oct", startKey: "2026-10-15", endKey: "2026-10-16", days: 2, partial: true },
];
const series: RecordingTimelineSeries[] = [
  {
    id: "all",
    label: "All routines",
    measure: "Three daily routines, equal weight.",
    points: buckets.map((bucket, i) => ({ ...bucket, recorded: [7, 14, 3][i]!, possible: bucket.days * 3 })),
  },
  {
    id: "morning",
    label: "Morning",
    measure: "Days with morning recorded.",
    points: buckets.map((bucket) => ({ ...bucket, recorded: bucket.days, possible: bucket.days })),
  },
];
describe("RecordingTimeline", () => {
  it("renders a prominent line and dates with an inspectable point, comparison and focused series", () => {
    render(
      <RecordingTimeline
        series={series}
        language="en"
        period="month"
        title="Remembrance over time"
        testId="timeline"
      />,
    );
    expect(screen.getByTestId("recording-time-line")).toBeInTheDocument();
    expect(screen.getByTestId("recording-time-plot")).toHaveAccessibleName(/Remembrance over time.*All routines/);
    expect(screen.getByRole("img")).toHaveAccessibleDescription(/Three daily routines/);
    const readout = within(screen.getByTestId("timeline-readout"));
    expect(readout.getByText("50%")).toBeVisible();
    expect(readout.getByText(/Period in progress/)).toBeVisible();
    expect(screen.queryByTestId("timeline-change")).not.toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: /Explore dates/ });
    fireEvent.change(slider, { target: { value: "1" } });
    expect(slider).toHaveAttribute("aria-valuetext", "8–14 Oct: 67% · 14 recorded · 7 days");
    expect(screen.getByTestId("timeline-change")).toHaveTextContent("33 percentage points higher than 1–7 Oct");
    fireEvent.click(screen.getByRole("button", { name: "Morning", exact: true }));
    expect(screen.getByRole("button", { name: "Morning", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(readout.getByText("100%")).toBeVisible();
    expect(screen.getByTestId("timeline-change")).toHaveTextContent("unchanged");
    fireEvent.click(screen.getByText("About this chart"));
    expect(screen.getByText("Days with morning recorded.", { exact: false })).toBeVisible();
    const plotButton = screen.getByRole("button", { name: /Remembrance over time: Choose a date/ });
    fireEvent.keyDown(plotButton, { key: "Home" });
    expect(slider).toHaveValue("0");
    fireEvent.keyDown(plotButton, { key: "ArrowRight" });
    expect(slider).toHaveValue("1");
    fireEvent.keyDown(plotButton, { key: "End" });
    expect(slider).toHaveValue("2");
    fireEvent.keyDown(plotButton, { key: "ArrowLeft" });
    expect(slider).toHaveValue("1");
  });
  it("shows an honest single point and empty state instead of implying a time trend", () => {
    const { rerender } = render(
      <RecordingTimeline
        series={[{ ...series[0]!, points: [series[0]!.points[0]!] }]}
        language="en"
        period="week"
        title="One day"
        testId="timeline"
      />,
    );
    expect(screen.queryByTestId("recording-time-line")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeVisible();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getByText(/One period is available/)).toBeVisible();
    rerender(
      <RecordingTimeline
        series={[{ ...series[0]!, points: [] }]}
        language="ar"
        period="week"
        title="الصلاة"
        testId="timeline"
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/لا توجد أيام مكتملة/)).toBeVisible();
  });
});

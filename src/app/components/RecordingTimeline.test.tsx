import { chooseProgressOption } from "../../test/progressSelect";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it.each(["ar", "en"] as const)(
    "keeps coordinates, pointer selection and physical arrows coherent in %s",
    (language) => {
      const rtl = language === "ar";
      render(
        <RecordingTimeline
          series={[series[0]!]}
          language={language}
          period="month"
          title="Timeline"
          testId="timeline"
        />,
      );
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("dir", rtl ? "rtl" : "ltr");
      const markers = screen.getAllByTestId("recording-time-point");
      expect(Number.parseFloat(markers[0]!.style.left) > Number.parseFloat(markers[2]!.style.left)).toBe(rtl);
      const control = screen.getByRole("button", { name: /Timeline:/ });
      fireEvent.keyDown(control, { key: "Home" });
      expect(slider).toHaveValue("0");
      fireEvent.keyDown(control, { key: rtl ? "ArrowLeft" : "ArrowRight" });
      expect(slider).toHaveValue("1");
      fireEvent.keyDown(slider, { key: rtl ? "ArrowRight" : "ArrowLeft" });
      expect(slider).toHaveValue("0");
      fireEvent.keyDown(slider, { key: "End" });
      expect(slider).toHaveValue("2");
      const bounds = vi.spyOn(control, "getBoundingClientRect").mockReturnValue({ left: 0, width: 500 } as DOMRect);
      fireEvent.click(control, { clientX: rtl ? 492 : 8, detail: 1 });
      expect(slider).toHaveValue("0");
      fireEvent.click(control, { clientX: rtl ? 8 : 492, detail: 1 });
      expect(slider).toHaveValue("2");
      bounds.mockRestore();
    },
  );
  it("does not call rounded rates unchanged, but recognizes equal rates with different opportunities", () => {
    const props = { language: "en" as const, period: "month" as const, title: "Rates", testId: "rates" };
    const make = (pairs: number[][]) => [
      {
        ...series[0]!,
        points: pairs.map(([recorded, possible], index) => ({
          ...buckets[index]!,
          recorded: recorded!,
          possible: possible!,
        })),
      },
    ];
    const { rerender } = render(
      <RecordingTimeline
        {...props}
        series={make([
          [333, 1000],
          [334, 1000],
        ])}
      />,
    );
    expect(screen.queryByTestId("recording-flat-summary")).not.toBeInTheDocument();
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("33%");
    const coordinates = screen
      .getByTestId("recording-time-line")
      .getAttribute("points")!
      .split(" ")
      .map((point) => point.split(",")[1]);
    expect(coordinates[0]).not.toBe(coordinates[1]);
    rerender(
      <RecordingTimeline
        {...props}
        series={make([
          [1, 3],
          [2, 6],
        ])}
      />,
    );
    expect(screen.getByTestId("recording-flat-summary")).toHaveTextContent("Unchanged across 2 periods: 33%");
    rerender(
      <RecordingTimeline
        {...props}
        valueKind="count"
        series={make([
          [0, 0],
          [0, 0],
        ])}
      />,
    );
    expect(screen.getByTestId("recording-flat-summary")).toHaveTextContent("Unchanged across 2 periods: 0");
  });
  it("shows page counts on a zero-based count scale, preserving exact keyboard values", () => {
    render(
      <RecordingTimeline
        series={[
          {
            ...series[0]!,
            points: buckets.map((bucket, index) => ({ ...bucket, recorded: [5, 12, 3][index]!, possible: 0 })),
          },
        ]}
        language="en"
        period="month"
        title="Pages read"
        testId="count-chart"
        hideSeriesControls
        valueKind="count"
        countUnit="pages"
        bucketDescription="Total pages per labelled point"
      />,
    );
    expect(screen.queryByRole("group", { name: "Show the trend for" })).not.toBeInTheDocument();
    expect(screen.getByTestId("recording-time-scale")).toHaveTextContent("1260");
    expect(screen.getByTestId("recording-time-scale")).not.toHaveTextContent("%");
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("3 pages");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "1" } });
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("12 pages");
    expect(screen.queryByTestId("timeline-change")).not.toBeInTheDocument();
  });
  it("does not connect unavailable goal history with a misleading zero line", () => {
    const points = [0, 1, 2, 3, 4].map((index) => ({
      ...buckets[0]!,
      startKey: `2026-10-0${index + 1}`,
      possible: index === 2 ? 0 : 1,
      recorded: index === 2 ? 0 : 1,
    }));
    render(
      <RecordingTimeline
        series={[{ ...series[0]!, points }]}
        language="en"
        period="month"
        title="Known goals"
        testId="unknown-chart"
      />,
    );
    expect(screen.getAllByTestId("recording-time-line")).toHaveLength(2);
    expect(screen.getByTestId("unknown-chart").querySelectorAll('[data-testid="recording-time-point"]')).toHaveLength(
      4,
    );
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    expect(screen.getByTestId("timeline-readout")).toHaveTextContent("—");
    expect(screen.queryByTestId("timeline-change")).not.toBeInTheDocument();
  });
  it("renders a prominent line and dates with an inspectable point, comparison and focused series", async () => {
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
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show the trend for" }), "morning");
    expect(screen.getByRole("combobox")).toHaveAttribute("data-progress-value", "morning");
    expect(screen.getByTestId("recording-flat-summary")).toHaveTextContent("Unchanged across 3 periods: 100%");
    expect(screen.getByTestId("recording-time-plot").parentElement).toHaveStyle({ height: "7rem" });
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

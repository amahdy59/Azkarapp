import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProgressTrendChart } from "./ProgressTrendChart";
import type { ProgressTrendPoint } from "../progressTrend";
const points: ProgressTrendPoint[] = [
  {
    key: "2026-01-01",
    label: "January",
    dates: [new Date(2026, 0, 1, 12)],
    completed: 3,
    possible: 6,
    rate: 50,
    partial: true,
    routines: { morning: 1, evening: 1, before_sleep: 1 },
  },
  {
    key: "2026-02-01",
    label: "February",
    dates: [new Date(2026, 1, 1, 12)],
    completed: 0,
    possible: 0,
    rate: null,
    partial: false,
  },
];
describe("progress trend chart", () => {
  it("preserves historical zero records and removes unavailable periods from chart and exact data", () => {
    const empty = points.map((point) => ({ ...point, completed: 0, rate: point.rate === null ? null : 0 }));
    const { container, rerender } = render(<ProgressTrendChart language="en" points={empty} />);
    expect(container.querySelector("svg[viewBox]")).toHaveAttribute("height", "160");
    fireEvent.click(screen.getByText("View chart data"));
    expect(screen.getByRole("table")).toHaveTextContent("0 / 6");
    expect(screen.getByRole("table")).not.toHaveTextContent("February");
    expect(screen.getByRole("table")).not.toHaveTextContent("Upcoming");
    rerender(<ProgressTrendChart language="en" points={points} />);
    expect(container.querySelector("svg[viewBox]")).toHaveAttribute("height", "220");
  });
  it("explains peaks and selected points, and offers an explicit month drilldown", async () => {
    const user = userEvent.setup();
    const onExplore = vi.fn();
    render(<ProgressTrendChart language="en" points={points} onExplore={onExplore} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Recorded azkar completion");
    expect(screen.getByTestId("trend-peak")).toHaveTextContent("January · 50%");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Select month" }));
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await user.click(screen.getByRole("option", { name: "January · So far" }));
    expect(screen.getByRole("status")).toHaveTextContent("January · 50%");
    expect(screen.getByRole("status")).toHaveTextContent("3 / 6 routines recorded");
    expect(screen.getByRole("status")).toHaveTextContent("Morning1 / 2");
    fireEvent.click(screen.getByRole("button", { name: "Explore this month" }));
    expect(onExplore).toHaveBeenCalledWith(points[0]?.dates[0]);
    fireEvent.click(screen.getByText("View chart data"));
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent("JanuarySo far50%3 / 6");
  });
  it("uses real keyboard-operable point buttons with localized labels", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProgressTrendChart language="ar" points={points} />);
    expect(screen.getByRole("combobox")).toHaveAccessibleName("اختر شهرًا");
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    const point = screen.getByRole("button", { name: /January: ٥٠٪/ });
    point.focus();
    await user.keyboard("{Enter}");
    expect(point).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("٥٠٪");
  });
  it("shows discrete monthly columns and resets obsolete selections across periods", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<ProgressTrendChart language="en" points={points} interval="weekly" />);
    expect(screen.getByRole("combobox")).toHaveAccessibleName("Select date range");
    expect(screen.getAllByTestId("trend-column")).toHaveLength(1);
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: /January: 50%/ }));
    rerender(<ProgressTrendChart language="en" points={[]} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText(/Your record begins/)).toBeInTheDocument();
    rerender(<ProgressTrendChart language="en" points={points} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

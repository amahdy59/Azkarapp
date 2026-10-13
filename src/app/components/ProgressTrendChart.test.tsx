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
  it("uses a compact empty plot while preserving exact zero and future records", () => {
    const empty = points.map((point) => ({ ...point, completed: 0, rate: point.rate === null ? null : 0 }));
    const { container, rerender } = render(<ProgressTrendChart language="en" points={empty} />);
    expect(container.querySelector("svg[viewBox]")).toHaveAttribute("height", "160");
    fireEvent.click(screen.getByText("View chart data"));
    expect(screen.getByRole("table")).toHaveTextContent("0 / 6");
    expect(screen.getByRole("table")).toHaveTextContent("Upcoming");
    rerender(<ProgressTrendChart language="en" points={points} />);
    expect(container.querySelector("svg[viewBox]")).toHaveAttribute("height", "220");
  });
  it("provides exact records and neutral future data through themed selection and a table", async () => {
    const user = userEvent.setup();
    const onExplore = vi.fn();
    render(<ProgressTrendChart language="en" points={points} onExplore={onExplore} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Recorded azkar completion");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Explore a period" }));
    await user.click(screen.getByRole("option", { name: "January · So far" }));
    expect(screen.getByRole("status")).toHaveTextContent("50%");
    expect(screen.getByRole("status")).toHaveTextContent("3 / 6 routines recorded");
    fireEvent.click(screen.getByRole("button", { name: "Explore this month" }));
    expect(onExplore).toHaveBeenCalledWith(points[0]?.dates[0]);
    fireEvent.click(screen.getByText("View chart data"));
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("JanuarySo far50%3 / 6");
    expect(rows[2]).toHaveTextContent("FebruaryUpcoming—");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "February" }));
    expect(screen.queryByRole("button", { name: "Explore this month" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Upcoming");
  });
  it("localizes the chart and does not draw a line through future buckets", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProgressTrendChart language="ar" points={points} />);
    expect(screen.getByRole("combobox")).toHaveAccessibleName("استكشف فترة");
    expect(container.querySelectorAll("circle")).toHaveLength(1);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /January/ }));
    expect(screen.getByRole("status")).toHaveTextContent("٥٠٪");
  });
  it("clears obsolete selection when changing periods and offers quiet empty guidance", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ProgressTrendChart language="en" points={points} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /January/ }));
    rerender(<ProgressTrendChart language="en" points={[]} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose a period");
    expect(screen.getByText(/Your record begins/)).toBeInTheDocument();
  });
});

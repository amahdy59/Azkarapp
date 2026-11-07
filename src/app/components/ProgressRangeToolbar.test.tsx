import { chooseProgressOption } from "../../test/progressSelect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressRangeToolbar } from "./ProgressRangeToolbar";
function setup(period: "month" | "custom" = "month") {
  const props = {
    period,
    range: { startKey: "2026-10-01", endKey: "2026-10-31" },
    today: "2026-10-20",
    language: "en" as const,
    calendar: "gregorian" as const,
    onPeriod: vi.fn(),
    onCustom: vi.fn(),
  };
  render(<ProgressRangeToolbar {...props} />);
  return props;
}
async function edit() {
  await chooseProgressOption(screen.getByRole("combobox", { name: "Date range" }), "custom");
  await screen.findByLabelText("Start date");
}
const date = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
describe("ProgressRangeToolbar", () => {
  it("shows one date-range dropdown without local calendar or navigation controls", () => {
    setup();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Today" })).not.toBeInTheDocument();
    expect(screen.queryByText("Show dates in")).not.toBeInTheDocument();
    expect(screen.getByTestId("garden-view-date")).toHaveTextContent("Oct");
  });
  it("applies a preset directly", async () => {
    const props = setup();
    await chooseProgressOption(screen.getByRole("combobox"), "week");
    expect(props.onPeriod).toHaveBeenCalledExactlyOnceWith("week");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("offers Edit dates for an applied custom range without applying a draft", async () => {
    const props = setup("custom");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    const option = await screen.findByRole("option", { name: "Edit dates" });
    expect(option).toHaveAttribute("data-progress-value", "editDates");
    fireEvent.click(option);
    await screen.findByLabelText("Start date");
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-10-01");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onCustom).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
  });
  it("clips the draft end to today without applying it", async () => {
    const props = setup();
    await edit();
    expect(screen.getByLabelText("End date")).toHaveValue("2026-10-20");
    expect(props.onCustom).not.toHaveBeenCalled();
  });
  it("applies one day through equal range boundaries and restores focus", async () => {
    const props = setup();
    await edit();
    date("Start date", "2026-10-03");
    date("End date", "2026-10-03");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(props.onCustom).toHaveBeenCalledExactlyOnceWith({ startKey: "2026-10-03", endKey: "2026-10-03" });
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
  });
  it("rejects reversed dates and preserves the selection", async () => {
    const props = setup();
    await edit();
    date("Start date", "2026-10-09");
    date("End date", "2026-10-02");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("End date");
    expect(props.onCustom).not.toHaveBeenCalled();
  });
  it("rejects future dates", async () => {
    const props = setup();
    await edit();
    date("End date", "2026-10-21");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("future");
    expect(props.onCustom).not.toHaveBeenCalled();
  });
  it("cancels drafts without applying them", async () => {
    const props = setup();
    await edit();
    date("Start date", "2026-10-09");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onCustom).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
  });
  it("rejects missing dates", async () => {
    const props = setup();
    await edit();
    date("Start date", "");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("valid dates");
    expect(props.onCustom).not.toHaveBeenCalled();
  });
});

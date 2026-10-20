import { chooseProgressOption } from "../../test/progressSelect";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgressRangeToolbar } from "./ProgressRangeToolbar";

function setup() {
  const props = {
    period: "month" as const,
    range: { startKey: "2026-10-01", endKey: "2026-10-31" },
    today: "2026-10-20",
    language: "en" as const,
    calendar: "gregorian" as const,
    onPeriod: vi.fn(),
    onCalendar: vi.fn(),
    onCustom: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    nextDisabled: true,
  };
  render(<ProgressRangeToolbar {...props} />);
  return props;
}
const edit = () => chooseProgressOption(screen.getByRole("combobox", { name: "Period" }), "custom");
const setDate = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("ProgressRangeToolbar", () => {
  it("keeps drafts unapplied and clips the default Custom end to today", async () => {
    const props = setup();
    await edit();
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-10-01");
    expect(screen.getByLabelText("End date")).toHaveValue("2026-10-20");
    setDate("Start date", "2026-10-08");
    expect(props.onCustom).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByLabelText("Start date")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveFocus();
    expect(props.onCustom).not.toHaveBeenCalled();
  });
  it("announces reversed and future errors, then applies only valid inclusive dates", async () => {
    const props = setup();
    await edit();
    setDate("Start date", "2026-10-19");
    setDate("End date", "2026-10-18");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("End date must be on or after start date");
    expect(screen.getByLabelText("End date")).toHaveAttribute("aria-invalid", "true");
    setDate("End date", "2026-10-21");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("future days");
    expect(props.onCustom).not.toHaveBeenCalled();
    setDate("End date", "2026-10-20");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(props.onCustom).toHaveBeenCalledExactlyOnceWith({ startKey: "2026-10-19", endKey: "2026-10-20" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Period" })).toHaveFocus();
  });
  it("rejects missing dates and preserves the applied range while editing", async () => {
    const props = setup();
    const before = screen.getByRole("status").textContent;
    await edit();
    setDate("Start date", "");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter two valid dates");
    expect(screen.getByRole("status").textContent).toBe(before);
    expect(props.onCustom).not.toHaveBeenCalled();
  });
  it("keeps navigation and calendar changes explicit with a disabled future action", async () => {
    const props = setup();
    await chooseProgressOption(screen.getByRole("combobox", { name: "Period" }), "week");
    await chooseProgressOption(screen.getByRole("combobox", { name: "Show dates in" }), "hijri");
    fireEvent.click(screen.getByRole("button", { name: "Previous period" }));
    fireEvent.click(screen.getByRole("button", { name: "Next period" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(props.onPeriod).toHaveBeenCalledWith("week");
    expect(props.onCalendar).toHaveBeenCalledWith("hijri");
    expect(props.onPrevious).toHaveBeenCalledOnce();
    expect(props.onToday).toHaveBeenCalledOnce();
    expect(props.onNext).not.toHaveBeenCalled();
  });
  it("allows an applied Custom range to be edited without losing it on cancel", () => {
    const onCustom = vi.fn();
    render(
      <ProgressRangeToolbar
        period="custom"
        range={{ startKey: "2026-10-02", endKey: "2026-10-04" }}
        today="2026-10-20"
        language="ar"
        calendar="hijri"
        onPeriod={vi.fn()}
        onCalendar={vi.fn()}
        onCustom={onCustom}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
        nextDisabled={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "تعديل التواريخ" }));
    expect(screen.getByLabelText("تاريخ البداية")).toHaveValue("2026-10-02");
    expect(screen.getByText(/أدخل التواريخ بالتقويم الميلادي/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "إلغاء" }));
    expect(screen.getByRole("combobox", { name: "الفترة" })).toHaveAttribute("data-progress-value", "custom");
    expect(onCustom).not.toHaveBeenCalled();
  });
});

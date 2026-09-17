import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "complete", label: "Complete" },
  { value: "core", label: "Abbreviated" },
] as const;

function renderControl(overrides: Partial<Parameters<typeof SegmentedControl<"complete" | "core">>[0]> = {}) {
  const onChange = vi.fn();
  render(
    <SegmentedControl
      value="complete"
      onChange={onChange}
      options={OPTIONS}
      direction="ltr"
      aria-label="Routine mode"
      itemClassName={(selected) => (selected ? "selected" : "unselected")}
      {...overrides}
    />,
  );
  return { onChange };
}

describe("SegmentedControl", () => {
  it("exposes radiogroup semantics, not a group of toggle buttons", () => {
    renderControl();

    expect(screen.getByRole("radiogroup", { name: "Routine mode" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks only the selected option as checked", () => {
    renderControl();

    expect(screen.getByRole("radio", { name: "Complete" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Abbreviated" })).toHaveAttribute("aria-checked", "false");
  });

  it("fires onChange with the selected value on click", () => {
    const { onChange } = renderControl();

    fireEvent.click(screen.getByRole("radio", { name: "Abbreviated" }));
    expect(onChange).toHaveBeenCalledWith("core");
  });

  it("marks the selected item's state for the roving-tabindex group", () => {
    // Radix resolves the actual roving tabindex (0 on the checked item) only
    // once focus enters the group under real layout; in jsdom both items stay
    // at -1. Assert the state Radix drives that from here, and cover the real
    // keyboard behavior in e2e/settings-experience.spec.ts instead.
    renderControl();

    expect(screen.getByRole("radio", { name: "Complete" })).toHaveAttribute("data-state", "checked");
    expect(screen.getByRole("radio", { name: "Abbreviated" })).toHaveAttribute("data-state", "unchecked");
  });

  it("applies caller-provided item classes based on selected state", () => {
    renderControl();

    expect(screen.getByRole("radio", { name: "Complete" })).toHaveClass("selected");
    expect(screen.getByRole("radio", { name: "Abbreviated" })).toHaveClass("unselected");
  });

  it("passes through option test ids", () => {
    renderControl({
      options: [
        { value: "complete", label: "Complete", testId: "mode-complete" },
        { value: "core", label: "Abbreviated", testId: "mode-core" },
      ],
    });

    expect(screen.getByTestId("mode-complete")).toBeInTheDocument();
    expect(screen.getByTestId("mode-core")).toBeInTheDocument();
  });
});

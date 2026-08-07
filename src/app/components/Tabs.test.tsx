import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TabList, tabPanelProps } from "./Tabs";

const TABS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "year", label: "Year" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function renderTabs(value: TabValue = "day", direction: "ltr" | "rtl" = "ltr") {
  const onChange = vi.fn();
  render(
    <TabList
      value={value}
      onChange={onChange}
      tabs={TABS}
      direction={direction}
      idPrefix="garden"
      aria-label="View mode"
      itemClassName={(selected) => (selected ? "selected" : "unselected")}
    />,
  );
  return { onChange };
}

describe("TabList", () => {
  it("exposes tablist and tab semantics with the selected state", () => {
    renderTabs();

    expect(screen.getByRole("tablist", { name: "View mode" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "Day" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Week" })).toHaveAttribute("aria-selected", "false");
  });

  it("associates each tab with its panel via aria-controls", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Day" })).toHaveAttribute("aria-controls", "garden-panel-day");
    expect(screen.getByRole("tab", { name: "Week" })).toHaveAttribute("aria-controls", "garden-panel-week");
  });

  it("uses a roving tabindex so the tab list is a single tab stop", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: "Day" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Week" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tab", { name: "Year" })).toHaveAttribute("tabindex", "-1");
  });

  it("activates a tab on click", () => {
    const { onChange } = renderTabs();

    fireEvent.click(screen.getByRole("tab", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("moves to the next tab on ArrowRight in LTR", () => {
    const { onChange } = renderTabs("day", "ltr");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Day" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("reverses arrow direction in RTL", () => {
    const { onChange } = renderTabs("day", "rtl");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Day" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("week");
  });

  it("wraps from the first tab to the last on ArrowLeft in LTR", () => {
    const { onChange } = renderTabs("day", "ltr");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Day" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("year");
  });

  it("jumps to the first and last tabs with Home and End", () => {
    const { onChange } = renderTabs("week");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Week" }), { key: "End" });
    expect(onChange).toHaveBeenCalledWith("year");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Week" }), { key: "Home" });
    expect(onChange).toHaveBeenCalledWith("day");
  });
});

describe("tabPanelProps", () => {
  it("wires the panel back to its owning tab", () => {
    expect(tabPanelProps("garden", "week")).toEqual({
      role: "tabpanel",
      id: "garden-panel-week",
      "aria-labelledby": "garden-tab-week",
      tabIndex: 0,
    });
  });
});

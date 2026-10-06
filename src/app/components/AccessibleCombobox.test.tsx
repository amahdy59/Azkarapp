import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccessibleCombobox } from "./AccessibleCombobox";

const testOptions = [
  { id: 1, label: "Al-Fatihah", secondaryLabel: "1–1", badge: 1 },
  { id: 2, label: "Al-Baqarah", secondaryLabel: "2–286", badge: 2 },
  { id: 18, label: "Al-Kahf", secondaryLabel: "1–110", badge: 18 },
];

describe("AccessibleCombobox", () => {
  it("renders with trigger showing selected option and opens on click", () => {
    const onChange = vi.fn();
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={2} onChange={onChange} />);

    const combobox = screen.getByRole("combobox", { name: /Select Surah/i });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();

    fireEvent.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("filters options via search input", () => {
    const onChange = vi.fn();
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={1} onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByRole("textbox");
    fireEvent.change(searchInput, { target: { value: "kahf" } });

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Al-Kahf")).toBeInTheDocument();
    expect(within(listbox).queryByText("Al-Fatihah")).not.toBeInTheDocument();
    expect(within(listbox).queryByText("Al-Baqarah")).not.toBeInTheDocument();
  });

  it("selects an option on click and calls onChange", () => {
    const onChange = vi.fn();
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={1} onChange={onChange} />);

    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("Al-Kahf"));

    expect(onChange).toHaveBeenCalledWith(18);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape key press", () => {
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={1} onChange={vi.fn()} />);

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(combobox, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("announces the active option through the search field and preserves text editing keys", () => {
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={1} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByRole("textbox");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    const active = search.getAttribute("aria-activedescendant");
    expect(active).toBe(screen.getAllByRole("option")[0]!.id);
    fireEvent.keyDown(search, { key: "End" });
    expect(search).toHaveAttribute("aria-activedescendant", active);
    fireEvent.change(search, { target: { value: "kahf" } });
    fireEvent.click(screen.getByRole("button", { name: "مسح" }));
    expect(search).not.toHaveAttribute("aria-activedescendant");
    expect(search).toHaveFocus();
  });

  it("selects an option once and closes when keyboard focus leaves the popup", () => {
    const onChange = vi.fn();
    render(<AccessibleCombobox label="Select Surah" options={testOptions} value={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.keyDown(screen.getAllByRole("option")[1]!, { key: "Enter" });
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2);
    expect(screen.getByRole("combobox")).toHaveFocus();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Tab" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

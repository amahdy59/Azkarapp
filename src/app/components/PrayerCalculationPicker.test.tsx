import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrayerCalculationPicker } from "./PrayerCalculationPicker";

const originalWidth = window.innerWidth;
const options = [
  { id: 5, label: "Egyptian General Authority of Survey", shortLabel: "Egyptian authority" },
  { id: 4, label: "Umm Al-Qura University, Makkah", shortLabel: "Umm Al-Qura" },
];
beforeEach(() => {
  // JSDOM does not load CSS. Supply the browser's no-animation default so
  // Radix Presence releases the closed scope without a nonexistent CSS event.
  const computedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = computedStyle(element, pseudo);
    Object.defineProperty(style, "animationName", { configurable: true, value: "none" });
    return style;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
});

describe("PrayerCalculationPicker", () => {
  it("offers complete names, immediately applies one choice and restores its mobile opener", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    const changed = vi.fn();
    function Fixture() {
      const [value, setValue] = useState(5);
      return (
        <PrayerCalculationPicker
          language="en"
          options={options}
          value={value}
          onChange={(next) => {
            setValue(next);
            changed(next);
          }}
        />
      );
    }
    render(<Fixture />);
    const trigger = screen.getByRole("button", { name: /Prayer calculation method Egyptian authority/ });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-dropdown-surface");
    expect(screen.getByRole("radio", { name: options[0].label })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: options[1].label }));
    expect(changed).toHaveBeenCalledExactlyOnceWith(4);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent("Umm Al-Qura");
    expect(screen.getByText(options[1].label)).toBeVisible();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("radio", { name: options[1].label }));
    expect(changed).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes without changing the method", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    const changed = vi.fn();
    render(<PrayerCalculationPicker language="en" options={options} value={5} onChange={changed} />);
    fireEvent.click(screen.getByRole("button", { name: /Prayer calculation method Egyptian authority/ }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(changed).not.toHaveBeenCalled();
  });
});

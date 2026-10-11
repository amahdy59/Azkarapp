import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrayerSettingsPanel } from "./PrayerSettingsPanel";

describe("PrayerSettingsPanel", () => {
  it("keeps calculation and reminders as distinct destinations beneath one category", () => {
    const onNav = vi.fn();
    render(<PrayerSettingsPanel language="en" cityName="Cairo" onNav={onNav} onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("settings-sub-location"));
    fireEvent.click(screen.getByTestId("settings-sub-notifications"));
    expect(onNav.mock.calls).toEqual([["location"], ["notifications"]]);
    expect(screen.getByText("Cairo")).toBeInTheDocument();
  });
});

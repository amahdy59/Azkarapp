import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { PrayerLocationPanel } from "./PrayerLocationPanel";
import * as calculation from "../../content/prayerCalculation";
import { useState } from "react";
import type { LocationSettings } from "../../types";
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("PrayerLocationPanel", () => {
  it("shows the saved country's name once in the location summary", () => {
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const summary = screen.getByTestId("prayer-location-name").closest("section")!;
    expect(within(summary).getByText("Cairo, Egypt")).toBeVisible();
    expect(summary.textContent?.match(/Egypt/g)).toHaveLength(1);
  });

  it("keeps custom saved coordinates and timezone without exposing manual entry", () => {
    const changed = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={{
          ...DEFAULT_APP_STATE.settings.location!,
          cityName: "My village",
          latitude: -43.9,
          longitude: -176.5,
          timeZone: "Pacific/Chatham",
        }}
        onLocationChange={changed}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("More settings"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Time zone" })).toHaveTextContent("Pacific/Chatham");
    expect(screen.getByTestId("prayer-location-name")).toHaveTextContent("My village");
    expect(changed).not.toHaveBeenCalled();
  });

  it("lets readers browse every available city without typing or requesting GPS", () => {
    const changed = vi.fn();
    const detect = vi.spyOn(calculation, "detectUserCoordinates");
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={changed}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: /Sydney.*Australia/ }));
    expect(changed).toHaveBeenCalledWith(
      expect.objectContaining({
        cityName: "Sydney",
        timeZone: "Australia/Sydney",
        autoDetect: false,
      }),
    );
    expect(detect).not.toHaveBeenCalled();
  });

  it("selects a timezone without changing precise coordinates or letting pending GPS overwrite it", async () => {
    let finish!: (result: Awaited<ReturnType<typeof calculation.detectUserCoordinates>>) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const changed = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={changed}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    fireEvent.click(screen.getByText("More settings"));
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Time zone" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("option", { name: /London.*United Kingdom/ }));
    await act(async () => finish({ ok: true, latitude: 24.5, longitude: 46.6, timeZone: "Asia/Riyadh" }));
    expect(changed).toHaveBeenCalledExactlyOnceWith({
      ...DEFAULT_APP_STATE.settings.location,
      timeZone: "Europe/London",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Time zone updated.");
    expect(screen.queryByRole("dialog", { name: "Location update" })).not.toBeInTheDocument();
  });

  it("applies and resets minute choices while preserving all saved location settings", () => {
    const changed = vi.fn();
    function Fixture() {
      const [location, setLocation] = useState<LocationSettings>({
        ...DEFAULT_APP_STATE.settings.location!,
        adjustments: { fajr: 3, isha: -2 },
      });
      return (
        <PrayerLocationPanel
          language="en"
          locationSettings={location}
          onLocationChange={(next) => {
            changed(next);
            setLocation(next);
          }}
          onBack={vi.fn()}
        />
      );
    }
    render(<Fixture />);
    fireEvent.click(screen.getByText("More settings"));
    fireEvent.click(screen.getByRole("button", { name: "Move Fajr one minute later" }));
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...DEFAULT_APP_STATE.settings.location,
        adjustments: { fajr: 4, isha: -2 },
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Fajr adjustment: +4 min.");
    fireEvent.click(screen.getByRole("button", { name: "Move Fajr one minute earlier" }));
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ adjustments: { fajr: 3, isha: -2 } }));
    fireEvent.click(screen.getByRole("button", { name: "Reset adjustments" }));
    expect(changed).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ...DEFAULT_APP_STATE.settings.location,
        adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      }),
    );
    expect(screen.getByRole("button", { name: "Reset adjustments" })).toBeDisabled();
  });

  it("labels a successful GPS fix honestly and keeps the selected method and adjustments", async () => {
    vi.spyOn(calculation, "detectUserCoordinates").mockResolvedValue({
      ok: true,
      latitude: 24.5,
      longitude: 46.6,
      timeZone: "Asia/Riyadh",
    });
    const changed = vi.fn();
    function Fixture() {
      const [location, setLocation] = useState<LocationSettings>({
        ...DEFAULT_APP_STATE.settings.location!,
        calculationMethod: 4,
        adjustments: { fajr: 3 },
      });
      return (
        <PrayerLocationPanel
          language="en"
          locationSettings={location}
          onLocationChange={(next) => {
            changed(next);
            setLocation(next);
          }}
          onBack={vi.fn()}
        />
      );
    }
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    const notice = await screen.findByRole("dialog", { name: "Location update" });
    expect(notice).toHaveTextContent("Location and time zone updated successfully.");
    expect(notice).toHaveTextContent("Near Riyadh, Saudi Arabia");
    expect(changed).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 24.5,
        longitude: 46.6,
        timeZone: "Asia/Riyadh",
        autoDetect: true,
        calculationMethod: 4,
        adjustments: { fajr: 3 },
      }),
    );
    expect(screen.getByTestId("prayer-location-name")).toHaveTextContent("Near Riyadh, Saudi Arabia");
    expect(screen.getByTestId("prayer-location-name")).not.toHaveTextContent("24.50");
  });

  it("keeps timezone work stable during city search and refreshes it on a new foreground date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 12));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const status = vi.spyOn(calculation, "getTimeZoneStatus");
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByTestId("prayer-more-settings")).toHaveTextContent("UTC+02:00");
    const samples = status.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "London" } });
    expect(status).toHaveBeenCalledTimes(samples);
    vi.setSystemTime(new Date(2026, 6, 29, 12));
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(screen.getByTestId("prayer-more-settings")).toHaveTextContent("UTC+03:00");
    expect(status).toHaveBeenCalledTimes(samples + 1);
  });

  it("keeps saved location on denied detection and presents recovery without an in-flow banner", async () => {
    vi.spyOn(calculation, "detectUserCoordinates").mockResolvedValue({ ok: false, reason: "denied" });
    const change = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={change}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    const notice = await screen.findByRole("dialog", { name: "Location update" });
    expect(notice).toHaveTextContent("Location access is blocked");
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByTestId("prayer-location-scroll")).not.toHaveTextContent("Location access is blocked");
    fireEvent.click(within(notice).getByText("Close", { selector: "button" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores a GPS result after the panel unmounts", async () => {
    let finish!: (result: Awaited<ReturnType<typeof calculation.detectUserCoordinates>>) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const change = vi.fn();
    const { unmount } = render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={change}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    unmount();
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(change).not.toHaveBeenCalled();
  });

  it("does not interrupt an open city picker with a late GPS result", async () => {
    let finish!: (result: Awaited<ReturnType<typeof calculation.detectUserCoordinates>>) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const change = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={change}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Choose a city" })).toBeVisible();
    expect(screen.queryByRole("dialog", { name: "Location update" })).not.toBeInTheDocument();
  });

  it("does not let a late GPS result overwrite a newer minute adjustment", async () => {
    let finish!: (result: Awaited<ReturnType<typeof calculation.detectUserCoordinates>>) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    fireEvent.click(screen.getByText("More settings"));
    fireEvent.click(screen.getByRole("button", { name: "Move Fajr one minute later" }));
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({ adjustments: expect.objectContaining({ fajr: 1 }) }),
    );
    expect(screen.getByRole("button", { name: "Use my current location" })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent("Fajr adjustment: +1 min.");
  });
  it("does not allow late GPS detection to overwrite a selected city", async () => {
    let finish!: (result: Awaited<ReturnType<typeof calculation.detectUserCoordinates>>) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Find a city (optional)" }), {
      target: { value: "London" },
    });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/ }));
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("button", { name: "Use my current location" })).toBeEnabled();
  });
  it("selects and saves a built-in city without requesting GPS", () => {
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Find a city (optional)" }), {
      target: { value: "London" },
    });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/i }));

    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cityName: "London",
        latitude: 51.5074,
        longitude: -0.1278,
        timeZone: "Europe/London",
        autoDetect: false,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("London selected and saved.");
  });

  it("keeps the persisted city label stable when selecting from Arabic UI", () => {
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="ar"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "اختيار مدينة أخرى" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "العثور على مدينة (اختياري)" }), {
      target: { value: "لندن" },
    });
    fireEvent.click(screen.getByRole("button", { name: /لندن.*المملكة المتحدة/ }));

    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("status")).toHaveTextContent("تم اختيار لندن وحفظها.");
  });
});

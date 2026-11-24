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
    expect(screen.getByTestId("prayer-location-name")).toHaveTextContent("Device location");
    expect(screen.getByTestId("prayer-location-name")).not.toHaveTextContent("Riyadh");
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
    expect(screen.getByTestId("daylight-saving-status")).toHaveTextContent("UTC+02:00");
    const samples = status.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Choose another city" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "London" } });
    expect(status).toHaveBeenCalledTimes(samples);
    vi.setSystemTime(new Date(2026, 6, 29, 12));
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(screen.getByTestId("daylight-saving-status")).toHaveTextContent("UTC+03:00");
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

  it("rejects blank coordinates instead of saving them as zero", () => {
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Advanced adjustments"));
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Longitude"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save location$/i }));
    expect(onLocationChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Latitude")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Longitude")).toHaveAttribute("aria-invalid", "true");
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
    fireEvent.click(screen.getByText("Advanced adjustments"));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Fajr" }), { target: { value: "5" } });
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({ adjustments: expect.objectContaining({ fajr: 5 }) }),
    );
    expect(screen.getByRole("button", { name: "Use my current location" })).toBeEnabled();
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
    fireEvent.change(screen.getByRole("searchbox", { name: "Search cities and countries" }), {
      target: { value: "London" },
    });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/ }));
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("button", { name: "Use my current location" })).toBeEnabled();
  });
  it("keeps the prior location when manual coordinates are invalid", () => {
    const onLocationChange = vi.fn();
    render(
      <PrayerLocationPanel
        language="en"
        locationSettings={DEFAULT_APP_STATE.settings.location}
        onLocationChange={onLocationChange}
        onBack={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "91" } });
    fireEvent.click(screen.getByRole("button", { name: /^Save location$/i }));
    expect(onLocationChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Latitude")).toHaveAttribute("aria-invalid", "true");
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
    fireEvent.change(screen.getByRole("searchbox", { name: "Search cities and countries" }), {
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
    expect(screen.getByLabelText("IANA time zone")).toHaveValue("Europe/London");
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
    fireEvent.change(screen.getByRole("searchbox", { name: "البحث في المدن والدول" }), {
      target: { value: "لندن" },
    });
    fireEvent.click(screen.getByRole("button", { name: /لندن.*المملكة المتحدة/ }));

    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("status")).toHaveTextContent("تم اختيار لندن وحفظها.");
  });
});

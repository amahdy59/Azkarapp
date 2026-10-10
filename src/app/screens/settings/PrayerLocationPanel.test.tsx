import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../../state";
import { PrayerLocationPanel } from "./PrayerLocationPanel";
import * as calculation from "../../content/prayerCalculation";
afterEach(() => vi.restoreAllMocks());
describe("PrayerLocationPanel", () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Detect My Location" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Fajr" }), { target: { value: "5" } });
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(
      expect.objectContaining({ adjustments: expect.objectContaining({ fajr: 5 }) }),
    );
    expect(screen.getByRole("button", { name: "Detect My Location" })).toBeEnabled();
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
    fireEvent.click(screen.getByRole("button", { name: "Detect My Location" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search cities and countries" }), {
      target: { value: "London" },
    });
    fireEvent.click(screen.getByRole("button", { name: /London.*United Kingdom/ }));
    await act(async () => finish({ ok: true, latitude: 30, longitude: 31, timeZone: "Africa/Cairo" }));
    expect(onLocationChange).toHaveBeenCalledOnce();
    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("button", { name: "Detect My Location" })).toBeEnabled();
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

    fireEvent.change(screen.getByRole("searchbox", { name: "البحث في المدن والدول" }), {
      target: { value: "لندن" },
    });
    fireEvent.click(screen.getByRole("button", { name: /لندن.*المملكة المتحدة/ }));

    expect(onLocationChange).toHaveBeenCalledWith(expect.objectContaining({ cityName: "London" }));
    expect(screen.getByRole("status")).toHaveTextContent("تم اختيار لندن وحفظها.");
  });
});

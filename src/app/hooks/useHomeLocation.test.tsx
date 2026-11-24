import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as calculation from "../content/prayerCalculation";
import { useHomeLocation } from "./useHomeLocation";

describe("Home location updates", () => {
  afterEach(() => vi.restoreAllMocks());
  const location = { ...calculation.DEFAULT_LOCATION, calculationMethod: 3, adjustments: { asr: 4 } };
  it("saves fresh coordinates through the callback while preserving calculation preferences and removing the old city", async () => {
    const detect = vi
      .spyOn(calculation, "detectUserCoordinates")
      .mockResolvedValue({ ok: true, latitude: 51.5, longitude: -0.12, timeZone: "Europe/London" });
    const onChange = vi.fn();
    const { result } = renderHook(() => useHomeLocation("en", location, onChange));
    await act(() => result.current.refresh());
    expect(detect).toHaveBeenCalledWith({ maximumAge: 0 });
    expect(onChange).toHaveBeenCalledWith({
      ...location,
      latitude: 51.5,
      longitude: -0.12,
      cityName: "51.50°, -0.12°",
      timeZone: "Europe/London",
      autoDetect: true,
    });
    expect(result.current.message).toBeTruthy();
    expect(result.current.locating).toBe(false);
  });
  it("retains the saved location on denial and announces recovery", async () => {
    vi.spyOn(calculation, "detectUserCoordinates").mockResolvedValue({ ok: false, reason: "denied" });
    const onChange = vi.fn();
    const { result } = renderHook(() => useHomeLocation("en", location, onChange));
    await act(() => result.current.refresh());
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.message).toMatch(/blocked.*settings.*try again/i);
    expect(result.current.locating).toBe(false);
  });
  it("rejects rapid duplicate requests and a late result after a newer location choice", async () => {
    let finish!: (value: calculation.CoordinateDetectionResult) => void;
    const detect = vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ selected }) => useHomeLocation("en", selected, onChange), {
      initialProps: { selected: location },
    });
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.refresh();
      void result.current.refresh();
    });
    expect(detect).toHaveBeenCalledOnce();
    expect(result.current.locating).toBe(true);
    rerender({ selected: { ...location, cityName: "Manual choice" } });
    await act(async () => {
      finish({ ok: true, latitude: 10, longitude: 20 });
      await pending;
    });
    expect(onChange).not.toHaveBeenCalled();
  });
  it("ignores detection after leaving Home", async () => {
    let finish!: (value: calculation.CoordinateDetectionResult) => void;
    vi.spyOn(calculation, "detectUserCoordinates").mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const onChange = vi.fn();
    const { result, unmount } = renderHook(() => useHomeLocation("en", location, onChange));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.refresh();
    });
    unmount();
    await act(async () => {
      finish({ ok: true, latitude: 10, longitude: 20 });
      await pending;
    });
    expect(onChange).not.toHaveBeenCalled();
  });
  it("recovers from a thrown provider failure and can dismiss its message", async () => {
    vi.spyOn(calculation, "detectUserCoordinates").mockRejectedValue(new Error("provider unavailable"));
    const onChange = vi.fn();
    const { result } = renderHook(() => useHomeLocation("en", location, onChange));
    await act(() => result.current.refresh());
    expect(result.current.locating).toBe(false);
    expect(result.current.message).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.dismiss());
    expect(result.current.message).toBeNull();
  });
});

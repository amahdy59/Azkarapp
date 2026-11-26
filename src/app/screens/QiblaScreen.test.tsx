import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getMagneticDeclination } from "../content/geomagnetic";
import * as locationService from "../content/prayerCalculation";
import { headingFromOrientation, QiblaScreen } from "./QiblaScreen";

function orientationEvent(values: Partial<DeviceOrientationEvent> & { webkitCompassHeading?: number }) {
  return values as DeviceOrientationEvent & { webkitCompassHeading?: number };
}

describe("headingFromOrientation", () => {
  it("accepts the iOS WebKit compass heading", () => {
    expect(headingFromOrientation(orientationEvent({ alpha: 15, absolute: false, webkitCompassHeading: 42 }))).toBe(42);
    expect(
      headingFromOrientation(orientationEvent({ alpha: 15, absolute: false, webkitCompassHeading: -1 })),
    ).toBeNull();
  });

  it("accepts Android absolute headings from either absolute event path", () => {
    expect(headingFromOrientation(orientationEvent({ alpha: 90, beta: 0, gamma: 0, absolute: true }))).toBe(270);
    expect(headingFromOrientation(orientationEvent({ alpha: 90, beta: 0, gamma: 0 }), true)).toBe(270);
  });

  it("rejects relative orientation so it cannot override a real compass heading", () => {
    expect(headingFromOrientation(orientationEvent({ alpha: 90, beta: 0, gamma: 0, absolute: false }))).toBeNull();
  });
});

describe("QiblaScreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows location results in a dismissible modal and does not reuse an old warning after failure", async () => {
    vi.spyOn(locationService, "detectUserCoordinates")
      .mockResolvedValueOnce({ ok: true, latitude: 30.0444, longitude: 31.2357, accuracy: 1200 })
      .mockResolvedValueOnce({ ok: false, reason: "denied" });
    const user = userEvent.setup();
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "Cairo",
          calculationMethod: 5,
          autoDetect: false,
        }}
        reduceMotion
        onBack={() => undefined}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Use my location" }));
    expect(await screen.findByRole("dialog", { name: "Location update" })).toBeVisible();
    expect(screen.getByTestId("qibla-location-warning")).toHaveTextContent("1200 m");
    expect(screen.getByTestId("qibla-location-warning").closest(".qibla-main")).toBeNull();
    await user.click(
      screen
        .getByTestId("qibla-location-notice")
        .querySelector<HTMLButtonElement>('[data-testid="modal-close-button"]')!,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const refresh = screen.getByRole("button", { name: "Refresh: Use current location" });
    expect(refresh).toHaveFocus();
    await user.click(refresh);
    expect(await screen.findByRole("dialog", { name: "Location update" })).toBeVisible();
    expect(screen.getByText(/Location access was denied/)).toBeVisible();
    expect(screen.queryByTestId("qibla-location-warning")).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(refresh).toHaveFocus();
  });

  it("shows the offline bearing and a progressive live-compass control", () => {
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "Cairo",
          calculationMethod: 5,
          autoDetect: false,
        }}
        reduceMotion={false}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Qibla", level: 1 })).toBeVisible();
    expect(screen.getByRole("heading", { name: /Qibla is 136° from north/ })).toBeVisible();
    expect(screen.getByText("Cairo")).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry compass", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Visual direction to the Kaaba at 136 degrees/ })).toBeVisible();
    expect(screen.getByText("Live compass unavailable")).toBeVisible();
    expect(screen.getByTestId("kaaba-target")).toBeInTheDocument();
    expect(screen.getByTestId("compass-rose")).toHaveAttribute("transform", "rotate(0 160 160)");
    expect(screen.getByRole("heading", { name: "Qibla" }).closest(".app-screen-surface")).toHaveClass(
      "overflow-y-auto",
    );
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Static view — does not track your phone")).toBeVisible();
  });

  it("turns the saved bearing into practical fine-pointer desktop guidance", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "Cairo",
          calculationMethod: 5,
          autoDetect: false,
        }}
        reduceMotion
        onBack={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Use the bearing on a larger screen" })).toBeVisible();
    expect(screen.getByText("Turn clockwise to 136°.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Enable live compass" })).not.toBeInTheDocument();
  });

  it("explains the static fallback when a live compass is unavailable", async () => {
    const user = userEvent.setup();
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{ latitude: 30, longitude: 31, calculationMethod: 5, autoDetect: false }}
        reduceMotion
        onBack={() => undefined}
      />,
    );

    expect(screen.getByText("Live compass unavailable")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Details" }));
    expect(await screen.findByText(/supported device and a secure connection/)).toBeVisible();
  });

  it("requests absolute sensor permission from the live-compass action", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    class MockDeviceOrientationEvent extends Event {
      static requestPermission = requestPermission;
    }
    vi.stubGlobal("DeviceOrientationEvent", MockDeviceOrientationEvent);
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    const user = userEvent.setup();
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{ latitude: 30.0444, longitude: 31.2357, calculationMethod: 5, autoDetect: false }}
        reduceMotion={false}
        onBack={() => undefined}
      />,
    );

    expect(requestPermission).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Allow compass access" }));
    expect(requestPermission).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("button", { name: "Allow compass access" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Stop live compass" })).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: /Waiting for an absolute compass heading/ })).toBeVisible();
  });

  it("falls back to Safari's legacy no-argument orientation permission", async () => {
    const requestPermission = vi
      .fn<(absolute?: boolean) => Promise<"granted" | "denied">>()
      .mockRejectedValueOnce(new TypeError("absolute permission is unsupported"))
      .mockResolvedValueOnce("granted");
    class MockDeviceOrientationEvent extends Event {
      static requestPermission = requestPermission;
    }
    vi.stubGlobal("DeviceOrientationEvent", MockDeviceOrientationEvent);
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    const user = userEvent.setup();
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{ latitude: 30.0444, longitude: 31.2357, calculationMethod: 5, autoDetect: false }}
        reduceMotion={false}
        onBack={() => undefined}
      />,
    );

    expect(requestPermission).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Allow compass access" }));

    expect(requestPermission).toHaveBeenNthCalledWith(1, true);
    expect(requestPermission).toHaveBeenNthCalledWith(2);
    expect(screen.queryByRole("button", { name: "Allow compass access" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Stop live compass" })).not.toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(
        Object.assign(new Event("deviceorientation"), {
          alpha: 260,
          beta: 0,
          gamma: 0,
          absolute: false,
          webkitCompassHeading: 100,
        }),
      );
    });
    const correction = getMagneticDeclination(30.0444, 31.2357, new Date())!;
    const turn = 136.14095496068893 - 100 - correction;
    expect(screen.getByRole("heading", { name: `Turn ${Math.round(turn)}° right` })).toBeVisible();
    expect(
      Number(
        screen
          .getByTestId("compass-rose")
          .getAttribute("transform")!
          .match(/rotate\(([^ ]+)/)![1],
      ),
    ).toBeCloseTo(260 - correction, 2);
    expect(
      Number(
        screen
          .getByTestId("qibla-arrow")
          .getAttribute("transform")!
          .match(/rotate\(([^ ]+)/)![1],
      ),
    ).toBeCloseTo(turn, 2);
    expect(screen.getByTestId("kaaba-target")).toHaveAttribute("transform", expect.stringMatching(/^rotate\(-/));
    // Live angles are already smoothed by the domain helper. CSS must not
    // interpolate a second time, especially when the shortest turn flips sign.
    for (const heading of [315, 319, 359, 1]) {
      await act(async () => {
        window.dispatchEvent(Object.assign(new Event("deviceorientation"), { webkitCompassHeading: heading }));
      });
      expect(screen.getByTestId("qibla-arrow").style.transition).toBe("");
      expect(screen.getByTestId("kaaba-target").style.transition).toBe("");
    }
  });

  it("keeps the compass off and gives recovery guidance when absolute access is denied", async () => {
    const requestPermission = vi.fn().mockResolvedValue("denied");
    class MockDeviceOrientationEvent extends Event {
      static requestPermission = requestPermission;
    }
    vi.stubGlobal("DeviceOrientationEvent", MockDeviceOrientationEvent);
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    const user = userEvent.setup();
    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{ latitude: 30.0444, longitude: 31.2357, calculationMethod: 5, autoDetect: false }}
        reduceMotion
        onBack={() => undefined}
      />,
    );

    expect(requestPermission).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Allow compass access" }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Sensor access blocked")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText(/Settings → Site settings → Motion sensors/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry compass", hidden: true })).toBeInTheDocument();
    expect(screen.getByTestId("qibla-arrow")).toHaveAttribute("transform", expect.stringMatching(/^rotate\(136\./));
  });

  it("confirms a stable alignment once and respects the haptic setting", async () => {
    vi.useFakeTimers();
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate });
    class MockDeviceOrientationEvent extends Event {}
    vi.stubGlobal("DeviceOrientationEvent", MockDeviceOrientationEvent);
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });

    render(
      <QiblaScreen
        language="en"
        direction="ltr"
        locationSettings={{ latitude: 30.0444, longitude: 31.2357, calculationMethod: 5, autoDetect: false }}
        reduceMotion={false}
        hapticFeedback
        onBack={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Enable live compass" })).not.toBeInTheDocument();
    await act(async () => {
      window.dispatchEvent(
        Object.assign(new Event("deviceorientation"), {
          alpha: 0,
          beta: 0,
          gamma: 0,
          absolute: false,
          webkitCompassHeading: 136.14095496068893 - getMagneticDeclination(30.0444, 31.2357, new Date())!,
          webkitCompassAccuracy: 2,
        }),
      );
    });
    await act(async () => vi.advanceTimersByTime(350));

    expect(screen.getByRole("heading", { name: "You are facing the Qibla" })).toBeVisible();
    expect(vibrate).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

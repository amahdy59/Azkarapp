import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    expect(screen.getByRole("button", { name: "Enable live compass" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/Static bearing/)).not.toBeVisible();
    expect(screen.getByTestId("compass-rose")).toHaveAttribute("transform", "rotate(0 160 160)");
    expect(screen.getByRole("heading", { name: "Qibla" }).closest(".app-screen-surface")).toHaveClass(
      "overflow-y-auto",
    );
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

    await user.click(screen.getByText("Live compass", { selector: "summary" }));
    await user.click(screen.getByRole("button", { name: "Enable live compass" }));
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

    const control = screen.getByRole("button", { name: "Enable live compass" });
    await user.click(screen.getByText("Live compass", { selector: "summary" }));
    await user.click(control);
    expect(requestPermission).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Stop live compass" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Waiting for an absolute compass heading/)).toBeVisible();
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

    await user.click(screen.getByText("Live compass", { selector: "summary" }));
    await user.click(screen.getByRole("button", { name: "Enable live compass" }));

    expect(requestPermission).toHaveBeenNthCalledWith(1, true);
    expect(requestPermission).toHaveBeenNthCalledWith(2);
    expect(screen.getByRole("button", { name: "Stop live compass" })).toHaveAttribute("aria-pressed", "true");

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
    expect(screen.getByRole("heading", { name: "Turn 36° right" })).toBeVisible();
    expect(screen.getByTestId("compass-rose")).toHaveAttribute("transform", "rotate(260 160 160)");
    expect(screen.getByTestId("qibla-arrow")).toHaveAttribute("transform", expect.stringMatching(/^rotate\(36\./));
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

    await user.click(screen.getByText("Live compass", { selector: "summary" }));
    await user.click(screen.getByRole("button", { name: "Enable live compass" }));
    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Settings → Site settings → Motion sensors/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Enable live compass" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("qibla-arrow")).toHaveAttribute("transform", expect.stringMatching(/^rotate\(136\./));
  });
});

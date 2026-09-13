import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QiblaScreen } from "./QiblaScreen";

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
    await user.click(control);
    expect(requestPermission).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Stop live compass" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Waiting for an absolute compass heading/)).toBeVisible();
  });
});

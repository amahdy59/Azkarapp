import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { vibrateIfEnabled } from "../motionPreferences";
import { triggerNativeHaptics } from "./haptics";
import * as platform from "./platform";

const mockHaptics = vi.hoisted(() => ({
  tap: vi.fn(),
  vibrate: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  registerPlugin: () => mockHaptics,
}));

beforeEach(() => {
  vi.resetAllMocks();
  mockHaptics.tap.mockResolvedValue(undefined);
  mockHaptics.vibrate.mockResolvedValue(undefined);
  mockHaptics.cancel.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("native haptics bridge", () => {
  it("does nothing when not on native Android", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(false);
    triggerNativeHaptics(8);
    expect(mockHaptics.tap).not.toHaveBeenCalled();
    expect(mockHaptics.vibrate).not.toHaveBeenCalled();
  });

  it("calls tap for short durations on native Android", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    triggerNativeHaptics(10);
    expect(mockHaptics.tap).toHaveBeenCalledOnce();
  });

  it("calls vibrate with pattern for array patterns on native Android", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    triggerNativeHaptics([30, 50, 30]);
    expect(mockHaptics.vibrate).toHaveBeenCalledWith({ pattern: [30, 50, 30] });
  });

  it("calls vibrate with duration for long patterns on native Android", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    triggerNativeHaptics(50);
    expect(mockHaptics.vibrate).toHaveBeenCalledWith({ duration: 50 });
  });

  it("safely catches rejection without throwing", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    mockHaptics.tap.mockRejectedValueOnce(new Error("hardware failed"));
    expect(() => triggerNativeHaptics(8)).not.toThrow();
  });

  it.each([0, [], [0, 0]])("cancels instead of generating a tap for %j", (pattern) => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    expect(triggerNativeHaptics(pattern)).toBe(true);
    expect(mockHaptics.cancel).toHaveBeenCalledOnce();
    expect(mockHaptics.tap).not.toHaveBeenCalled();
  });

  it("dispatches native feedback once without invoking the browser, even on rejection", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    const browserVibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate: browserVibrate });
    mockHaptics.tap.mockRejectedValueOnce(new Error("unavailable"));
    vibrateIfEnabled(true, 8);
    expect(mockHaptics.tap).toHaveBeenCalledOnce();
    expect(browserVibrate).not.toHaveBeenCalled();
  });

  it("retains browser vibration outside Android and honors the app setting", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(false);
    const browserVibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate: browserVibrate });
    vibrateIfEnabled(true, [30, 50, 30]);
    expect(browserVibrate).toHaveBeenCalledWith([30, 50, 30]);
    browserVibrate.mockClear();
    vibrateIfEnabled(false, 8);
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    vibrateIfEnabled(false, 8);
    expect(browserVibrate).not.toHaveBeenCalled();
    expect(mockHaptics.tap).not.toHaveBeenCalled();
  });
});

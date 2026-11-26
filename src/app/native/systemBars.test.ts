import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyAppAppearance } from "../theme";
import { applyNativeSystemBars } from "./systemBars";
import * as platform from "./platform";

const bridge = vi.hoisted(() => ({ setBackground: vi.fn() }));
vi.mock("@capacitor/core", () => ({ registerPlugin: () => bridge }));

beforeEach(() => {
  vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
  bridge.setBackground.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("style");
  document.documentElement.className = "";
});

describe("native system bar appearance", () => {
  it.each([
    ["light", false, "#F8F5F0"],
    ["midnight", false, "#0A1228"],
    ["dark", false, "#0D0D0D"],
    ["light", true, "#02050D"],
  ] as const)("sends the %s appearance with high contrast %s", async (themeMode, highContrast, color) => {
    applyAppAppearance({ themeMode, highContrast });
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenLastCalledWith({ color }));
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", color);
  });

  it("uses the resolved CSS ground for paper and Glass rather than the selected theme name", async () => {
    const root = document.documentElement;
    root.style.setProperty("--system-bar-background", "#f2f0eb");
    applyAppAppearance({ themeMode: "light", paperTexture: true });
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenLastCalledWith({ color: "#f2f0eb" }));
    root.style.setProperty("--system-bar-background", "#020617");
    applyAppAppearance({ themeMode: "light", appMaterial: "glass" });
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenLastCalledWith({ color: "#020617" }));
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute("content", "#020617");
  });

  it("updates the bars when the reader switches themes repeatedly", async () => {
    for (const themeMode of ["light", "dark", "light"] as const) applyAppAppearance({ themeMode });
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenCalledTimes(3));
    expect(bridge.setBackground.mock.calls).toEqual([
      [{ color: "#F8F5F0" }],
      [{ color: "#0D0D0D" }],
      [{ color: "#F8F5F0" }],
    ]);
  });

  it("does not call the native bridge in a browser", () => {
    vi.mocked(platform.isNativeAndroid).mockReturnValue(false);
    applyAppAppearance({ themeMode: "light" });
    expect(bridge.setBackground).not.toHaveBeenCalled();
  });

  it("keeps reading appearance available with an older binary or rejected bridge", async () => {
    bridge.setBackground.mockRejectedValueOnce(new Error("plugin unavailable"));
    expect(() => applyAppAppearance({ themeMode: "light" })).not.toThrow();
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenCalledOnce());
    expect(document.documentElement).toHaveClass("theme-light");
    bridge.setBackground.mockImplementationOnce(() => {
      throw new Error("bridge unavailable");
    });
    expect(() => applyNativeSystemBars("#F8F5F0")).not.toThrow();
    await vi.waitFor(() => expect(bridge.setBackground).toHaveBeenCalledTimes(2));
  });
});

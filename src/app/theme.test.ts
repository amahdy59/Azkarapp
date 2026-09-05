import { afterEach, describe, expect, it } from "vitest";
import { applyAppAppearance } from "./theme";

describe("app appearance", () => {
  afterEach(() => {
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-color-blind-support");
  });

  it.each([
    ["midnight", "dark"],
    ["light", "light"],
    ["dark", "dark"],
  ] as const)("applies only the %s product theme", (themeMode, colorScheme) => {
    applyAppAppearance({ themeMode });

    expect(document.documentElement).toHaveClass(`theme-${themeMode}`);
    expect(document.documentElement.className.match(/theme-(midnight|light|dark)/g)).toHaveLength(1);
    expect(document.documentElement.style.colorScheme).toBe(colorScheme);
  });

  it("applies and clears reduce transparency independently of the theme", () => {
    applyAppAppearance({ themeMode: "midnight", reduceTransparency: true, language: "en", textSize: "medium" });
    expect(document.documentElement).toHaveClass("reduce-transparency");

    // The class is removed on the next apply, not left behind: every appearance
    // class is cleared and re-added, so a setting turned off has to go.
    applyAppAppearance({ themeMode: "midnight", reduceTransparency: false, language: "en", textSize: "medium" });
    expect(document.documentElement).not.toHaveClass("reduce-transparency");
  });

  it("keeps the selected theme while making the high-contrast override explicit", () => {
    applyAppAppearance({ themeMode: "light", highContrast: true, language: "ar", textSize: "large" });

    expect(document.documentElement).toHaveClass("theme-light", "high-contrast");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--font-size")).toBe("18px");
  });
});

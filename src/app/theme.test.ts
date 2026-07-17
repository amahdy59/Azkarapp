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

  it("keeps the selected theme while making the high-contrast override explicit", () => {
    applyAppAppearance({ themeMode: "light", highContrast: true, language: "ar", textSize: "large" });

    expect(document.documentElement).toHaveClass("theme-light", "high-contrast");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--font-size")).toBe("18px");
  });
});

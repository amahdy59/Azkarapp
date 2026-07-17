import { describe, expect, it } from "vitest";
import { getNextThemeMode } from "./SettingsRootPanel";

describe("theme mode switching", () => {
  it("cycles through every theme mode", () => {
    expect(getNextThemeMode("midnight")).toBe("light");
    expect(getNextThemeMode("light")).toBe("dark");
    expect(getNextThemeMode("dark")).toBe("midnight");
  });
});

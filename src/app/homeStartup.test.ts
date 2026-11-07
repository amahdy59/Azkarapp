import { describe, expect, it } from "vitest";
import { isHomeStartup } from "./homeStartup";

describe("Home startup intent", () => {
  it("warms Home for its explicit route and returning readers at the app root", () => {
    expect(isHomeStartup("", "#/home", false)).toBe(true);
    expect(isHomeStartup("", "", true)).toBe(true);
    expect(isHomeStartup("", "", false)).toBe(false);
  });

  it("lets notification and installed shortcut destinations load their own screens", () => {
    expect(isHomeStartup("", "#/prayer/asr", true)).toBe(false);
    expect(isHomeStartup("", "#/azkar/illness-ruqyah/9", true)).toBe(false);
    expect(isHomeStartup("?category=morning", "", true)).toBe(false);
    expect(isHomeStartup("?view=auth-callback", "#/home", true)).toBe(false);
  });
});

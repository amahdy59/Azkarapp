import { describe, expect, it } from "vitest";
import { fitsTwoPages, getNextMushafTheme, MUSHAF_THEME_CYCLE } from "./mushafShell";

describe("Mushaf spread fit", () => {
  it("reverses the same colour cycle, resolving inherited and OLED choices", () => {
    for (const theme of MUSHAF_THEME_CYCLE) {
      expect(getNextMushafTheme(getNextMushafTheme(theme), "light", -1)).toBe(theme);
    }
    expect(getNextMushafTheme("follow-app", "light", -1)).toBe("dark");
    expect(getNextMushafTheme("oled", "light", -1)).toBe("midnight");
  });
  it("reserves toolbar width before offering two pages on a landscape tablet", () => {
    expect(fitsTwoPages(1024, 720)).toBe(false);
    expect(fitsTwoPages(1024, 680)).toBe(true);
  });
  it("keeps wide desktop spreads and portrait single pages", () => {
    expect(fitsTwoPages(1600, 834)).toBe(true);
    expect(fitsTwoPages(1920, 1080)).toBe(true);
    expect(fitsTwoPages(834, 1194)).toBe(false);
  });
});

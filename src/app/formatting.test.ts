import { describe, expect, it } from "vitest";
import { formatDisplayTime, formatHijriDate, formatNumerals, formatRatio } from "./formatting";

describe("localized number formatting", () => {
  it("keeps Latin numerals in English", () => {
    expect(formatRatio(3, 10, "en")).toBe("3 / 10");
  });

  it("uses Arabic-Indic numerals in Arabic", () => {
    expect(formatNumerals(2026, "ar")).toBe("٢٠٢٦");
  });

  it("formats Hijri date without duplicating era suffix", () => {
    const testDate = new Date(2026, 6, 27);
    const arResult = formatHijriDate(testDate, "ar");
    const enResult = formatHijriDate(testDate, "en");

    expect(arResult).not.toContain("هـ هـ");
    expect(arResult).toMatch(/هـ$/);

    expect(enResult).not.toContain("AH AH");
    expect(enResult).toMatch(/AH$/);
  });

  it("formats a compact localized current time", () => {
    const testDate = new Date(2026, 6, 27, 13, 5);

    expect(formatDisplayTime(testDate, "en")).toMatch(/1:05\s*PM/i);
    expect(formatDisplayTime(testDate, "ar")).toContain("١");
  });
});

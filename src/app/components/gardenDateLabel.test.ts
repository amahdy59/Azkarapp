import { describe, expect, it } from "vitest";
import { getProgressPeriodHeading } from "./gardenDateLabel";
describe("clear Progress period headings", () => {
  it("separates Today's short heading from its date and preserves a full spoken label", () => {
    const heading = getProgressPeriodHeading(new Date(2026, 9, 12, 12), "day", 0, "en", "gregorian");
    expect(heading.primary).toBe("Today");
    expect(heading.secondary).toBe("12 October 2026");
    expect(heading.accessible).toContain("Monday");
    expect(heading.secondary).not.toContain("AD");
    expect(getProgressPeriodHeading(new Date(2026, 9, 11, 12), "day", -1, "en", "gregorian").primary).toBe("Sunday");
  });
  it("matches the table's Sunday or Saturday week, including month and year boundaries", () => {
    const english = getProgressPeriodHeading(new Date(2026, 9, 12, 12), "week", 0, "en", "gregorian");
    expect(english.primary).toContain("11");
    expect(english.primary).toContain("17");
    const arabic = getProgressPeriodHeading(new Date(2026, 9, 12, 12), "week", 0, "ar", "gregorian");
    expect(arabic.primary).toContain("١٠");
    expect(arabic.primary).toContain("١٦");
    const acrossYear = getProgressPeriodHeading(new Date(2027, 0, 1, 12), "week", 0, "en", "gregorian");
    expect(acrossYear.accessible).toContain("2026");
    expect(acrossYear.accessible).toContain("2027");
  });
  it("keeps Hijri identity clear and month/year headings concise", () => {
    const hijri = getProgressPeriodHeading(new Date(2026, 9, 12, 12), "month", 0, "ar", "hijri");
    expect(hijri.primary).toBeTruthy();
    expect(hijri.secondary).toContain("١٤٤٨");
    expect(hijri.secondary).toMatch(/هـ|ه/);
    const year = getProgressPeriodHeading(new Date(2026, 9, 12, 12), "year", 0, "en", "gregorian");
    expect(year.primary).toBe("2026");
    expect(year.secondary).toBeUndefined();
  });
});

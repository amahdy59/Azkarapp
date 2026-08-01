import { describe, expect, it } from "vitest";
import { fridayChecklistKey, getIsoWeekKey } from "./fridayProgress";

describe("Friday weekly progress", () => {
  it("uses the ISO week across a year boundary", () => {
    expect(getIsoWeekKey(new Date(2024, 11, 30))).toBe("2025-W01");
    expect(getIsoWeekKey(new Date(2025, 0, 3))).toBe("2025-W01");
  });

  it("names checklist storage by week", () => {
    expect(fridayChecklistKey("2026-W31")).toBe("azkarapp.friday-checklist.2026-W31");
  });
});

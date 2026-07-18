import { describe, expect, it } from "vitest";
import { getGardenSummary } from "../../progress";
import type { DailyCollectionCompletion } from "../../types";

describe("ProgressPanel rolling intention", () => {
  it("counts distinct active days rather than duplicate collection sessions", () => {
    const records: DailyCollectionCompletion[] = [
      { dayKey: "2026-07-13", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-13", category: "evening", timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-15", category: "morning", timeZone: "Africa/Cairo" },
    ];

    const summary = getGardenSummary(records, new Date(2026, 6, 17, 12), 4);
    expect(summary.activeDaysLast7).toBe(2);
    expect(summary.palmDaysLast7).toBe(0);
  });
});

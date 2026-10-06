import { describe, expect, it } from "vitest";
import { computeQuranProgressStats, getJuzPageRange } from "./quranProgressStats";

describe("quranProgressStats", () => {
  it("resolves exact page ranges for Juz 1, 2, and 30", () => {
    expect(getJuzPageRange(1)).toEqual({ startPage: 1, endPage: 21 });
    expect(getJuzPageRange(2)).toEqual({ startPage: 22, endPage: 41 });
    expect(getJuzPageRange(30)).toEqual({ startPage: 582, endPage: 604 });
  });

  it("computes 0 progress when history is empty", () => {
    const stats = computeQuranProgressStats({ kind: "daily", dailyPages: 4 }, {}, { page: 1 });
    expect(stats.totalUniquePagesRead).toBe(0);
    expect(stats.mushafCompletionPercent).toBe(0);
    expect(stats.completedJuzsCount).toBe(0);
  });

  it("detects completed Juz 1 when all 21 pages are read", () => {
    const juz1Pages = Array.from({ length: 21 }, (_, i) => i + 1);
    const stats = computeQuranProgressStats(
      { kind: "daily", dailyPages: 4 },
      { "2026-10-01": juz1Pages },
      { page: 22 },
    );
    expect(stats.totalUniquePagesRead).toBe(21);
    expect(stats.completedJuzsCount).toBe(1);
    expect(stats.mushafCompletionPercent).toBe(3); // 21 / 604 = 3.47% -> 3%
  });

  it("computes repeating plan progress correctly", () => {
    const stats = computeQuranProgressStats(
      {
        kind: "repeating",
        repeatScope: "juz",
        repeatNumber: 1,
        repeatStartPage: 1,
        repeatEndPage: 21,
        dailyPages: 21,
      },
      { "2026-10-01": [1, 2, 3, 4, 5, 100] },
      { page: 6 },
    );
    expect(stats.planTotalPages).toBe(21);
    expect(stats.planPagesCompleted).toBe(5);
    expect(stats.planCompletionPercent).toBe(24); // 5/21 = 23.8% -> 24%
    expect(stats.totalUniquePagesRead).toBe(6);
  });
});

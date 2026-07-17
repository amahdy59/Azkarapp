import { describe, expect, it } from "vitest";
import { getWeeklyCompletedDays } from "./ProgressPanel";

describe("getWeeklyCompletedDays", () => {
  it("counts distinct completed days in the current week for one collection", () => {
    const now = new Date(2026, 6, 17, 12);
    const sessions = [
      {
        id: "a",
        category: "morning" as const,
        completedAt: new Date(2026, 6, 13, 8).toISOString(),
        completedCount: 20,
        totalCount: 20,
        durationSeconds: 60,
        isComplete: true,
      },
      {
        id: "b",
        category: "morning" as const,
        completedAt: new Date(2026, 6, 13, 18).toISOString(),
        completedCount: 20,
        totalCount: 20,
        durationSeconds: 60,
        isComplete: true,
      },
      {
        id: "c",
        category: "morning" as const,
        completedAt: new Date(2026, 6, 15, 8).toISOString(),
        completedCount: 20,
        totalCount: 20,
        durationSeconds: 60,
        isComplete: true,
      },
      {
        id: "d",
        category: "evening" as const,
        completedAt: new Date(2026, 6, 15, 18).toISOString(),
        completedCount: 20,
        totalCount: 20,
        durationSeconds: 60,
        isComplete: true,
      },
    ];

    expect(getWeeklyCompletedDays(sessions, "morning", now)).toBe(2);
  });
});

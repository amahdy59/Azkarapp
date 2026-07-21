import { describe, expect, it } from "vitest";
import { getCategoryTotal } from "./content/azkar";
import {
  deriveDailyCompletionsFromLegacySessions,
  getGardenSummary,
  getNextIncompleteIndex,
  getProgressDayKey,
  mergeDailyCompletions,
  recordDailyCollectionCompletion,
  resetStaleCompletedCollections,
} from "./progress";
import type { CategoryId, DailyCollectionCompletion, StoredSession } from "./types";

function session(category: CategoryId, completedAt: Date, isComplete = true): StoredSession {
  return {
    id: `${category}-${completedAt.toISOString()}`,
    category,
    completedAt: completedAt.toISOString(),
    completedCount: 10,
    totalCount: 10,
    durationSeconds: 60,
    isComplete,
  };
}

function fullProgress(category: CategoryId) {
  return new Set(Array.from({ length: getCategoryTotal(category) }, (_, index) => index));
}

describe("quiet garden progress", () => {
  it("uses a 04:00 boundary for before-sleep activity", () => {
    expect(getProgressDayKey(new Date(2026, 6, 18, 3, 59), 4)).toBe("2026-07-17");
    expect(getProgressDayKey(new Date(2026, 6, 18, 4, 0), 4)).toBe("2026-07-18");
  });

  it("records one leaf per category and creates a palm only for ten distinct categories", () => {
    const now = new Date(2026, 6, 18, 10);
    const first = recordDailyCollectionCompletion([], "morning", now, 4);
    const duplicate = recordDailyCollectionCompletion(first.records, "morning", now, 4);

    let state = recordDailyCollectionCompletion(duplicate.records, "evening", now, 4);
    state = recordDailyCollectionCompletion(state.records, "before_sleep", now, 4);
    state = recordDailyCollectionCompletion(state.records, "waking_up", now, 4);
    state = recordDailyCollectionCompletion(state.records, "home", now, 4);
    state = recordDailyCollectionCompletion(state.records, "mosque", now, 4);
    state = recordDailyCollectionCompletion(state.records, "after_prayer", now, 4);
    state = recordDailyCollectionCompletion(state.records, "restroom", now, 4);
    state = recordDailyCollectionCompletion(state.records, "food_drink", now, 4);
    const tenth = recordDailyCollectionCompletion(state.records, "travel", now, 4);

    expect(first.event.kind).toBe("leaf");
    expect(duplicate.event.kind).toBe("repeat");
    expect(duplicate.records).toHaveLength(1);
    expect(tenth.event).toMatchObject({ kind: "palm", leafCount: 10 });
    expect(tenth.records).toHaveLength(10);
  });

  it("migrates only complete legacy sessions and deduplicates category/day records", () => {
    const date = new Date(2026, 6, 18, 9);
    const migrated = deriveDailyCompletionsFromLegacySessions(
      [session("morning", date), session("morning", new Date(2026, 6, 18, 18)), session("evening", date, false)],
      4,
    );

    expect(migrated).toHaveLength(1);
    expect(migrated[0]).toMatchObject({ dayKey: "2026-07-18", category: "morning" });
  });

  it("merges remote records idempotently without reinterpreting stored day keys", () => {
    const base: DailyCollectionCompletion[] = [
      { dayKey: "2026-07-17", category: "before_sleep", timeZone: "Africa/Cairo" },
    ];
    const merged = mergeDailyCompletions(base, [
      { dayKey: "2026-07-17", category: "before_sleep", timeZone: "Europe/London" },
      { dayKey: "2026-07-18", category: "morning", timeZone: "Europe/London" },
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0]?.dayKey).toBe("2026-07-17");
  });

  it("uses a rolling seven-day window and permanent lifetime milestones", () => {
    const records: DailyCollectionCompletion[] = [];
    for (let offset = 0; offset < 8; offset += 1) {
      const day = new Date(2026, 6, 18 - offset, 10);
      for (const category of [
        "morning",
        "evening",
        "before_sleep",
        "waking_up",
        "home",
        "mosque",
        "after_prayer",
        "restroom",
        "food_drink",
        "travel",
      ] as const) {
        records.push({ dayKey: getProgressDayKey(day, 4), category, timeZone: "Africa/Cairo" });
      }
    }

    const summary = getGardenSummary(records, new Date(2026, 6, 18, 12), 4);
    expect(summary.activeDaysLast7).toBe(7);
    expect(summary.palmDaysLast7).toBe(7);
    expect(summary.lifetimePalms).toBe(8);
    expect(summary.milestones.find((milestone) => milestone.id === "seven_palms")?.complete).toBe(true);
    expect(summary.days[0]?.dayKey).toBe("2026-07-12");
  });

  it("keeps yesterday's palm rhythm active while today is still in progress", () => {
    const records: DailyCollectionCompletion[] = [];
    for (const category of [
      "morning",
      "evening",
      "before_sleep",
      "waking_up",
      "home",
      "mosque",
      "after_prayer",
      "restroom",
      "food_drink",
      "travel",
    ] as const) {
      records.push({ dayKey: "2026-07-16", category, timeZone: "Africa/Cairo" });
      records.push({ dayKey: "2026-07-17", category, timeZone: "Africa/Cairo" });
    }

    const summary = getGardenSummary(records, new Date(2026, 6, 18, 12), 4);
    expect(summary.currentPalmRhythm).toBe(2);
    expect(summary.messageKind).toBe("continue");
  });

  it("clears stale full collections while preserving partial progress", () => {
    const completed = {
      morning: fullProgress("morning"),
      evening: new Set([0, 1]),
      before_sleep: new Set<number>(),
      waking_up: new Set<number>(),
      home: new Set<number>(),
      mosque: new Set<number>(),
      after_prayer: new Set<number>(),
      restroom: new Set<number>(),
      food_drink: new Set<number>(),
      travel: new Set<number>(),
    };
    const reset = resetStaleCompletedCollections(completed, [], new Date(2026, 6, 18, 12), 4);

    expect(reset.morning.size).toBe(0);
    expect([...reset.evening]).toEqual([0, 1]);
  });

  it("wraps to an earlier unfinished zikr instead of treating the final index as collection completion", () => {
    expect(getNextIncompleteIndex(4, new Set([2, 3]), 3)).toBe(0);
    expect(getNextIncompleteIndex(4, new Set([0, 1, 2, 3]), 3)).toBeNull();
  });
});

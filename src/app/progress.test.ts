import { describe, expect, it } from "vitest";
import { getCategoryTotal } from "./content/azkar";
import {
  CATEGORY_IDS,
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

  it("records one leaf per main category and creates a palm for the three main categories", () => {
    const now = new Date(2026, 6, 18, 10);
    const first = recordDailyCollectionCompletion([], "morning", now, 4);
    const duplicate = recordDailyCollectionCompletion(first.records, "morning", now, 4);

    const state = recordDailyCollectionCompletion(duplicate.records, "evening", now, 4);
    const third = recordDailyCollectionCompletion(state.records, "before_sleep", now, 4);

    expect(first.event.kind).toBe("leaf");
    expect(duplicate.event.kind).toBe("repeat");
    expect(duplicate.records).toHaveLength(1);
    expect(third.event).toMatchObject({ kind: "palm", leafCount: 3 });
    expect(third.records).toHaveLength(3);
  });

  it("emits extra_leaf for the first completion of a non-core category and repeat on subsequent completions", () => {
    const now = new Date(2026, 6, 18, 10);
    const first = recordDailyCollectionCompletion([], "travel", now, 4);
    const duplicate = recordDailyCollectionCompletion(first.records, "travel", now, 4);

    expect(first.event.kind).toBe("extra_leaf");
    expect(duplicate.event.kind).toBe("repeat");
    expect(first.records).toHaveLength(1);
    expect(duplicate.records).toHaveLength(1);
  });

  it("computes extraLeafCount on GardenDay for non-core categories", () => {
    const now = new Date(2026, 6, 18, 10);
    const records = [
      { dayKey: "2026-07-18", category: "morning" as const, timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-18", category: "travel" as const, timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-18", category: "home" as const, timeZone: "Africa/Cairo" },
    ];
    const summary = getGardenSummary(records, now, 4);
    expect(summary.today.leafCount).toBe(1);
    expect(summary.today.extraLeafCount).toBe(2);
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
    const emptyCompletedSets = Object.fromEntries(CATEGORY_IDS.map((id) => [id, new Set<number>()])) as Record<
      CategoryId,
      Set<number>
    >;

    const completed = {
      ...emptyCompletedSets,
      morning: fullProgress("morning"),
      evening: new Set([0, 1]),
    };
    const reset = resetStaleCompletedCollections(completed, [], new Date(2026, 6, 18, 12), 4);

    expect(reset.morning.size).toBe(0);
    expect([...reset.evening]).toEqual([0, 1]);
  });

  it("wraps to an earlier unfinished zikr instead of treating the final index as collection completion", () => {
    expect(getNextIncompleteIndex(4, new Set([2, 3]), 3)).toBe(0);
    expect(getNextIncompleteIndex(4, new Set([0, 1, 2, 3]), 3)).toBeNull();
  });

  it("calculates daily usage streak for consecutive active days", () => {
    const records: DailyCollectionCompletion[] = [
      { dayKey: "2026-07-16", category: "travel", timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-17", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-18", category: "evening", timeZone: "Africa/Cairo" },
    ];
    const summary = getGardenSummary(records, new Date(2026, 6, 18, 12), 4);
    expect(summary.currentUsageStreak).toBe(3);
  });
});

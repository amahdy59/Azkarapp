import { describe, expect, it } from "vitest";
import {
  getInsightPeriod,
  getRecordingPattern,
  getRoutineInsights,
  getPrayerInsights,
  getTimelineChange,
  getMatchedInsightPeriods,
  countRoutineRecords,
} from "./progressInsights";
import { getCalendarMonthPeriod } from "./calendarPeriods";
import type { DailyCollectionCompletion } from "./types";

describe("progress insights", () => {
  it("compares equal elapsed calendar periods without counting duplicate routines", () => {
    const now = new Date(2026, 9, 18, 12);
    const match = getMatchedInsightPeriods("month", now, now, "en", "gregorian");
    expect(match).toEqual({
      days: 17,
      current: { startKey: "2026-10-01", endKey: "2026-10-17", days: 17 },
      previous: { startKey: "2026-09-01", endKey: "2026-09-17", days: 17 },
    });
    const feb = getMatchedInsightPeriods("month", new Date(2026, 2, 31), new Date(2026, 3, 2), "en", "gregorian");
    expect(feb.days).toBe(28);
    expect(feb.current.endKey).toBe("2026-03-28");
    expect(feb.previous.endKey).toBe("2026-02-28");
    const hijri = getMatchedInsightPeriods("year", now, now, "ar", "hijri");
    expect(hijri.current.days).toBe(hijri.previous.days);
    expect(getMatchedInsightPeriods("month", new Date(2026, 11, 2), now, "en", "gregorian").days).toBe(0);
    const row = { dayKey: "2026-10-01", category: "morning" as const, timeZone: "UTC" };
    expect(
      countRoutineRecords(
        [row, row, { ...row, category: "after_prayer" }, { ...row, dayKey: "2026-10-18" }],
        match.current,
      ),
    ).toBe(1);
  });
  it("builds prayer timelines with independent practices and excludes unfinished/future days", () => {
    const date = new Date(2026, 9, 18, 2);
    const data = getPrayerInsights(
      [
        { dayKey: "2026-10-01", prayer: "fajr", location: "home", mosque: false, adhkar: true, sunnahBefore: true },
        { dayKey: "2026-10-08", prayer: "isha", mosque: true, adhkar: false },
        { dayKey: "2026-10-17", prayer: "dhuhr", mosque: false, adhkar: true },
        { dayKey: "2026-10-18", prayer: "fajr", mosque: true, adhkar: true },
        { dayKey: "2026-10-19", prayer: "fajr", mosque: true, adhkar: true },
      ],
      "month",
      date,
      date,
      "en",
      "gregorian",
    );
    expect(data.days).toBe(17);
    expect(data.trend.map((point) => point.days)).toEqual([7, 7, 3]);
    expect(data.trend.map((point) => point.partial)).toEqual([false, false, true]);
    expect(data.trend.map((point) => point.totals.fard)).toEqual([1, 1, 0]);
    expect(data.trend.map((point) => point.totals.adhkar)).toEqual([1, 0, 1]);
    expect(data.trend[0]?.rows.find((row) => row.prayer === "fajr")).toMatchObject({ fard: 1, home: 1, rawatib: 1 });
    const year = getPrayerInsights([], "year", date, date, "ar", "hijri");
    expect(year.trend.at(-1)?.endKey).toBe("2026-10-17");
  });
  it("compares adjacent recording rates as percentage points and avoids short-sample claims", () => {
    const base = {
      label: "week",
      axisLabel: "1 Oct",
      startKey: "2026-10-01",
      endKey: "2026-10-07",
      days: 7,
      partial: false,
      possible: 21,
    };
    const points = [
      { ...base, recorded: 7 },
      { ...base, recorded: 14 },
    ];
    expect(getTimelineChange(points, 1)).toBe(33);
    expect(getTimelineChange(points, 0)).toBeNull();
    expect(
      getTimelineChange(
        [
          { ...base, recorded: 14 },
          { ...base, recorded: 7 },
        ],
        1,
      ),
    ).toBe(-33);
    expect(
      getTimelineChange(
        [
          { ...base, recorded: 7 },
          { ...base, recorded: 7 },
        ],
        1,
      ),
    ).toBe(0);
    expect(getTimelineChange([points[0]!, { ...base, days: 2, recorded: 3, possible: 6 }], 1)).toBeNull();
    expect(getTimelineChange([points[0]!, { ...base, recorded: 0, possible: 0 }], 1)).toBeNull();
  });
  it("excludes the unfinished progress day, including before the configured boundary", () => {
    const now = new Date(2026, 9, 18, 2);
    expect(getInsightPeriod("month", now, now, "en", "gregorian", 3)).toEqual({
      startKey: "2026-10-01",
      endKey: "2026-10-16",
      days: 16,
    });
    expect(getInsightPeriod("month", new Date(2026, 8, 20), now, "en", "gregorian", 3).days).toBe(30);
    expect(getInsightPeriod("month", new Date(2026, 10, 20), now, "en", "gregorian", 3).days).toBe(0);
  });
  it.each(["gregorian", "hijri"] as const)("keeps actual %s calendar boundaries", (calendar) => {
    const month = getCalendarMonthPeriod(new Date(2026, 9, 18, 12), calendar, "ar");
    const after = new Date(month.endDate);
    after.setDate(after.getDate() + 1);
    const range = getInsightPeriod("month", month.referenceDate, after, "ar", calendar);
    expect(range.days).toBe(month.dates.length);
  });
  it("deduplicates routines, counts abbreviated completions and excludes today, future and unrelated collections", () => {
    const records: DailyCollectionCompletion[] = [
      { dayKey: "2026-10-01", category: "morning", timeZone: "UTC", completionLevel: "core" },
      { dayKey: "2026-10-01", category: "morning", timeZone: "UTC", completionLevel: "complete" },
      { dayKey: "2026-10-01", category: "after_prayer", timeZone: "UTC" },
      { dayKey: "2026-10-18", category: "morning", timeZone: "UTC" },
      { dayKey: "2026-10-19", category: "evening", timeZone: "UTC" },
    ];
    const now = new Date(2026, 9, 18, 12);
    const data = getRoutineInsights(records, "month", now, now, "en", "gregorian");
    expect(data.rows.map((row) => row.count)).toEqual([1, 0, 0]);
    expect(data.days).toBe(17);
    expect(data.trend.map((point) => point.days)).toEqual([7, 7, 3]);
    expect(data.trend[0]?.routines.morning).toBe(1);
    const year = getRoutineInsights(records, "year", now, now, "en", "gregorian");
    expect(year.trend).toHaveLength(10);
    expect(year.trend.at(-1)?.days).toBe(17);
    expect(
      getRoutineInsights(records, "week", now, now, "ar", "gregorian").trend.every((point) => point.days === 1),
    ).toBe(true);
  });
  it("does not manufacture a ranking for empty, early, equal or complete data", () => {
    const rows = (counts: number[]) => counts.map((count, i) => ({ id: String(i), count }));
    expect(getRecordingPattern(rows([0, 0]), 7).kind).toBe("empty");
    expect(getRecordingPattern(rows([1, 0]), 2).kind).toBe("early");
    expect(getRecordingPattern(rows([3, 3]), 7).kind).toBe("balanced");
    expect(getRecordingPattern(rows([7, 7]), 7).kind).toBe("complete");
    expect(getRecordingPattern(rows([6, 6, 1, 1]), 7)).toEqual({
      kind: "pattern",
      strongest: ["0", "1"],
      attention: ["2", "3"],
    });
  });
});

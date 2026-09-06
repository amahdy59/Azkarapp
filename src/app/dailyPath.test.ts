import { describe, expect, it } from "vitest";
import { getDailyPathStatus, wasPrayedAtMosque, type DailyPathInput } from "./dailyPath";
import type { CategoryId, DailyCollectionCompletion, PrayerName, PrayerTrackingRecord } from "./types";

const DAY = "2026-09-06";
const BEFORE = "2026-09-01";

const completion = (category: CategoryId, dayKey = DAY): DailyCollectionCompletion => ({
  dayKey,
  category,
  timeZone: "Africa/Cairo",
});

const prayed = (prayer: PrayerName, where: "mosque" | "home", dayKey = DAY): PrayerTrackingRecord => ({
  dayKey,
  prayer,
  mosque: where === "mosque",
  adhkar: false,
  location: where,
});

function status(over: Partial<DailyPathInput> = {}) {
  return getDailyPathStatus({
    dayKey: DAY,
    dailyCompletions: [],
    wirdHistory: {},
    prayerTracking: [],
    // Every test is a day under the new rules unless it says otherwise.
    dailyPathStartDayKey: BEFORE,
    ...over,
  });
}

describe("the dhikr pillar", () => {
  it.each([
    [[], 0, false, false],
    [["morning"], 1, false, false],
    [["morning", "evening"], 2, true, false],
    [["morning", "evening", "before_sleep"], 3, true, true],
  ])("counts %j as %i of three", (categories, count, consistency, full) => {
    const result = status({ dailyCompletions: (categories as CategoryId[]).map((c) => completion(c)) });
    expect(result.dhikr.completedCount).toBe(count);
    expect(result.dhikr.consistencyComplete).toBe(consistency);
    expect(result.dhikr.fullComplete).toBe(full);
  });

  it("does not count the same collection twice", () => {
    const result = status({ dailyCompletions: [completion("morning"), completion("morning")] });
    expect(result.dhikr.completedCount).toBe(1);
  });

  it("ignores a collection completed on another day", () => {
    const result = status({ dailyCompletions: [completion("morning", "2026-09-05")] });
    expect(result.dhikr.completedCount).toBe(0);
  });
});

describe("the Qur'an pillar", () => {
  const plan = { kind: "daily" as const, dailyPages: 4 };

  it("is incomplete below the goal", () => {
    const result = status({ quranWirdPlan: plan, wirdHistory: { [DAY]: [1, 2, 3] } });
    expect(result.quran).toMatchObject({ goal: 4, progress: 3, complete: false, active: true });
  });

  it("completes exactly at the goal, and stays complete beyond it", () => {
    expect(status({ quranWirdPlan: plan, wirdHistory: { [DAY]: [1, 2, 3, 4] } }).quran.complete).toBe(true);
    expect(status({ quranWirdPlan: plan, wirdHistory: { [DAY]: [1, 2, 3, 4, 5, 6] } }).quran.complete).toBe(true);
  });

  it("counts a page opened twice once", () => {
    const result = status({ quranWirdPlan: plan, wirdHistory: { [DAY]: [1, 1, 2, 2] } });
    expect(result.quran.progress).toBe(2);
  });

  it("holds a past day to the goal it was set that day, not today's", () => {
    /* Raising the goal later must not retroactively un-complete a day that was
       finished under the old one. */
    const result = status({
      quranWirdPlan: { kind: "daily", dailyPages: 20 },
      quranWirdDailyGoals: { [DAY]: 4 },
      wirdHistory: { [DAY]: [1, 2, 3, 4] },
    });
    expect(result.quran).toMatchObject({ goal: 4, complete: true });
  });

  it("asks nothing of the day when no goal is set", () => {
    const result = status({ wirdHistory: { [DAY]: [1] } });
    expect(result.quran.active).toBe(false);
    expect(result.quran.complete).toBe(false);
  });
});

describe("the mosque pillar", () => {
  it("counts nothing when no prayer was recorded", () => {
    expect(status({ mosquePrayerGoal: 1 }).salah.mosqueCount).toBe(0);
  });

  it("does not count a prayer prayed at home", () => {
    const result = status({ mosquePrayerGoal: 1, prayerTracking: [prayed("fajr", "home")] });
    expect(result.salah.mosqueCount).toBe(0);
    expect(result.salah.complete).toBe(false);
  });

  it("counts a legacy record that has the boolean and no location", () => {
    const legacy: PrayerTrackingRecord = { dayKey: DAY, prayer: "fajr", mosque: true, adhkar: false };
    expect(wasPrayedAtMosque(legacy)).toBe(true);
    expect(status({ mosquePrayerGoal: 1, prayerTracking: [legacy] }).salah.complete).toBe(true);
  });

  it.each([1, 2, 3, 4, 5])("respects a goal of %i", (goal) => {
    const tracking = (["fajr", "dhuhr", "asr"] as PrayerName[]).map((prayer) => prayed(prayer, "mosque"));
    const result = status({ mosquePrayerGoal: goal, prayerTracking: tracking });
    expect(result.salah.complete).toBe(goal <= 3);
  });

  it("asks nothing of the day until a goal is chosen", () => {
    const result = status({ prayerTracking: [prayed("fajr", "mosque")] });
    expect(result.salah.configured).toBe(false);
    expect(result.salah.complete).toBe(false);
  });
});

describe("what qualifies a day", () => {
  const plan = { kind: "daily" as const, dailyPages: 2 };
  const configured = { quranWirdPlan: plan, mosquePrayerGoal: 2 };

  it("does not qualify on one pillar of three", () => {
    const result = status({ ...configured, dailyCompletions: [completion("morning"), completion("evening")] });
    expect(result.achievedPillarCount).toBe(1);
    expect(result.streakQualified).toBe(false);
  });

  it("qualifies on two of three", () => {
    const result = status({
      ...configured,
      dailyCompletions: [completion("morning"), completion("evening")],
      wirdHistory: { [DAY]: [1, 2] },
    });
    expect(result.streakQualified).toBe(true);
    expect(result.palmEarned).toBe(false);
  });

  it("earns a palm only with all three collections and every configured pillar", () => {
    const full = {
      ...configured,
      dailyCompletions: [completion("morning"), completion("evening"), completion("before_sleep")],
      wirdHistory: { [DAY]: [1, 2] },
      prayerTracking: [prayed("fajr", "mosque"), prayed("asr", "mosque")],
    };
    expect(status(full).palmEarned).toBe(true);
    // Two collections instead of three is a qualifying day, not a balanced one.
    expect(status({ ...full, dailyCompletions: full.dailyCompletions.slice(0, 2) }).palmEarned).toBe(false);
  });

  it("lets a reader who set up nothing else still keep a streak on dhikr alone", () => {
    /* With one active pillar the threshold is one. Requiring two would be a new
       rule that penalises someone for not adopting the other two. */
    const result = status({ dailyCompletions: [completion("morning"), completion("evening")] });
    expect(result.activePillarCount).toBe(1);
    expect(result.streakQualified).toBe(true);
  });

  it("is idempotent: repeating the same completions changes nothing", () => {
    const once = status({
      dailyCompletions: [completion("morning"), completion("evening"), completion("before_sleep")],
    });
    const twice = status({
      dailyCompletions: [
        completion("morning"),
        completion("morning"),
        completion("evening"),
        completion("before_sleep"),
        completion("before_sleep"),
      ],
    });
    expect(twice.palmEarned).toBe(once.palmEarned);
    expect(twice.dhikr.completedCount).toBe(3);
  });
});

describe("days lived under the old rules", () => {
  const legacyDay = { dayKey: "2026-08-01", dailyPathStartDayKey: "2026-09-01" };

  it("keeps a palm earned on the three collections alone", () => {
    /* The point of the versioning: that day had no Qur'an or mosque record to
       judge, and re-judging it under the new rules would delete the palm. */
    const result = getDailyPathStatus({
      ...legacyDay,
      dailyCompletions: [
        completion("morning", legacyDay.dayKey),
        completion("evening", legacyDay.dayKey),
        completion("before_sleep", legacyDay.dayKey),
      ],
      wirdHistory: {},
      prayerTracking: [],
      mosquePrayerGoal: 5,
    });
    expect(result.policyVersion).toBe(1);
    expect(result.palmEarned).toBe(true);
  });

  it("counts a single collection as a day the reader showed up", () => {
    const result = getDailyPathStatus({
      ...legacyDay,
      dailyCompletions: [completion("morning", legacyDay.dayKey)],
      wirdHistory: {},
      prayerTracking: [],
    });
    expect(result.streakQualified).toBe(true);
  });

  it("judges a day on or after the start under the new rules", () => {
    const result = getDailyPathStatus({
      dayKey: "2026-09-01",
      dailyPathStartDayKey: "2026-09-01",
      dailyCompletions: [completion("morning", "2026-09-01")],
      wirdHistory: {},
      prayerTracking: [],
    });
    expect(result.policyVersion).toBe(2);
  });

  it("treats every day as legacy until the reader has a start day", () => {
    // An old snapshot that has never met this feature must render unchanged.
    const result = getDailyPathStatus({
      dayKey: DAY,
      dailyCompletions: [completion("morning"), completion("evening"), completion("before_sleep")],
      wirdHistory: {},
      prayerTracking: [],
    });
    expect(result.policyVersion).toBe(1);
    expect(result.palmEarned).toBe(true);
  });
});

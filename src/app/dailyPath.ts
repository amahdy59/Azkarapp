import { MAIN_CATEGORY_IDS } from "./progress";
import { getQuranWirdGoal } from "./screens/quranWirdGoal";
import { trackedLocation } from "./prayerMoment";
import { PRAYER_NAMES } from "./content/prayerTimes";
import type { CategoryId, DailyCollectionCompletion, PrayerTrackingRecord, QuranWirdPlan } from "./types";

/**
 * The day's path: dhikr, Qur'an, and the prayers walked to.
 *
 * Derived, never stored. Every fact this reads already exists as a domain
 * record — a completion, a page, a prayer someone recorded — and a second copy
 * of "did today count" would be one more thing that can disagree with the first.
 *
 * Two metrics come out of it and they mean different things. The streak
 * measures returning: two of the day's active pillars. The palm measures a
 * balanced day: all of them, with the dhikr complete rather than merely
 * consistent. Neither measures anyone's faith, and nothing here should ever be
 * phrased as though it did.
 */

/**
 * Which rules a day is judged by.
 *
 * 1 is what the app has always done: a palm is the three timed collections, and
 * a day counts for the streak if any of them was completed.
 *
 * 2 is the daily path. It cannot be applied backwards — the Qur'an and prayer
 * records it reads did not sync until recently and may not exist locally for a
 * past day at all, so re-judging history under it would delete palms people
 * earned. Days before the reader's activation keep their original verdict.
 */
export type ProgressPolicyVersion = 1 | 2;

export interface DailyPathStatus {
  dayKey: string;
  policyVersion: ProgressPolicyVersion;
  dhikr: {
    morning: boolean;
    evening: boolean;
    beforeSleep: boolean;
    completedCount: number;
    /** Two of three: enough to have kept the path. */
    consistencyComplete: boolean;
    /** All three. */
    fullComplete: boolean;
  };
  quran: {
    goal: number;
    progress: number;
    complete: boolean;
    /** False when no goal is set, in which case it asks nothing of the day. */
    active: boolean;
  };
  salah: {
    target: number | null;
    mosqueCount: number;
    complete: boolean;
    /** False until the reader has chosen a goal. */
    configured: boolean;
  };
  activePillarCount: number;
  achievedPillarCount: number;
  streakQualified: boolean;
  palmEarned: boolean;
}

export interface DailyPathInput {
  dayKey: string;
  dailyCompletions: readonly DailyCollectionCompletion[];
  wirdHistory: Record<string, number[]>;
  quranWirdPlan?: QuranWirdPlan;
  /** What the goal was on that day, where it was recorded. */
  quranWirdDailyGoals?: Record<string, number>;
  prayerTracking: readonly PrayerTrackingRecord[];
  /** How many of the five the reader means to pray in congregation. */
  mosquePrayerGoal?: number;
  /**
   * The first day judged by the daily path.
   *
   * Set once, when the reader first opens a build that has it. Everything
   * before keeps the old verdict; nothing already earned changes.
   */
  dailyPathStartDayKey?: string;
}

/**
 * Whether a prayer was prayed in congregation.
 *
 * Reads the location, falling back to the older boolean, so a record written
 * before locations existed still counts. An unrecorded prayer is neither a
 * mosque prayer nor a missed one — it is unrecorded, and this says false
 * without implying anything else.
 */
export function wasPrayedAtMosque(record: PrayerTrackingRecord | undefined): boolean {
  return trackedLocation(record) === "mosque";
}

function completedCategories(completions: readonly DailyCollectionCompletion[], dayKey: string): Set<CategoryId> {
  return new Set(completions.filter((record) => record.dayKey === dayKey).map((record) => record.category));
}

/** The goal that day was actually held to, not the one set since. */
function goalForDay(input: DailyPathInput): number {
  const recorded = input.quranWirdDailyGoals?.[input.dayKey];
  if (typeof recorded === "number") return recorded;
  if (!input.quranWirdPlan) return 0;
  return getQuranWirdGoal(input.quranWirdPlan, input.wirdHistory, input.dayKey).dailyGoal;
}

export function getDailyPathStatus(input: DailyPathInput): DailyPathStatus {
  const done = completedCategories(input.dailyCompletions, input.dayKey);
  const [morning, evening, beforeSleep] = MAIN_CATEGORY_IDS.map((category) => done.has(category)) as [
    boolean,
    boolean,
    boolean,
  ];
  const completedCount = [morning, evening, beforeSleep].filter(Boolean).length;

  const goal = goalForDay(input);
  // Unique pages: the same page opened twice is one page read.
  const progress = new Set(input.wirdHistory[input.dayKey] ?? []).size;
  const quranActive = goal > 0;

  const target = input.mosquePrayerGoal && input.mosquePrayerGoal > 0 ? input.mosquePrayerGoal : null;
  const dayRecords = input.prayerTracking.filter((record) => record.dayKey === input.dayKey);
  const mosqueCount = PRAYER_NAMES.filter((prayer) =>
    wasPrayedAtMosque(dayRecords.find((record) => record.prayer === prayer)),
  ).length;

  const dhikr = {
    morning,
    evening,
    beforeSleep,
    completedCount,
    consistencyComplete: completedCount >= 2,
    fullComplete: completedCount === MAIN_CATEGORY_IDS.length,
  };
  const quran = { goal, progress, complete: quranActive && progress >= goal, active: quranActive };
  const salah = {
    target,
    mosqueCount,
    complete: target !== null && mosqueCount >= target,
    configured: target !== null,
  };

  /* A pillar the reader has not set up asks nothing of the day. Counting an
     unconfigured mosque goal as a failed pillar would quietly make the palm
     unreachable for everyone who never opened that setting. */
  const active = [true, quran.active, salah.configured];
  const achieved = [dhikr.consistencyComplete, quran.complete, salah.complete];
  const activePillarCount = active.filter(Boolean).length;
  const achievedPillarCount = achieved.filter((value, index) => value && active[index]).length;

  const policyVersion: ProgressPolicyVersion =
    input.dailyPathStartDayKey && input.dayKey >= input.dailyPathStartDayKey ? 2 : 1;

  if (policyVersion === 1) {
    /* The old rules, unchanged, for days that were lived under them. A palm was
       the three collections; a day counted for the streak if any of them was
       done. The pillars are still reported, because the screen can show what a
       past day held without re-judging it. */
    return {
      dayKey: input.dayKey,
      policyVersion,
      dhikr,
      quran,
      salah,
      activePillarCount,
      achievedPillarCount,
      streakQualified: completedCount > 0,
      palmEarned: dhikr.fullComplete,
    };
  }

  /* Two pillars, or every one there is when fewer are set up — otherwise a
     reader who has only ever done dhikr could never keep a streak, which would
     be a new rule punishing them for not adopting the others. */
  const streakThreshold = Math.min(2, activePillarCount);
  return {
    dayKey: input.dayKey,
    policyVersion,
    dhikr,
    quran,
    salah,
    activePillarCount,
    achievedPillarCount,
    streakQualified: achievedPillarCount >= streakThreshold,
    // Full dhikr, and every pillar that asks anything of the day.
    palmEarned: dhikr.fullComplete && achievedPillarCount === activePillarCount,
  };
}

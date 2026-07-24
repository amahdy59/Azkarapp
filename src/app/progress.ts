import { getCategoryTotal } from "./content/azkar";
import type { CategoryId, DailyCollectionCompletion, StoredSession } from "./types";

export const CATEGORY_IDS: CategoryId[] = [
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
];
export const MAIN_CATEGORY_IDS: CategoryId[] = ["morning", "evening", "before_sleep"];
export const DEFAULT_PROGRESS_DAY_START_HOUR = 4;

export type GrowthEventKind = "leaf" | "palm" | "repeat";
export type GardenMessageKind = "first" | "partial" | "complete" | "continue" | "welcome_back" | "yesterday_partial";
export type GardenMilestoneId = "first_leaf" | "first_palm" | "seven_palms" | "thirty_palms";

export interface GrowthEvent {
  kind: GrowthEventKind;
  category: CategoryId;
  dayKey: string;
  leafCount: number;
}

export interface GardenDay {
  dayKey: string;
  date: Date;
  completedCategories: CategoryId[];
  leafCount: number;
  isPalm: boolean;
  isToday: boolean;
}

export interface GardenMilestone {
  id: GardenMilestoneId;
  current: number;
  target: number;
  complete: boolean;
}

export interface GardenSummary {
  today: GardenDay;
  days: GardenDay[];
  activeDaysLast7: number;
  palmDaysLast7: number;
  lifetimeLeaves: number;
  lifetimePalms: number;
  currentPalmRhythm: number;
  longestPalmRhythm: number;
  messageKind: GardenMessageKind;
  yesterdayLeafCount: number;
  milestones: GardenMilestone[];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function isProgressDayKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 12);
  return parsed.getFullYear() === year && parsed.getMonth() === (month ?? 1) - 1 && parsed.getDate() === day;
}

function formatLocalDay(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function safeBoundaryHour(boundaryHour: number) {
  return Number.isInteger(boundaryHour) && boundaryHour >= 0 && boundaryHour <= 12
    ? boundaryHour
    : DEFAULT_PROGRESS_DAY_START_HOUR;
}

/** Resolves a devotional progress day; before-sleep activity before 04:00 stays with the previous date. */
export function getProgressDayKey(date = new Date(), boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR) {
  const shifted = new Date(date);
  shifted.setHours(shifted.getHours() - safeBoundaryHour(boundaryHour));
  return formatLocalDay(shifted);
}

export function dateFromProgressDayKey(dayKey: string) {
  if (!isProgressDayKey(dayKey)) {
    return new Date(Number.NaN);
  }
  const [year = 0, month = 1, day = 1] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function shiftProgressDayKey(dayKey: string, days: number) {
  const date = dateFromProgressDayKey(dayKey);
  date.setDate(date.getDate() + days);
  return formatLocalDay(date);
}

function dayOrdinal(dayKey: string) {
  const [year = 0, month = 1, day = 1] = dayKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function currentTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  } catch {
    return "local";
  }
}

export function normalizeDailyCompletions(value: unknown): DailyCollectionCompletion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Map<string, DailyCollectionCompletion>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }
    const record = candidate as Partial<DailyCollectionCompletion>;
    if (
      !isProgressDayKey(record.dayKey) ||
      !record.category ||
      !CATEGORY_IDS.includes(record.category) ||
      typeof record.timeZone !== "string" ||
      !record.timeZone.trim()
    ) {
      continue;
    }
    unique.set(`${record.dayKey}:${record.category}`, {
      dayKey: record.dayKey,
      category: record.category,
      timeZone: record.timeZone.trim(),
    });
  }

  return [...unique.values()].sort(
    (a, b) => a.dayKey.localeCompare(b.dayKey) || CATEGORY_IDS.indexOf(a.category) - CATEGORY_IDS.indexOf(b.category),
  );
}

export function mergeDailyCompletions(base: DailyCollectionCompletion[], incoming: DailyCollectionCompletion[]) {
  return normalizeDailyCompletions([...base, ...incoming]);
}

export function deriveDailyCompletionsFromLegacySessions(
  sessions: StoredSession[],
  boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR,
) {
  const timeZone = currentTimeZone();
  return normalizeDailyCompletions(
    sessions
      .filter((session) => session.isComplete)
      .map((session) => ({
        dayKey: getProgressDayKey(new Date(session.completedAt), boundaryHour),
        category: session.category,
        timeZone,
      })),
  );
}

export function recordDailyCollectionCompletion(
  records: DailyCollectionCompletion[],
  category: CategoryId,
  now = new Date(),
  boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR,
) {
  const dayKey = getProgressDayKey(now, boundaryHour);
  const normalized = normalizeDailyCompletions(records);
  const dayRecords = normalized.filter((record) => record.dayKey === dayKey);
  const existing = dayRecords.some((record) => record.category === category);
  const isMainCategory = MAIN_CATEGORY_IDS.includes(category);

  if (existing) {
    const leafCount = dayRecords.filter((record) => MAIN_CATEGORY_IDS.includes(record.category)).length;
    return {
      records: normalized,
      event: { kind: "repeat", category, dayKey, leafCount } satisfies GrowthEvent,
    };
  }

  const next = mergeDailyCompletions(normalized, [{ dayKey, category, timeZone: currentTimeZone() }]);
  const leafCount = next
    .filter((record) => record.dayKey === dayKey)
    .filter((record) => MAIN_CATEGORY_IDS.includes(record.category)).length;

  if (!isMainCategory) {
    return {
      records: next,
      event: { kind: "repeat", category, dayKey, leafCount } satisfies GrowthEvent,
    };
  }

  return {
    records: next,
    event: {
      kind: leafCount === MAIN_CATEGORY_IDS.length ? "palm" : "leaf",
      category,
      dayKey,
      leafCount,
    } satisfies GrowthEvent,
  };
}

function categoryMap(records: DailyCollectionCompletion[]) {
  const byDay = new Map<string, Set<CategoryId>>();
  for (const record of normalizeDailyCompletions(records)) {
    const categories = byDay.get(record.dayKey) ?? new Set<CategoryId>();
    categories.add(record.category);
    byDay.set(record.dayKey, categories);
  }
  return byDay;
}

function gardenDay(dayKey: string, todayKey: string, byDay: Map<string, Set<CategoryId>>): GardenDay {
  const categories = byDay.get(dayKey) ?? new Set<CategoryId>();
  const completedCategories = MAIN_CATEGORY_IDS.filter((category) => categories.has(category));
  return {
    dayKey,
    date: dateFromProgressDayKey(dayKey),
    completedCategories,
    leafCount: completedCategories.length,
    isPalm: completedCategories.length === MAIN_CATEGORY_IDS.length,
    isToday: dayKey === todayKey,
  };
}

export function getPalmStreakSummary(
  records: DailyCollectionCompletion[],
  now = new Date(),
  boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR,
) {
  const todayKey = getProgressDayKey(now, boundaryHour);
  const palmKeys = [...categoryMap(records).entries()]
    .filter(([dayKey, categories]) => dayKey <= todayKey && MAIN_CATEGORY_IDS.every((cat) => categories.has(cat)))
    .map(([dayKey]) => dayKey)
    .sort();

  let longestPalmRhythm = 0;
  let run = 0;
  for (let index = 0; index < palmKeys.length; index += 1) {
    const current = palmKeys[index];
    const previous = palmKeys[index - 1];
    run = previous && current && dayOrdinal(current) - dayOrdinal(previous) === 1 ? run + 1 : 1;
    longestPalmRhythm = Math.max(longestPalmRhythm, run);
  }

  let currentPalmRhythm = 0;
  const latest = palmKeys.at(-1);
  if (latest && dayOrdinal(todayKey) - dayOrdinal(latest) <= 1) {
    currentPalmRhythm = 1;
    for (let index = palmKeys.length - 1; index > 0; index -= 1) {
      const current = palmKeys[index];
      const previous = palmKeys[index - 1];
      if (!current || !previous || dayOrdinal(current) - dayOrdinal(previous) !== 1) {
        break;
      }
      currentPalmRhythm += 1;
    }
  }

  return { currentPalmRhythm, longestPalmRhythm };
}

export function getGardenSummary(
  records: DailyCollectionCompletion[],
  now = new Date(),
  boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR,
): GardenSummary {
  const todayKey = getProgressDayKey(now, boundaryHour);
  const normalized = normalizeDailyCompletions(records).filter((record) => record.dayKey <= todayKey);
  const byDay = categoryMap(normalized);
  const days = Array.from({ length: 7 }, (_, index) =>
    gardenDay(shiftProgressDayKey(todayKey, index - 6), todayKey, byDay),
  );
  const today = days.at(-1) ?? gardenDay(todayKey, todayKey, byDay);
  const yesterday = days.at(-2);
  const activeKeys = [...byDay.keys()].filter((dayKey) => dayKey <= todayKey).sort();
  const lifetimeLeaves = normalized.filter((record) => MAIN_CATEGORY_IDS.includes(record.category)).length;
  const lifetimePalms = [...byDay.values()].filter((categories) =>
    MAIN_CATEGORY_IDS.every((cat) => categories.has(cat)),
  ).length;
  const { currentPalmRhythm, longestPalmRhythm } = getPalmStreakSummary(normalized, now, boundaryHour);

  let messageKind: GardenMessageKind;
  if (today.isPalm) {
    messageKind = "complete";
  } else if (today.leafCount > 0) {
    messageKind = "partial";
  } else if (activeKeys.length === 0) {
    messageKind = "first";
  } else if (yesterday && yesterday.leafCount > 0 && !yesterday.isPalm) {
    messageKind = "yesterday_partial";
  } else {
    const lastActiveKey = activeKeys.at(-1);
    messageKind = lastActiveKey && dayOrdinal(todayKey) - dayOrdinal(lastActiveKey) >= 2 ? "welcome_back" : "continue";
  }

  const milestones: GardenMilestone[] = [
    { id: "first_leaf", current: lifetimeLeaves, target: 1, complete: lifetimeLeaves >= 1 },
    { id: "first_palm", current: lifetimePalms, target: 1, complete: lifetimePalms >= 1 },
    { id: "seven_palms", current: lifetimePalms, target: 7, complete: lifetimePalms >= 7 },
    { id: "thirty_palms", current: lifetimePalms, target: 30, complete: lifetimePalms >= 30 },
  ];

  return {
    today,
    days,
    activeDaysLast7: days.filter((day) => day.leafCount > 0).length,
    palmDaysLast7: days.filter((day) => day.isPalm).length,
    lifetimeLeaves,
    lifetimePalms,
    currentPalmRhythm,
    longestPalmRhythm,
    messageKind,
    yesterdayLeafCount: yesterday?.leafCount ?? 0,
    milestones,
  };
}

/** Clears only fully completed collections from an older progress day; partial reading progress remains resumable. */
export function resetStaleCompletedCollections(
  completed: Record<CategoryId, Set<number>>,
  records: DailyCollectionCompletion[],
  now = new Date(),
  boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR,
) {
  const todayKey = getProgressDayKey(now, boundaryHour);
  const completedToday = new Set(
    normalizeDailyCompletions(records)
      .filter((record) => record.dayKey === todayKey)
      .map((record) => record.category),
  );

  return Object.fromEntries(
    CATEGORY_IDS.map((category) => {
      const categoryProgress = completed[category] ?? new Set<number>();
      const isFull = Array.from({ length: getCategoryTotal(category) }, (_, index) => index).every((index) =>
        categoryProgress.has(index),
      );
      return [category, isFull && !completedToday.has(category) ? new Set<number>() : new Set(categoryProgress)];
    }),
  ) as Record<CategoryId, Set<number>>;
}

export function millisecondsUntilNextProgressDay(now = new Date(), boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR) {
  const next = new Date(now);
  next.setHours(safeBoundaryHour(boundaryHour), 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(1_000, next.getTime() - now.getTime());
}

/** Returns the next unfinished item, wrapping to earlier items; null means the collection is truly complete. */
export function getNextIncompleteIndex(total: number, completed: Iterable<number>, currentIndex: number) {
  if (!Number.isInteger(total) || total <= 0) {
    return null;
  }

  const completedIndexes = new Set(completed);
  for (let offset = 1; offset <= total; offset += 1) {
    const candidate = (currentIndex + offset + total) % total;
    if (!completedIndexes.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

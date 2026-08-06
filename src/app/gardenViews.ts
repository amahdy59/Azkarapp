import { MAIN_CATEGORY_IDS } from "./progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "./types";

export type DailyCompletionIndex = Map<string, Set<CategoryId>>;

export type MonthGardenDay = {
  dayKey: string;
  dayNum: number;
  completedCount: number;
  isPalm: boolean;
  status: "complete" | "partial" | "unstarted" | "empty";
  categories: CategoryId[];
};

export type RoutineStatus = "complete" | "partial" | "missed";

export interface WeekDayRecord {
  dayKey: string;
  date: Date;
  weekdayName: string;
  isToday: boolean;
  morningStatus: RoutineStatus;
  eveningStatus: RoutineStatus;
  sleepStatus: RoutineStatus;
  completedCount: number;
  isPalm: boolean;
}

export interface WeekGardenStats {
  days: WeekDayRecord[];
  morningCompletedCount: number;
  eveningCompletedCount: number;
  sleepCompletedCount: number;
  afterPrayerCompletedCount: number;
  completedDaysCount: number;
  mostMissedRoutine: CategoryId | null;
  bestStreakDays: number;
  bestRoutine: CategoryId;
}

export interface MonthDetailedStats {
  days: MonthGardenDay[];
  fullDaysCount: number;
  totalActiveDays: number;
  completionRate: number;
  longestStreak: number;
  bestRoutine: CategoryId;
  daysInMonth: number;
}

export interface YearMonthHeatmap {
  monthIndex: number;
  completionRate: number;
  fullDaysCount: number;
  activeDaysCount: number;
  dayCells: { dayNum: number; level: 0 | 1 | 2; isPalm: boolean }[];
}

export interface YearDetailedStats {
  totalPalms: number;
  totalCollections: number;
  activeDays: number;
  overallCompletionRate: number;
  longestStreak: number;
  currentStreak: number;
  bestMonthIndex: number;
  bestMonthRate: number;
  mostConsistentRoutine: CategoryId;
  months: YearMonthHeatmap[];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createDailyCompletionIndex(records: DailyCollectionCompletion[]): DailyCompletionIndex {
  const index: DailyCompletionIndex = new Map();
  for (const record of records) {
    const categories = index.get(record.dayKey) ?? new Set<CategoryId>();
    categories.add(record.category);
    index.set(record.dayKey, categories);
  }
  return index;
}

/** Computes detailed Week statistics including day-by-day commitment matrix */
export function getWeekGardenStats(
  index: DailyCompletionIndex,
  referenceDate: Date,
  language: AppLanguage,
): WeekGardenStats {
  const isArabic = language === "ar";
  const todayKey = formatDayKey(new Date());

  // Calculate start of week (Saturday for Arabic, Sunday for English / standard)
  const currentDayOfWeek = referenceDate.getDay(); // 0 = Sunday, 6 = Saturday
  const startOffset = isArabic ? (currentDayOfWeek + 1) % 7 : currentDayOfWeek;
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - startOffset);

  const days: WeekDayRecord[] = [];
  let morningCompletedCount = 0;
  let eveningCompletedCount = 0;
  let sleepCompletedCount = 0;
  let afterPrayerCompletedCount = 0;
  let completedDaysCount = 0;
  let currentRun = 0;
  let bestStreakDays = 0;

  const weekdayFormatter = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { weekday: "short" });

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dayKey = formatDayKey(d);
    const categories = index.get(dayKey) ?? new Set<CategoryId>();
    const isToday = dayKey === todayKey;

    const hasMorning = categories.has("morning");
    const hasEvening = categories.has("evening");
    const hasSleep = categories.has("before_sleep");
    const hasAfterPrayer = categories.has("after_prayer");

    if (hasMorning) morningCompletedCount++;
    if (hasEvening) eveningCompletedCount++;
    if (hasSleep) sleepCompletedCount++;
    if (hasAfterPrayer) afterPrayerCompletedCount++;

    const isPalm = hasMorning && hasEvening && hasSleep && hasAfterPrayer;
    if (isPalm) {
      completedDaysCount++;
      currentRun++;
      if (currentRun > bestStreakDays) bestStreakDays = currentRun;
    } else {
      currentRun = 0;
    }

    days.push({
      dayKey,
      date: d,
      weekdayName: weekdayFormatter.format(d),
      isToday,
      morningStatus: hasMorning ? "complete" : "missed",
      eveningStatus: hasEvening ? "complete" : "missed",
      sleepStatus: hasSleep ? "complete" : "missed",
      completedCount: categories.size,
      isPalm,
    });
  }

  // Determine most missed and best routine
  const routineCounts = [
    { id: "morning" as CategoryId, count: morningCompletedCount },
    { id: "evening" as CategoryId, count: eveningCompletedCount },
    { id: "before_sleep" as CategoryId, count: sleepCompletedCount },
    { id: "after_prayer" as CategoryId, count: afterPrayerCompletedCount },
  ];

  routineCounts.sort((a, b) => a.count - b.count);
  const lowest = routineCounts[0]!;
  const highest = routineCounts[3]!;
  const mostMissedRoutine = lowest.count < 7 ? lowest.id : null;
  const bestRoutine = highest.id;

  return {
    days,
    morningCompletedCount,
    eveningCompletedCount,
    sleepCompletedCount,
    afterPrayerCompletedCount,
    completedDaysCount,
    mostMissedRoutine,
    bestStreakDays,
    bestRoutine,
  };
}

export function getMonthGardenDays(
  index: DailyCompletionIndex,
  year: number,
  zeroBasedMonth: number,
): MonthGardenDay[] {
  const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
  const todayKey = formatDayKey(new Date());

  return Array.from({ length: daysInMonth }, (_, dayIndex): MonthGardenDay => {
    const dayNum = dayIndex + 1;
    const dayKey = `${year}-${pad(zeroBasedMonth + 1)}-${pad(dayNum)}`;
    const categories = index.get(dayKey) ?? new Set<CategoryId>();
    const completedCount = categories.size;
    const isPalm = MAIN_CATEGORY_IDS.every((category) => categories.has(category));

    let status: MonthGardenDay["status"] = "unstarted";
    if (isPalm) {
      status = "complete";
    } else if (completedCount > 0) {
      status = "partial";
    } else if (dayKey > todayKey) {
      status = "empty";
    }

    return {
      dayKey,
      dayNum,
      completedCount,
      isPalm,
      status,
      categories: Array.from(categories),
    };
  });
}

export function getMonthDetailedStats(
  index: DailyCompletionIndex,
  year: number,
  zeroBasedMonth: number,
): MonthDetailedStats {
  const days = getMonthGardenDays(index, year, zeroBasedMonth);
  const daysInMonth = days.length;

  let fullDaysCount = 0;
  let totalActiveDays = 0;
  let totalCompletions = 0;
  let morningCount = 0;
  let eveningCount = 0;
  let sleepCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;

  for (const day of days) {
    if (day.isPalm) {
      fullDaysCount++;
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }

    if (day.completedCount > 0) {
      totalActiveDays++;
      totalCompletions += Math.min(4, day.completedCount);
    }

    for (const cat of day.categories) {
      if (cat === "morning") morningCount++;
      if (cat === "evening") eveningCount++;
      if (cat === "before_sleep") sleepCount++;
    }
  }

  const completionRate = Math.round((totalCompletions / (daysInMonth * 4)) * 100);

  let bestRoutine: CategoryId = "morning";
  if (eveningCount > morningCount && eveningCount >= sleepCount) {
    bestRoutine = "evening";
  } else if (sleepCount > morningCount && sleepCount > eveningCount) {
    bestRoutine = "before_sleep";
  }

  return {
    days,
    fullDaysCount,
    totalActiveDays,
    completionRate,
    longestStreak,
    bestRoutine,
    daysInMonth,
  };
}

export function getYearGardenStats(index: DailyCompletionIndex, year: number) {
  let totalPalms = 0;
  let totalCollections = 0;
  let activeDays = 0;

  for (const [dayKey, categories] of index) {
    if (!dayKey.startsWith(`${year}-`)) continue;
    activeDays += 1;
    totalCollections += categories.size;
    if (MAIN_CATEGORY_IDS.every((category) => categories.has(category))) {
      totalPalms += 1;
    }
  }

  return { totalPalms, totalCollections, activeDays };
}

export function getYearDetailedStats(index: DailyCompletionIndex, year: number): YearDetailedStats {
  const months: YearMonthHeatmap[] = [];
  let totalPalms = 0;
  let totalCollections = 0;
  let activeDays = 0;
  let morningTotal = 0;
  let eveningTotal = 0;
  let sleepTotal = 0;
  let bestMonthIndex = 0;
  let bestMonthRate = 0;
  let totalPossibleAllYear = 0;

  let currentStreak = 0;
  let longestStreak = 0;

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    totalPossibleAllYear += daysInMonth * 4;
    let monthCompletions = 0;
    let fullDaysCount = 0;
    let activeDaysCount = 0;
    const dayCells: YearMonthHeatmap["dayCells"] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = `${year}-${pad(m + 1)}-${pad(d)}`;
      const categories = index.get(dayKey) ?? new Set<CategoryId>();
      const count = categories.size;
      const isPalm = MAIN_CATEGORY_IDS.every((category) => categories.has(category));

      if (isPalm) {
        fullDaysCount++;
        totalPalms++;
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      if (count > 0) {
        activeDaysCount++;
        activeDays++;
        monthCompletions += Math.min(4, count);
        totalCollections += count;
      }

      if (categories.has("morning")) morningTotal++;
      if (categories.has("evening")) eveningTotal++;
      if (categories.has("before_sleep")) sleepTotal++;

      const level: 0 | 1 | 2 = isPalm ? 2 : count > 0 ? 1 : 0;
      dayCells.push({ dayNum: d, level, isPalm });
    }

    const completionRate = Math.round((monthCompletions / (daysInMonth * 4)) * 100);
    if (completionRate > bestMonthRate) {
      bestMonthRate = completionRate;
      bestMonthIndex = m;
    }

    months.push({
      monthIndex: m,
      completionRate,
      fullDaysCount,
      activeDaysCount,
      dayCells,
    });
  }

  const overallCompletionRate = Math.round((totalCollections / totalPossibleAllYear) * 100);

  let mostConsistentRoutine: CategoryId = "morning";
  if (eveningTotal > morningTotal && eveningTotal >= sleepTotal) {
    mostConsistentRoutine = "evening";
  } else if (sleepTotal > morningTotal && sleepTotal > eveningTotal) {
    mostConsistentRoutine = "before_sleep";
  }

  return {
    totalPalms,
    totalCollections,
    activeDays,
    overallCompletionRate,
    longestStreak,
    currentStreak,
    bestMonthIndex,
    bestMonthRate,
    mostConsistentRoutine,
    months,
  };
}

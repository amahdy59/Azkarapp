import { MAIN_CATEGORY_IDS } from "./progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "./types";

export type DailyCompletionIndex = Map<string, { categories: Set<CategoryId>; afterPrayers: Set<string> }>;

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
  completedDaysCount: number;
  mostMissedRoutine: CategoryId | null;
  bestStreakDays: number;
  bestRoutine: CategoryId | null;
}

export interface MonthDetailedStats {
  days: MonthGardenDay[];
  fullDaysCount: number;
  totalActiveDays: number;
  completionRate: number;
  longestStreak: number;
  bestRoutine: CategoryId | null;
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
  bestMonthIndex: number | null;
  bestMonthRate: number;
  mostConsistentRoutine: CategoryId | null;
  months: YearMonthHeatmap[];
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function countMainCompletions(categories: Set<CategoryId>) {
  return MAIN_CATEGORY_IDS.filter((category) => categories.has(category)).length;
}

export function formatDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createDailyCompletionIndex(records: DailyCollectionCompletion[]): DailyCompletionIndex {
  const index: DailyCompletionIndex = new Map();
  for (const record of records) {
    const entry = index.get(record.dayKey) ?? { categories: new Set<CategoryId>(), afterPrayers: new Set<string>() };
    entry.categories.add(record.category);
    if (record.category === "after_prayer" && record.subCategory) {
      entry.afterPrayers.add(record.subCategory);
    }
    index.set(record.dayKey, entry);
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
  let completedDaysCount = 0;
  let currentRun = 0;
  let bestStreakDays = 0;

  const weekdayFormatter = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { weekday: "short" });

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dayKey = formatDayKey(d);
    const entry = index.get(dayKey) ?? { categories: new Set<CategoryId>(), afterPrayers: new Set<string>() };
    const categories = entry.categories;
    const isToday = dayKey === todayKey;

    const hasMorning = categories.has("morning");
    const hasEvening = categories.has("evening");
    const hasSleep = categories.has("before_sleep");

    if (hasMorning) morningCompletedCount++;
    if (hasEvening) eveningCompletedCount++;
    if (hasSleep) sleepCompletedCount++;

    const isPalm = hasMorning && hasEvening && hasSleep;
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
      eveningStatus: hasEvening ? "complete" : isToday ? "partial" : "missed",
      sleepStatus: hasSleep ? "complete" : isToday ? "partial" : "missed",
      completedCount: [hasMorning, hasEvening, hasSleep].filter(Boolean).length,
      isPalm,
    });
  }

  // Determine most missed and best routine
  const routineCounts = [
    { id: "morning" as CategoryId, count: morningCompletedCount },
    { id: "evening" as CategoryId, count: eveningCompletedCount },
    { id: "before_sleep" as CategoryId, count: sleepCompletedCount },
  ];

  const totalRoutineCompletions = routineCounts.reduce((total, routine) => total + routine.count, 0);
  const lowest = routineCounts.reduce((current, routine) => (routine.count < current.count ? routine : current));
  const highest = routineCounts.reduce((current, routine) => (routine.count > current.count ? routine : current));
  const mostMissedRoutine = totalRoutineCompletions > 0 && lowest.count < 7 ? lowest.id : null;
  const bestRoutine = totalRoutineCompletions > 0 ? highest.id : null;

  return {
    days,
    morningCompletedCount,
    eveningCompletedCount,
    sleepCompletedCount,
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
    const entry = index.get(dayKey) ?? { categories: new Set<CategoryId>(), afterPrayers: new Set<string>() };
    const categories = entry.categories;
    const completedCount = countMainCompletions(categories);
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

export function getMonthGardenDaysForDates(
  index: DailyCompletionIndex,
  dates: Date[],
  dayNumbers: number[] = dates.map((date) => date.getDate()),
): MonthGardenDay[] {
  const todayKey = formatDayKey(new Date());
  return dates.map((date, dayIndex) => {
    const dayKey = formatDayKey(date);
    const entry = index.get(dayKey) ?? { categories: new Set<CategoryId>(), afterPrayers: new Set<string>() };
    const categories = entry.categories;
    const completedCount = countMainCompletions(categories);
    const isPalm = MAIN_CATEGORY_IDS.every((category) => categories.has(category));
    const status: MonthGardenDay["status"] = isPalm
      ? "complete"
      : completedCount > 0
        ? "partial"
        : dayKey > todayKey
          ? "empty"
          : "unstarted";
    return {
      dayKey,
      dayNum: dayNumbers[dayIndex] ?? dayIndex + 1,
      completedCount,
      isPalm,
      status,
      categories: Array.from(categories),
    };
  });
}

function summarizeMonthDays(days: MonthGardenDay[]): MonthDetailedStats {
  const daysInMonth = days.length;
  let fullDaysCount = 0;
  let totalActiveDays = 0;
  let totalCompletions = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  const routineCounts = new Map<CategoryId, number>(MAIN_CATEGORY_IDS.map((category) => [category, 0]));

  for (const day of days) {
    if (day.isPalm) {
      fullDaysCount += 1;
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
    if (day.completedCount > 0) {
      totalActiveDays += 1;
      totalCompletions += Math.min(4, day.completedCount);
    }
    day.categories.forEach((category) => {
      if (routineCounts.has(category)) routineCounts.set(category, routineCounts.get(category)! + 1);
    });
  }

  const best = [...routineCounts.entries()].reduce(
    (current, candidate) => (candidate[1] > current[1] ? candidate : current),
    ["morning" as CategoryId, 0] as [CategoryId, number],
  );
  return {
    days,
    fullDaysCount,
    totalActiveDays,
    completionRate: daysInMonth > 0 ? Math.round((totalCompletions / (daysInMonth * 4)) * 100) : 0,
    longestStreak,
    bestRoutine: totalCompletions > 0 ? best[0] : null,
    daysInMonth,
  };
}

export function getMonthDetailedStatsForDates(
  index: DailyCompletionIndex,
  dates: Date[],
  dayNumbers?: number[],
): MonthDetailedStats {
  return summarizeMonthDays(getMonthGardenDaysForDates(index, dates, dayNumbers));
}

export function getMonthDetailedStats(
  index: DailyCompletionIndex,
  year: number,
  zeroBasedMonth: number,
): MonthDetailedStats {
  return summarizeMonthDays(getMonthGardenDays(index, year, zeroBasedMonth));
}

export function getYearGardenStats(index: DailyCompletionIndex, year: number) {
  let totalPalms = 0;
  let totalCollections = 0;
  let activeDays = 0;

  for (const [dayKey, entry] of index) {
    if (!dayKey.startsWith(`${year}-`)) continue;
    const categories = entry.categories;
    const completedCount = countMainCompletions(categories);
    if (completedCount === 0) continue;
    activeDays += 1;
    totalCollections += completedCount;
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
  let bestMonthIndex: number | null = null;
  let bestMonthRate = 0;
  let totalPossibleAllYear = 0;

  let currentStreak = 0;
  let longestStreak = 0;
  const todayKey = formatDayKey(new Date());

  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    totalPossibleAllYear += daysInMonth * 4;
    let monthCompletions = 0;
    let fullDaysCount = 0;
    let activeDaysCount = 0;
    const dayCells: YearMonthHeatmap["dayCells"] = [];

    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(year, m, i + 1);
      const dayKey = formatDayKey(d);
      const entry = index.get(dayKey);
      const categories = entry ? entry.categories : new Set<CategoryId>();

      const count = countMainCompletions(categories);
      const isPalm = MAIN_CATEGORY_IDS.every((category) => categories.has(category));

      if (dayKey <= todayKey) {
        if (isPalm) {
          currentStreak++;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }

      if (isPalm) {
        fullDaysCount++;
        totalPalms++;
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
      dayCells.push({ dayNum: i + 1, level, isPalm });
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

  const routineCounts = [
    { id: "morning" as CategoryId, count: morningTotal },
    { id: "evening" as CategoryId, count: eveningTotal },
    { id: "before_sleep" as CategoryId, count: sleepTotal },
  ];
  const highest = routineCounts.reduce((current, routine) => (routine.count > current.count ? routine : current));
  const mostConsistentRoutine = totalCollections > 0 ? highest.id : null;

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

export function getYearDetailedStatsForPeriods(
  index: DailyCompletionIndex,
  periods: { dates: Date[]; dayNumbers?: number[] }[],
): YearDetailedStats {
  const months: YearMonthHeatmap[] = [];
  let totalPalms = 0;
  let totalCollections = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let currentStreak = 0;
  let bestMonthIndex: number | null = null;
  let bestMonthRate = 0;
  let totalPossibleAllYear = 0;
  const todayKey = formatDayKey(new Date());
  const routineCounts = new Map<CategoryId, number>(MAIN_CATEGORY_IDS.map((category) => [category, 0]));

  periods.forEach((period, monthIndex) => {
    const days = getMonthGardenDaysForDates(index, period.dates, period.dayNumbers);
    totalPossibleAllYear += days.length * 4;
    let monthCompletions = 0;
    let fullDaysCount = 0;
    let activeDaysCount = 0;

    days.forEach((day) => {
      if (day.dayKey <= todayKey) {
        if (day.isPalm) {
          currentStreak += 1;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      if (day.isPalm) {
        fullDaysCount += 1;
        totalPalms += 1;
      }
      if (day.completedCount > 0) {
        activeDaysCount += 1;
        activeDays += 1;
        monthCompletions += Math.min(4, day.completedCount);
        totalCollections += day.completedCount;
      }
      day.categories.forEach((category) => {
        if (routineCounts.has(category)) routineCounts.set(category, routineCounts.get(category)! + 1);
      });
    });

    const completionRate = days.length > 0 ? Math.round((monthCompletions / (days.length * 4)) * 100) : 0;
    if (completionRate > bestMonthRate) {
      bestMonthRate = completionRate;
      bestMonthIndex = monthIndex;
    }
    months.push({
      monthIndex,
      completionRate,
      fullDaysCount,
      activeDaysCount,
      dayCells: days.map((day) => ({
        dayNum: day.dayNum,
        level: day.isPalm ? 2 : day.completedCount > 0 ? 1 : 0,
        isPalm: day.isPalm,
      })),
    });
  });

  const bestRoutine = [...routineCounts.entries()].reduce(
    (current, candidate) => (candidate[1] > current[1] ? candidate : current),
    ["morning" as CategoryId, 0] as [CategoryId, number],
  );

  return {
    totalPalms,
    totalCollections,
    activeDays,
    overallCompletionRate: totalPossibleAllYear > 0 ? Math.round((totalCollections / totalPossibleAllYear) * 100) : 0,
    longestStreak,
    currentStreak,
    bestMonthIndex,
    bestMonthRate,
    mostConsistentRoutine: totalCollections > 0 ? bestRoutine[0] : null,
    months,
  };
}

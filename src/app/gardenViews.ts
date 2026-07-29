import { MAIN_CATEGORY_IDS } from "./progress";
import type { CategoryId, DailyCollectionCompletion } from "./types";

export type DailyCompletionIndex = Map<string, Set<CategoryId>>;

export type MonthGardenDay = {
  dayKey: string;
  dayNum: number;
  completedCount: number;
  isPalm: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
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

export function getMonthGardenDays(index: DailyCompletionIndex, year: number, zeroBasedMonth: number) {
  const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, dayIndex): MonthGardenDay => {
    const dayNum = dayIndex + 1;
    const dayKey = `${year}-${pad(zeroBasedMonth + 1)}-${pad(dayNum)}`;
    const categories = index.get(dayKey) ?? new Set<CategoryId>();
    return {
      dayKey,
      dayNum,
      completedCount: categories.size,
      isPalm: MAIN_CATEGORY_IDS.every((category) => categories.has(category)),
    };
  });
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

export const FRIDAY_KAHF_WEEK_KEY = "azkarapp.friday-kahf-week.v1";
export type FridaySalawatTarget = 10 | 100 | 1000;

export interface FridaySalawatProgress {
  count: number;
  target: FridaySalawatTarget;
}

export function getIsoWeekKey(date = new Date()): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function fridayChecklistKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-checklist.${week}`;
}

export function fridayKahfOpenedKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-kahf-opened.${week}`;
}

export function fridaySalawatKey(week = getIsoWeekKey()): string {
  return `azkarapp.friday-salawat.${week}`;
}

export function readFridaySalawatProgress(week = getIsoWeekKey()): FridaySalawatProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(fridaySalawatKey(week)) ?? "null") as Partial<FridaySalawatProgress>;
    const target = parsed?.target === 10 || parsed?.target === 1000 ? parsed.target : 100;
    const count = Number.isFinite(parsed?.count) ? Math.max(0, Math.floor(parsed.count!)) : 0;
    return { count, target };
  } catch {
    return { count: 0, target: 100 };
  }
}

export function writeFridaySalawatProgress(progress: FridaySalawatProgress, week = getIsoWeekKey()): void {
  try {
    localStorage.setItem(fridaySalawatKey(week), JSON.stringify(progress));
  } catch {
    // Counting remains usable in memory when storage is unavailable.
  }
}

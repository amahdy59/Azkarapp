import type { ZikrDayRecord } from "./types";
import { CATEGORY_ZIKR_IDS } from "./content/azkarIds";
import { isProgressDayKey } from "./progress";

export function isTrackedRoutine(category: string): category is ZikrDayRecord["category"] {
  return category === "morning" || category === "evening" || category === "before_sleep";
}

/** Additive, deterministic day/category union. Malformed or foreign IDs never
 * enter analytics. Old snapshots have no item history, rather than zero history. */
export function normalizeZikrHistory(value: unknown): ZikrDayRecord[] {
  const days = new Map<string, ZikrDayRecord>();
  for (const item of Array.isArray(value) ? value : []) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<ZikrDayRecord>;
    if (
      typeof row.dayKey !== "string" ||
      !isProgressDayKey(row.dayKey) ||
      !row.category ||
      !isTrackedRoutine(row.category)
    )
      continue;
    const valid = new Set(CATEGORY_ZIKR_IDS[row.category]);
    const ids = (input: unknown): string[] =>
      Array.isArray(input) ? input.filter((id): id is string => typeof id === "string" && valid.has(id)) : [];
    const offered = ids(row.offeredIds);
    if (!offered.length) continue;
    const key = `${row.dayKey}:${row.category}`;
    const existing = days.get(key);
    const offeredIds = [...new Set([...(existing?.offeredIds ?? []), ...offered])].sort();
    const completedIds = [
      ...new Set([...(existing?.completedIds ?? []), ...ids(row.completedIds).filter((id) => offered.includes(id))]),
    ].sort();
    days.set(key, { dayKey: row.dayKey, category: row.category, offeredIds, completedIds });
  }
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => row);
}

export function mergeZikrHistory(a: unknown, b: unknown): ZikrDayRecord[] {
  return normalizeZikrHistory([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]);
}

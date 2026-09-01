import {
  FRIDAY_PRACTICE_IDS,
  fridayChecklistKey,
  fridayKahfOpenedKey,
  readFridaySalawatProgress,
} from "./fridayProgress";

/** The sunan the Friday companion tracks, counted from the canonical list. */
export const FRIDAY_PRACTICE_COUNT = FRIDAY_PRACTICE_IDS.length;

export interface FridaySummary {
  kahfOpened: boolean;
  salawatCount: number;
  salawatTarget: number;
  practicesDone: number;
  practicesTotal: number;
}

/**
 * Reads the current Friday cycle straight out of storage.
 *
 * The companion owns this data and writes it directly to localStorage rather
 * than through app state, so Progress reads the same keys instead of
 * duplicating the tracking. Everything is scoped to the current cycle, which
 * means this reports an empty Friday the moment the last one ends.
 */
export function getFridaySummary(cycle?: string): FridaySummary {
  const salawat = readFridaySalawatProgress(cycle);
  let practicesDone = 0;
  let kahfOpened = false;

  try {
    const stored: unknown = JSON.parse(localStorage.getItem(fridayChecklistKey(cycle)) ?? "[]");
    practicesDone = Array.isArray(stored)
      ? Math.min(FRIDAY_PRACTICE_COUNT, new Set(stored.filter((id) => typeof id === "string")).size)
      : 0;
    kahfOpened = localStorage.getItem(fridayKahfOpenedKey(cycle)) === "true";
  } catch {
    // An unreadable store reports an empty Friday rather than breaking Progress.
  }

  return {
    kahfOpened,
    salawatCount: salawat.count,
    salawatTarget: salawat.target,
    practicesDone,
    practicesTotal: FRIDAY_PRACTICE_COUNT,
  };
}

import { JUZS } from "../content/surahInfo";
import { TOTAL_MUSHAF_PAGES } from "./quranWirdGoal";
import type { QuranReadingPosition, QuranWirdPlan } from "../types";

export interface QuranOverallProgressStats {
  /** Unique pages read across all recorded history. */
  totalUniquePagesRead: number;
  /** Overall percentage of the complete 604-page Mushaf read (0–100). */
  mushafCompletionPercent: number;
  /** Number of complete Juzs (1–30) where every page has been completed. */
  completedJuzsCount: number;
  /** Total pages in current plan scope. */
  planTotalPages: number;
  /** Pages completed towards the current plan. */
  planPagesCompleted: number;
  /** Percentage completed towards current plan (0–100). */
  planCompletionPercent: number;
}

export function getJuzPageRange(juzNum: number): { startPage: number; endPage: number } {
  const juz = JUZS.find((j) => j.number === juzNum) ?? JUZS[0]!;
  if (juzNum >= 30) return { startPage: juz.startPage, endPage: TOTAL_MUSHAF_PAGES };
  const nextJuz = JUZS.find((j) => j.number === juzNum + 1);
  const endPage = nextJuz ? nextJuz.startPage - 1 : TOTAL_MUSHAF_PAGES;
  return { startPage: juz.startPage, endPage };
}

export function computeQuranProgressStats(
  plan: QuranWirdPlan | undefined,
  wirdHistory: Record<string, number[]>,
  _position: QuranReadingPosition,
): QuranOverallProgressStats {
  const allReadPages = new Set<number>();
  for (const pages of Object.values(wirdHistory)) {
    for (const p of pages) {
      if (p >= 1 && p <= TOTAL_MUSHAF_PAGES) {
        allReadPages.add(p);
      }
    }
  }

  const totalUniquePagesRead = allReadPages.size;
  const mushafCompletionPercent = Math.min(100, Math.round((totalUniquePagesRead / TOTAL_MUSHAF_PAGES) * 100));

  let completedJuzsCount = 0;
  for (const juz of JUZS) {
    const { startPage, endPage } = getJuzPageRange(juz.number);
    let allInJuz = true;
    for (let p = startPage; p <= endPage; p++) {
      if (!allReadPages.has(p)) {
        allInJuz = false;
        break;
      }
    }
    if (allInJuz) completedJuzsCount++;
  }

  let planTotalPages = TOTAL_MUSHAF_PAGES;
  let planPagesCompleted = totalUniquePagesRead;

  if (plan?.kind === "repeating") {
    const start = plan.repeatStartPage ?? 1;
    const end = plan.repeatEndPage ?? TOTAL_MUSHAF_PAGES;
    planTotalPages = Math.max(1, end - start + 1);
    let readInScope = 0;
    for (let p = start; p <= end; p++) {
      if (allReadPages.has(p)) readInScope++;
    }
    planPagesCompleted = readInScope;
  } else if (plan?.startPage && plan?.targetPage) {
    const start = plan.startPage;
    const target = plan.targetPage;
    planTotalPages = Math.max(1, target - start + 1);
    const planHistory = Object.entries(wirdHistory)
      .filter(([dayKey]) => !plan.startedDayKey || dayKey >= plan.startedDayKey)
      .flatMap(([, pages]) => pages)
      .filter((p) => p >= start && p <= target);
    planPagesCompleted = new Set(planHistory).size;
  }

  const planCompletionPercent = Math.min(100, Math.round((planPagesCompleted / Math.max(1, planTotalPages)) * 100));

  return {
    totalUniquePagesRead,
    mushafCompletionPercent,
    completedJuzsCount,
    planTotalPages,
    planPagesCompleted,
    planCompletionPercent,
  };
}

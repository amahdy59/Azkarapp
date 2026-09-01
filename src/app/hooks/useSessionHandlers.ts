import { useCallback, useState } from "react";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  RoutineCategoryId,
  RoutineMode,
  View,
} from "../types";
import { MAX_STORED_SESSIONS, type StoredSession } from "../state";
import { getAzkarForMode, getAzkarForPrayer, isRoutineCategory } from "../content/azkar";
import { isPrayerName } from "../content/prayerTimes";
import {
  getFirstIncompleteZikrIndex,
  getNextIncompleteIndex,
  getNextIncompleteZikrIndex,
  recordDailyCollectionCompletion,
  getEffectiveCompletedForSubcategory,
  prefixZikrId,
  type GrowthEvent,
} from "../progress";
import { t } from "../i18n";

export function useSessionHandlers({
  activeCat,
  setActiveCat,
  activeSubCategory,
  setActiveSubCategory,
  activeIdx: _activeIdx,
  setActiveIdx,
  completed,
  setCompleted,
  dailyCompletions,
  setDailyCompletions,
  onAfterPrayerCompleted,
  setLastGrowthEvent,
  setSessions,
  setSavedZikrIds,
  progressDayStartHour,
  selectedLang,
  routineModes,
  setRoutineModes,
  push,
  pop,
  setView,
  setActiveTab,
  showConfirm,
}: {
  activeCat: CategoryId;
  setActiveCat: (cat: CategoryId) => void;
  activeSubCategory?: string;
  setActiveSubCategory: (subCat?: string) => void;
  activeIdx: number;
  setActiveIdx: React.Dispatch<React.SetStateAction<number>>;
  completed: Record<CategoryId, Set<string>>;
  setCompleted: React.Dispatch<React.SetStateAction<Record<CategoryId, Set<string>>>>;
  dailyCompletions: DailyCollectionCompletion[];
  setDailyCompletions: (records: DailyCollectionCompletion[]) => void;
  /**
   * Reading a prayer's azkar to the end is the strongest possible evidence
   * that they were read, so it records the tracking too.
   *
   * The two lived apart: the prayer card's "adhkar" checkbox came from
   * `prayerTracking` while the after-prayer dots came from `dailyCompletions`,
   * and neither wrote the other. A reader who opened Fajr's azkar from the card
   * and finished them came back to an unticked box and had to say so a second
   * time by hand. Only this direction is inferred — ticking the box is a
   * self-report and does not claim the collection was read.
   */
  onAfterPrayerCompleted?: (prayer: string) => void;
  setLastGrowthEvent: (event: GrowthEvent | null) => void;
  setSessions: React.Dispatch<React.SetStateAction<StoredSession[]>>;
  setSavedZikrIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  progressDayStartHour: number;
  selectedLang: AppLanguage;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  setRoutineModes: React.Dispatch<React.SetStateAction<Record<RoutineCategoryId, RoutineMode>>>;
  push: (to: View) => void;
  pop: () => void;
  setView: (view: View) => void;
  setActiveTab: (tab: "home" | "azkar" | "progress" | "settings") => void;
  showConfirm: (
    title: string,
    description: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: () => void | Promise<void>,
    destructive?: boolean,
  ) => void;
}) {
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [isRepeatSession, setIsRepeatSession] = useState(false);
  const [repeatCompleted, setRepeatCompleted] = useState<Set<number>>(() => new Set());
  const modeFor = (catId: CategoryId): RoutineMode => (isRoutineCategory(catId) ? routineModes[catId] : "complete");
  const sessionAzkar = (
    catId: CategoryId,
    mode = modeFor(catId),
    subCat = catId === activeCat ? activeSubCategory : undefined,
  ) =>
    catId === "after_prayer" && isPrayerName(subCat) ? getAzkarForPrayer(subCat, mode) : getAzkarForMode(catId, mode);

  const handleResetCategory = (catId: CategoryId, subCat?: string) => {
    showConfirm(
      t(selectedLang, "category.resetConfirmTitle"),
      t(selectedLang, "category.resetConfirm"),
      t(selectedLang, "common.reset"),
      t(selectedLang, "common.cancel"),
      () => {
        setCompleted((prev) => {
          const next = { ...prev };
          if (catId === "after_prayer" && subCat) {
            next[catId] = new Set([...next[catId]].filter((id) => !id.startsWith(`${subCat}:`)));
          } else {
            next[catId] = new Set();
          }
          return next;
        });
      },
      true,
    );
  };

  const openCategory = (catId: CategoryId) => {
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    setActiveCat(catId);
    setActiveSubCategory(undefined);
    setActiveTab("azkar");
    push("category");
  };

  const openReader = (catId: CategoryId, i: number, modeOverride?: RoutineMode, subCat?: string) => {
    if (modeOverride && isRoutineCategory(catId)) {
      setRoutineModes((previous) => ({ ...previous, [catId]: modeOverride }));
    }
    setActiveCat(catId);
    setActiveSubCategory(subCat);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
  };

  const resumeCategory = (catId: CategoryId, subCat?: string) => {
    const nextIndex = getFirstIncompleteZikrIndex(
      sessionAzkar(catId, modeFor(catId), subCat),
      getEffectiveCompletedForSubcategory(completed, catId, subCat),
    );
    openReader(catId, nextIndex ?? 0, undefined, subCat);
  };

  const repeatCategory = (catId: CategoryId, subCat?: string) => {
    setIsRepeatSession(true);
    setRepeatCompleted(new Set());
    openReader(catId, 0, undefined, subCat);
  };

  const leaveReader = () => {
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    pop();
  };

  const toggleSavedZikr = useCallback(
    (zikrId: string) => {
      setSavedZikrIds((previous) => {
        const next = new Set(previous);
        if (next.has(zikrId)) {
          next.delete(zikrId);
        } else {
          next.add(zikrId);
        }
        return next;
      });
    },
    [setSavedZikrIds],
  );

  const markComplete = (idx: number) => {
    const azkar = sessionAzkar(activeCat);
    const zikrId = azkar[idx]?.id;
    if (!zikrId) {
      return;
    }
    const effectiveCompleted = getEffectiveCompletedForSubcategory(completed, activeCat, activeSubCategory);
    const canonicalCollectionWasAlreadyComplete = azkar.every((zikr) => effectiveCompleted.has(zikr.id));

    if (isRepeatSession) {
      const effectiveProgress = new Set(repeatCompleted);
      effectiveProgress.add(idx);
      setRepeatCompleted((previous) => new Set(previous).add(idx));
      if (
        canonicalCollectionWasAlreadyComplete ||
        getNextIncompleteIndex(azkar.length, effectiveProgress, idx) !== null
      ) {
        return;
      }
    } else {
      const prefixedId = prefixZikrId(activeCat, zikrId, activeSubCategory);
      effectiveCompleted.add(zikrId); // Optimistically add for getNextIncompleteZikrIndex

      setCompleted((prev) => {
        const updated = new Set(prev[activeCat]);
        updated.add(prefixedId);
        return { ...prev, [activeCat]: updated };
      });
      if (
        canonicalCollectionWasAlreadyComplete ||
        getNextIncompleteZikrIndex(azkar, effectiveCompleted, idx) !== null
      ) {
        return;
      }
    }

    const completedAt = new Date();
    const completionLevel = modeFor(activeCat);
    const growth = recordDailyCollectionCompletion(
      dailyCompletions,
      activeCat,
      completedAt,
      progressDayStartHour,
      completionLevel,
      activeSubCategory,
    );
    setDailyCompletions(growth.records);
    if (activeCat === "after_prayer" && activeSubCategory) onAfterPrayerCompleted?.(activeSubCategory);
    setLastGrowthEvent(growth.event);
    setSessions((prev) =>
      [
        {
          id: `${activeCat}-${completedAt.getTime()}`,
          category: activeCat,
          completedAt: completedAt.toISOString(),
          completedCount: azkar.length,
          totalCount: azkar.length,
          durationSeconds: Math.max(1, Math.round((Date.now() - sessionStart) / 1000)),
          isComplete: true,
          completionLevel,
        },
        ...prev,
      ].slice(0, MAX_STORED_SESSIONS),
    );

    if (activeCat === "after_prayer") {
      // With independent tracking per prayer, we no longer wipe the entire after_prayer completions!
      // The progress logic will know it's complete via `dailyCompletions`
    }
  };

  const toggleZikrCompletion = (catId: CategoryId, idx: number) => {
    const azkar = sessionAzkar(catId);
    const zikrId = azkar[idx]?.id;
    if (!zikrId) {
      return;
    }
    const prefixedId = prefixZikrId(catId, zikrId, activeSubCategory);
    const setForCat = new Set(completed[catId] ?? new Set());
    const wasCompleted = setForCat.has(prefixedId);

    if (wasCompleted) {
      setForCat.delete(prefixedId);
    } else {
      setForCat.add(prefixedId);
    }

    setCompleted((prev) => ({
      ...prev,
      [catId]: setForCat,
    }));

    // Re-check completion using getEffectiveCompletedForSubcategory to see if the whole thing is done
    const effectiveNow = getEffectiveCompletedForSubcategory(completed, catId, activeSubCategory);
    if (!wasCompleted) effectiveNow.add(zikrId);
    else effectiveNow.delete(zikrId);

    if (!wasCompleted && azkar.every((zikr) => effectiveNow.has(zikr.id))) {
      const completedAt = new Date();
      const growth = recordDailyCollectionCompletion(
        dailyCompletions,
        catId,
        completedAt,
        progressDayStartHour,
        modeFor(catId),
        activeSubCategory,
      );
      setDailyCompletions(growth.records);
      if (catId === "after_prayer" && activeSubCategory) onAfterPrayerCompleted?.(activeSubCategory);
      setLastGrowthEvent(growth.event);
    }
  };

  const advanceAfterCompletion = (idx: number) => {
    const azkar = sessionAzkar(activeCat);
    const zikrId = azkar[idx]?.id;
    if (!zikrId) {
      pop();
      return;
    }
    const effectiveCompleted = getEffectiveCompletedForSubcategory(completed, activeCat, activeSubCategory);
    const canonicalCollectionWasAlreadyComplete = azkar.every((zikr) => effectiveCompleted.has(zikr.id));
    if (!isRepeatSession && canonicalCollectionWasAlreadyComplete) {
      pop();
      return;
    }

    const nextIncomplete = isRepeatSession
      ? getNextIncompleteIndex(azkar.length, new Set(repeatCompleted).add(idx), idx)
      : getNextIncompleteZikrIndex(azkar, effectiveCompleted.add(zikrId), idx);

    if (nextIncomplete !== null) {
      setActiveIdx(nextIncomplete);
    } else {
      setIsRepeatSession(false);
      setRepeatCompleted(new Set());
      setView("completion");
    }
  };

  const goHome = () => {
    setView("home");
    setActiveTab("home");
  };

  return {
    sessionStart,
    isRepeatSession,
    repeatCompleted,
    handleResetCategory,
    openCategory,
    openReader,
    resumeCategory,
    repeatCategory,
    leaveReader,
    toggleSavedZikr,
    markComplete,
    toggleZikrCompletion,
    advanceAfterCompletion,
    goHome,
  };
}

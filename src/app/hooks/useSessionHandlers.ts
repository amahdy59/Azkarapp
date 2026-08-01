import { useCallback, useState } from "react";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  RoutineCategoryId,
  RoutineMode,
  View,
} from "../types";
import type { StoredSession } from "../state";
import { getAzkarForMode, isRoutineCategory, registerLazyCollection } from "../content/azkar";
import {
  getFirstIncompleteZikrIndex,
  getNextIncompleteIndex,
  getNextIncompleteZikrIndex,
  recordDailyCollectionCompletion,
  type GrowthEvent,
} from "../progress";
import { t } from "../i18n";

export function useSessionHandlers({
  activeCat,
  setActiveCat,
  activeIdx: _activeIdx,
  setActiveIdx,
  completed,
  setCompleted,
  dailyCompletions,
  setDailyCompletions,
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
  activeIdx: number;
  setActiveIdx: React.Dispatch<React.SetStateAction<number>>;
  completed: Record<CategoryId, Set<string>>;
  setCompleted: React.Dispatch<React.SetStateAction<Record<CategoryId, Set<string>>>>;
  dailyCompletions: DailyCollectionCompletion[];
  setDailyCompletions: (records: DailyCollectionCompletion[]) => void;
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
    onConfirm: () => void,
    destructive?: boolean,
  ) => void;
}) {
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [isRepeatSession, setIsRepeatSession] = useState(false);
  const [repeatCompleted, setRepeatCompleted] = useState<Set<number>>(() => new Set());
  const modeFor = (catId: CategoryId): RoutineMode => (isRoutineCategory(catId) ? routineModes[catId] : "complete");
  const sessionAzkar = (catId: CategoryId, mode = modeFor(catId)) => getAzkarForMode(catId, mode);

  const handleResetCategory = (catId: CategoryId) => {
    showConfirm(
      t(selectedLang, "category.resetConfirmTitle"),
      t(selectedLang, "category.resetConfirm"),
      t(selectedLang, "common.reset"),
      t(selectedLang, "common.cancel"),
      () => {
        setCompleted((prev) => {
          const next = { ...prev };
          next[catId] = new Set();
          return next;
        });
      },
      true,
    );
  };

  const openCategory = async (catId: CategoryId) => {
    if (catId === "comprehensive_duas") {
      const { COMPREHENSIVE_DUAS } = await import("../content/comprehensiveDuas");
      registerLazyCollection(catId, COMPREHENSIVE_DUAS);
    }
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    setActiveCat(catId);
    setActiveTab("azkar");
    push("category");
  };

  const openReader = (catId: CategoryId, i: number, modeOverride?: RoutineMode) => {
    if (modeOverride && isRoutineCategory(catId)) {
      setRoutineModes((previous) => ({ ...previous, [catId]: modeOverride }));
    }
    setActiveCat(catId);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
  };

  const resumeCategory = (catId: CategoryId) => {
    const nextIndex = getFirstIncompleteZikrIndex(sessionAzkar(catId), completed[catId] ?? []);
    openReader(catId, nextIndex ?? 0);
  };

  const repeatCategory = (catId: CategoryId) => {
    setIsRepeatSession(true);
    setRepeatCompleted(new Set());
    openReader(catId, 0);
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
    const canonicalCollectionWasAlreadyComplete = azkar.every((zikr) => completed[activeCat].has(zikr.id));

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
      const effectiveProgress = new Set(completed[activeCat]);
      effectiveProgress.add(zikrId);
      setCompleted((prev) => {
        const updated = new Set(prev[activeCat]);
        updated.add(zikrId);
        return { ...prev, [activeCat]: updated };
      });
      if (canonicalCollectionWasAlreadyComplete || getNextIncompleteZikrIndex(azkar, effectiveProgress, idx) !== null) {
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
    );
    setDailyCompletions(growth.records);
    setLastGrowthEvent(growth.event);
    setSessions((prev) => [
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
    ]);

    if (activeCat === "after_prayer") {
      setCompleted((prev) => ({ ...prev, after_prayer: new Set() }));
    }
  };

  const toggleZikrCompletion = (catId: CategoryId, idx: number) => {
    const azkar = sessionAzkar(catId);
    const zikrId = azkar[idx]?.id;
    if (!zikrId) {
      return;
    }
    const setForCat = new Set(completed[catId] ?? new Set());
    const wasCompleted = setForCat.has(zikrId);

    if (wasCompleted) {
      setForCat.delete(zikrId);
    } else {
      setForCat.add(zikrId);
    }

    setCompleted((prev) => ({
      ...prev,
      [catId]: setForCat,
    }));

    if (!wasCompleted && azkar.every((zikr) => setForCat.has(zikr.id))) {
      const completedAt = new Date();
      const growth = recordDailyCollectionCompletion(
        dailyCompletions,
        catId,
        completedAt,
        progressDayStartHour,
        modeFor(catId),
      );
      setDailyCompletions(growth.records);
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
    const canonicalCollectionWasAlreadyComplete = azkar.every((zikr) => completed[activeCat].has(zikr.id));
    if (!isRepeatSession && canonicalCollectionWasAlreadyComplete) {
      pop();
      return;
    }

    const nextIncomplete = isRepeatSession
      ? getNextIncompleteIndex(azkar.length, new Set(repeatCompleted).add(idx), idx)
      : getNextIncompleteZikrIndex(azkar, new Set(completed[activeCat]).add(zikrId), idx);

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

import { useCallback, useState } from "react";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, View } from "../types";
import type { StoredSession } from "../state";
import { getAzkarByCategory } from "../content/azkar";
import { getNextIncompleteIndex, recordDailyCollectionCompletion, type GrowthEvent } from "../progress";
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
  completed: Record<CategoryId, Set<number>>;
  setCompleted: React.Dispatch<React.SetStateAction<Record<CategoryId, Set<number>>>>;
  dailyCompletions: DailyCollectionCompletion[];
  setDailyCompletions: (records: DailyCollectionCompletion[]) => void;
  setLastGrowthEvent: (event: GrowthEvent | null) => void;
  setSessions: React.Dispatch<React.SetStateAction<StoredSession[]>>;
  setSavedZikrIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  progressDayStartHour: number;
  selectedLang: AppLanguage;
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

  const openCategory = (catId: CategoryId) => {
    setIsRepeatSession(false);
    setRepeatCompleted(new Set());
    setActiveCat(catId);
    setActiveTab("azkar");
    push("category");
  };

  const openReader = (catId: CategoryId, i: number) => {
    setActiveCat(catId);
    setActiveIdx(i);
    setSessionStart(Date.now());
    push("reader");
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
    const azkar = getAzkarByCategory(activeCat);
    const canonicalCollectionWasAlreadyComplete = azkar.every((_, itemIndex) => completed[activeCat].has(itemIndex));
    const effectiveProgress = new Set(isRepeatSession ? repeatCompleted : completed[activeCat]);
    effectiveProgress.add(idx);

    if (isRepeatSession) {
      setRepeatCompleted((previous) => new Set(previous).add(idx));
    } else {
      setCompleted((prev) => {
        const updated = new Set(prev[activeCat]);
        updated.add(idx);
        return { ...prev, [activeCat]: updated };
      });
    }

    if (
      (!isRepeatSession && canonicalCollectionWasAlreadyComplete) ||
      getNextIncompleteIndex(azkar.length, effectiveProgress, idx) !== null
    ) {
      return;
    }

    const completedAt = new Date();
    const growth = recordDailyCollectionCompletion(dailyCompletions, activeCat, completedAt, progressDayStartHour);
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
      },
      ...prev,
    ]);
  };

  const toggleZikrCompletion = (catId: CategoryId, idx: number) => {
    const azkar = getAzkarByCategory(catId);
    const setForCat = new Set(completed[catId] ?? new Set());
    const wasCompleted = setForCat.has(idx);

    if (wasCompleted) {
      setForCat.delete(idx);
    } else {
      setForCat.add(idx);
    }

    setCompleted((prev) => ({
      ...prev,
      [catId]: setForCat,
    }));

    if (!wasCompleted && setForCat.size === azkar.length) {
      const completedAt = new Date();
      const growth = recordDailyCollectionCompletion(dailyCompletions, catId, completedAt, progressDayStartHour);
      setDailyCompletions(growth.records);
      setLastGrowthEvent(growth.event);
    }
  };

  const advanceAfterCompletion = (idx: number) => {
    const azkar = getAzkarByCategory(activeCat);
    const canonicalCollectionWasAlreadyComplete = azkar.every((_, itemIndex) => completed[activeCat].has(itemIndex));
    if (!isRepeatSession && canonicalCollectionWasAlreadyComplete) {
      pop();
      return;
    }

    const effectiveProgress = new Set(isRepeatSession ? repeatCompleted : completed[activeCat]);
    effectiveProgress.add(idx);
    const nextIncomplete = getNextIncompleteIndex(azkar.length, effectiveProgress, idx);

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
    repeatCategory,
    leaveReader,
    toggleSavedZikr,
    markComplete,
    toggleZikrCompletion,
    advanceAfterCompletion,
    goHome,
  };
}

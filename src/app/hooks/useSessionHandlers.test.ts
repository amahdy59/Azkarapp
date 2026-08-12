import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAzkarForMode } from "../content/azkar";
import type { GrowthEvent } from "../progress";
import { DEFAULT_APP_STATE, MAX_STORED_SESSIONS, toCompletedSets, type StoredSession } from "../state";
import type { CategoryId, DailyCollectionCompletion, RoutineMode, View } from "../types";
import { useSessionHandlers } from "./useSessionHandlers";

const FIXED_NOW = new Date("2026-08-12T09:00:00.000Z");

function createCompleted(overrides: Partial<Record<CategoryId, Set<string>>> = {}) {
  return { ...toCompletedSets(DEFAULT_APP_STATE.completed), ...overrides };
}

function renderSessionHarness({
  activeCat = "morning",
  completed = createCompleted(),
  dailyCompletions = [],
  sessions = [],
}: {
  activeCat?: CategoryId;
  completed?: Record<CategoryId, Set<string>>;
  dailyCompletions?: DailyCollectionCompletion[];
  sessions?: StoredSession[];
} = {}) {
  const push = vi.fn<(view: View) => void>();
  const pop = vi.fn();
  const showConfirm = vi.fn((_: string, __: string, ___: string, ____: string, onConfirm: () => void) => onConfirm());

  const hook = renderHook(() => {
    const [category, setCategory] = useState<CategoryId>(activeCat);
    const [index, setIndex] = useState(0);
    const [completionState, setCompletionState] = useState(completed);
    const [completionRecords, setCompletionRecords] = useState(dailyCompletions);
    const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
    const [sessionState, setSessionState] = useState(sessions);
    const [savedIds, setSavedIds] = useState(new Set<string>());
    const [routineModes, setRoutineModes] = useState(DEFAULT_APP_STATE.settings.routineModes);
    const [view, setView] = useState<View>("reader");
    const [activeTab, setActiveTab] = useState<"home" | "azkar" | "progress" | "settings">("azkar");
    const handlers = useSessionHandlers({
      activeCat: category,
      setActiveCat: setCategory,
      activeIdx: index,
      setActiveIdx: setIndex,
      completed: completionState,
      setCompleted: setCompletionState,
      dailyCompletions: completionRecords,
      setDailyCompletions: setCompletionRecords,
      setLastGrowthEvent: setGrowthEvent,
      setSessions: setSessionState,
      setSavedZikrIds: setSavedIds,
      progressDayStartHour: 4,
      selectedLang: "en",
      routineModes,
      setRoutineModes,
      push,
      pop,
      setView,
      setActiveTab,
      showConfirm,
    });
    return {
      activeTab,
      category,
      completed: completionState,
      dailyCompletions: completionRecords,
      growthEvent,
      handlers,
      index,
      routineModes,
      savedIds,
      sessions: sessionState,
      view,
    };
  });

  return { ...hook, pop, push, showConfirm };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => vi.useRealTimers());

describe("useSessionHandlers", () => {
  it("records a final completion once and caps session history", () => {
    const items = getAzkarForMode("morning", "complete");
    const previous = Array.from({ length: MAX_STORED_SESSIONS }, (_, index) => ({
      id: `old-${index}`,
      category: "morning" as const,
      completedAt: new Date(FIXED_NOW.getTime() - index - 1).toISOString(),
      completedCount: 1,
      totalCount: 1,
      durationSeconds: 1,
      isComplete: true,
      completionLevel: "complete" as RoutineMode,
    }));
    const { result } = renderSessionHarness({
      completed: createCompleted({ morning: new Set(items.slice(0, -1).map((item) => item.id)) }),
      sessions: previous,
    });

    act(() => result.current.handlers.markComplete(items.length - 1));

    expect(result.current.completed.morning).toContain(items.at(-1)?.id);
    expect(result.current.dailyCompletions).toHaveLength(1);
    expect(result.current.growthEvent).not.toBeNull();
    expect(result.current.sessions).toHaveLength(MAX_STORED_SESSIONS);
    expect(result.current.sessions[0]?.id).toBe(`morning-${FIXED_NOW.getTime()}`);
  });

  it("does not duplicate the daily ledger and ignores invalid indexes", () => {
    const items = getAzkarForMode("morning", "complete");
    const first = renderSessionHarness();
    act(() => first.result.current.handlers.markComplete(999));
    expect(first.result.current.dailyCompletions).toEqual([]);
    expect(first.result.current.sessions).toEqual([]);

    const existing: DailyCollectionCompletion = {
      dayKey: "2026-08-12",
      category: "morning",
      timeZone: "UTC",
      completionLevel: "complete",
    };
    const duplicate = renderSessionHarness({
      completed: createCompleted({ morning: new Set(items.slice(0, -1).map((item) => item.id)) }),
      dailyCompletions: [existing],
    });
    act(() => duplicate.result.current.handlers.markComplete(items.length - 1));
    expect(duplicate.result.current.dailyCompletions).toHaveLength(1);
  });

  it("clears the transient after-prayer set after logging completion", () => {
    const items = getAzkarForMode("after_prayer", "complete");
    const { result } = renderSessionHarness({
      activeCat: "after_prayer",
      completed: createCompleted({ after_prayer: new Set(items.slice(0, -1).map((item) => item.id)) }),
    });

    act(() => result.current.handlers.markComplete(items.length - 1));

    expect(result.current.completed.after_prayer.size).toBe(0);
    expect(result.current.dailyCompletions[0]?.category).toBe("after_prayer");
    expect(result.current.sessions[0]?.category).toBe("after_prayer");
  });

  it("keeps canonical progress intact during repeat sessions and advances to completion", () => {
    const items = getAzkarForMode("morning", "complete");
    const canonical = new Set(items.map((item) => item.id));
    const { result } = renderSessionHarness({ completed: createCompleted({ morning: canonical }) });

    act(() => result.current.handlers.repeatCategory("morning"));
    expect(result.current.handlers.isRepeatSession).toBe(true);

    for (let index = 0; index < items.length; index += 1) {
      act(() => result.current.handlers.markComplete(index));
    }
    act(() => result.current.handlers.advanceAfterCompletion(items.length - 1));

    expect(result.current.completed.morning).toEqual(canonical);
    expect(result.current.dailyCompletions).toEqual([]);
    expect(result.current.view).toBe("completion");
  });

  it("updates navigation, mode overrides, saved state, and reset confirmation", () => {
    const { result, push, showConfirm } = renderSessionHarness();

    act(() => result.current.handlers.openReader("morning", 2, "core"));
    expect(result.current.index).toBe(2);
    expect(result.current.routineModes.morning).toBe("core");
    expect(push).toHaveBeenLastCalledWith("reader");

    act(() => result.current.handlers.toggleSavedZikr("m-hm-75"));
    expect(result.current.savedIds).toContain("m-hm-75");
    act(() => result.current.handlers.toggleSavedZikr("m-hm-75"));
    expect(result.current.savedIds).not.toContain("m-hm-75");

    act(() => result.current.handlers.handleResetCategory("morning"));
    expect(showConfirm).toHaveBeenCalledOnce();
    expect(result.current.completed.morning.size).toBe(0);
  });
});

import type { LearningEditionId, LearningLanguage } from "./types";

export const LEARNING_STATE_KEY = "azkar.learning.v1";
export interface LearningReadingState {
  position?: { unitId: string; offset: number };
  bookmarks: string[];
  contentLanguage?: LearningLanguage;
}
export type LearningState = Partial<Record<LearningEditionId, LearningReadingState>>;
const ids: LearningEditionId[] = ["al-mukhtar", "dalil-al-mutamir", "al-wird-an-nabawi", "dalil-al-mutamir:en"];
const validUnit = (id: unknown): id is string => typeof id === "string" && /^p-[1-9]\d{0,3}$/.test(id);

export function normalizeLearningState(value: unknown): LearningState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: LearningState = {};
  for (const id of ids) {
    const raw = (value as Record<string, unknown>)[id];
    if (!raw || typeof raw !== "object") continue;
    const { bookmarks, position, contentLanguage } = raw as Partial<LearningReadingState>;
    result[id] = {
      bookmarks: Array.isArray(bookmarks) ? [...new Set(bookmarks.filter(validUnit))].slice(0, 1000) : [],
      ...(id === "dalil-al-mutamir" && (contentLanguage === "ar" || contentLanguage === "en")
        ? { contentLanguage }
        : {}),
      ...(position && validUnit(position.unitId) && Number.isFinite(position.offset)
        ? { position: { unitId: position.unitId, offset: Math.max(0, Math.min(1, position.offset)) } }
        : {}),
    };
  }
  return result;
}

let state: LearningState | undefined;
let storedValue: string | null | undefined;
const listeners = new Set<() => void>();
export function readLearningState(): LearningState {
  try {
    const raw = window.localStorage.getItem(LEARNING_STATE_KEY);
    if (!state || raw !== storedValue) {
      state = normalizeLearningState(JSON.parse(raw || "{}"));
      storedValue = raw;
    }
  } catch {
    state ??= {};
  }
  return state;
}

const notifyState = () => {
  for (const notify of listeners) notify();
};
const onStorage = (event: StorageEvent) => {
  if (event.key !== LEARNING_STATE_KEY && event.key !== null) return;
  state = undefined;
  notifyState();
};
const onPrivateClear = () =>
  queueMicrotask(() => {
    state = undefined;
    notifyState();
  });
export function subscribeLearningState(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener("storage", onStorage);
    window.addEventListener("azkar-private-data-cleared", onPrivateClear);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("azkar-private-data-cleared", onPrivateClear);
    }
  };
}

/** This device-only boundary deliberately never enters daily progress or account sync. */
export function updateLearningState(
  id: LearningEditionId,
  change: (previous: LearningReadingState) => LearningReadingState,
): boolean {
  state = normalizeLearningState({
    ...readLearningState(),
    [id]: change(readLearningState()[id] || { bookmarks: [] }),
  });
  let persisted = true;
  try {
    const raw = JSON.stringify(state);
    window.localStorage.setItem(LEARNING_STATE_KEY, raw);
    storedValue = raw;
  } catch {
    persisted = false;
  }
  for (const notify of listeners) notify();
  return persisted;
}

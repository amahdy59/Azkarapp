import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppStateWriter,
  createAppStateReader,
  DEFAULT_APP_STATE,
  loadAppState,
  normalizeAppState,
  resetStoredSettings,
  saveAppState,
} from "./state";
import { getProgressDayKey } from "./progress";

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("boot-owned snapshot reader", () => {
  it("reuses unchanged normalized data and reloads changed or removed storage", () => {
    saveAppState(DEFAULT_APP_STATE);
    const read = createAppStateReader();
    const original = read();
    expect(read()).toBe(original);
    saveAppState({ ...DEFAULT_APP_STATE, khatmahPage: 51 });
    const changed = read();
    expect(changed).not.toBe(original);
    expect(changed.khatmahPage).toBe(51);
    localStorage.removeItem("azkarapp.state.v1");
    expect(read().khatmahPage).toBe(1);
  });

  it("renormalizes at the devotional boundary rather than restoring yesterday's partial counts", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 20, 23, 59));
    saveAppState({ ...DEFAULT_APP_STATE, partialZikrCounts: { "e-hm-96": 7 } });
    const read = createAppStateReader();
    expect(read().partialZikrCounts).toEqual({ "e-hm-96": 7 });
    vi.setSystemTime(new Date(2026, 9, 21, 0, 1));
    expect(read().partialZikrCounts).toEqual({});
  });

  it("detects legacy bookmark changes and safely handles corrupt or denied storage", () => {
    const read = createAppStateReader();
    expect(read().savedZikrIds).toEqual([]);
    localStorage.setItem("azkarapp.saved-zikr.v1", JSON.stringify(["m-hm-75"]));
    expect(read().savedZikrIds).toEqual(["m-hm-75"]);
    localStorage.setItem("azkarapp.state.v1", "{broken");
    expect(read()).toBe(DEFAULT_APP_STATE);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(read()).toBe(DEFAULT_APP_STATE);
    vi.stubGlobal("window", undefined);
    expect(read()).toBe(DEFAULT_APP_STATE);
  });
});

describe("non-destructive preference recovery", () => {
  it("restores preferences while retaining history, saved items and account metadata", () => {
    const original = normalizeAppState({
      ...DEFAULT_APP_STATE,
      settings: { language: "en" },
      savedZikrIds: ["m-hm-75"],
      khatmahPage: 41,
      dailyCompletions: [{ dayKey: "2026-10-01", category: "morning", timeZone: "Africa/Cairo" }],
      profile: { displayName: "Reader" },
    });
    saveAppState(original);
    expect(resetStoredSettings()).toBe(true);
    expect(loadAppState()).toMatchObject({
      settings: DEFAULT_APP_STATE.settings,
      savedZikrIds: original.savedZikrIds,
      dailyCompletions: original.dailyCompletions,
      profile: original.profile,
      khatmahPage: 41,
    });
  });

  it("preserves the exact saved bytes if the replacement write fails", () => {
    saveAppState({ ...DEFAULT_APP_STATE, khatmahPage: 41 });
    const original = localStorage.getItem("azkarapp.state.v1");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Full", "QuotaExceededError");
    });
    expect(resetStoredSettings()).toBe(false);
    expect(localStorage.getItem("azkarapp.state.v1")).toBe(original);
    expect(remove).not.toHaveBeenCalled();
  });

  it("keeps malformed data available for recovery instead of deleting it", () => {
    localStorage.setItem("azkarapp.state.v1", "{damaged");
    expect(resetStoredSettings()).toBe(false);
    expect(localStorage.getItem("azkarapp.state.v1")).toBe("{damaged");
  });

  it("reports denied storage without attempting deletion", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    expect(resetStoredSettings()).toBe(false);
    expect(remove).not.toHaveBeenCalled();
  });
});

describe("immutable snapshot writer", () => {
  it("normalizes changed Masbaha fields without revisiting the serialized base", () => {
    const write = createAppStateWriter();
    expect(write(DEFAULT_APP_STATE)).toBe(true);
    const state = {
      ...DEFAULT_APP_STATE,
      masbahaState: { count: 7.8, target: 33, laps: 2.1, items: { tasbeeh: { count: 9, target: 100, laps: 1 } } },
    };
    expect(write(state)).toBe(true);
    const actual = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
    saveAppState(state);
    expect(actual).toEqual(JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
  });
  it("writes equivalent normalized data while avoiding unchanged history traversal on counts", () => {
    const dayKey = getProgressDayKey(new Date(), 3);
    const record = {
      get dayKey() {
        return dayKey;
      },
      category: "morning" as const,
      timeZone: "Africa/Cairo",
    };
    const readDay = vi.spyOn(record, "dayKey", "get");
    // A getter lets the regression prove that the second write never traverses
    // history, rather than depending on machine-specific timing thresholds.
    const state = { ...DEFAULT_APP_STATE, dailyCompletions: [record] };
    const write = createAppStateWriter();
    expect(write(state)).toBe(true);
    readDay.mockClear();
    const counted = { ...state, partialZikrCounts: { "e-hm-96": 7, invalid: -4 } };
    expect(write(counted)).toBe(true);
    expect(readDay).not.toHaveBeenCalled();
    const optimized = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
    saveAppState(counted);
    expect(optimized).toEqual(JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
    expect(optimized.partialZikrCounts).toEqual({ "e-hm-96": 7 });
  });

  it("invalidates for new history, preferences, optional fields, removals and day boundaries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 20, 12));
    const write = createAppStateWriter();
    const base = { ...DEFAULT_APP_STATE, partialZikrCounts: { "e-hm-96": 2 } };
    const states = [
      base,
      { ...base, settings: { ...base.settings, language: "en" as const } },
      { ...base, khatmahPage: 32 },
      { ...base, quranWirdDailyGoals: { "2026-10-19": 6 } },
      base,
    ];
    for (const state of states) {
      expect(write(state)).toBe(true);
      const actual = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      saveAppState(state);
      expect(actual).toEqual(JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
    }
    vi.setSystemTime(new Date(2026, 9, 21, 12));
    expect(write(base)).toBe(true);
    expect(JSON.parse(localStorage.getItem("azkarapp.state.v1")!).lastActiveDayKey).toBe("2026-10-21");
  });

  it("retries the latest counter after quota failures and normalizes malformed counters", () => {
    const write = createAppStateWriter();
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("full");
    });
    expect(write(DEFAULT_APP_STATE)).toBe(false);
    const state = { ...DEFAULT_APP_STATE, partialZikrCounts: { "e-hm-96": 8.9 } };
    expect(write(state)).toBe(true);
    const actual = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
    saveAppState(state);
    expect(actual).toEqual(JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
  });

  it("does not share cached fields between mounts or require a browser", () => {
    const first = createAppStateWriter();
    const second = createAppStateWriter();
    first({ ...DEFAULT_APP_STATE, khatmahPage: 21 });
    second(DEFAULT_APP_STATE);
    expect(loadAppState().khatmahPage).toBe(1);
    vi.stubGlobal("window", undefined);
    expect(first(DEFAULT_APP_STATE)).toBe(false);
    expect(resetStoredSettings()).toBe(false);
  });
});

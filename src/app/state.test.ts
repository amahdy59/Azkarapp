import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_APP_STATE,
  clearPrivateAppData,
  fromCompletedSets,
  loadAppState,
  mergeAppStates,
  normalizeAppState,
  saveAppState,
} from "./state";

describe("app state persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns defaults when storage is empty", () => {
    expect(loadAppState()).toEqual(DEFAULT_APP_STATE);
  });

  it("round-trips a valid state", () => {
    const state = { ...DEFAULT_APP_STATE, profile: { ...DEFAULT_APP_STATE.profile, displayName: "Ahmed" } };
    saveAppState(state);
    expect(loadAppState().profile.displayName).toBe("Ahmed");
  });

  it("recovers safely from corrupt storage", () => {
    window.localStorage.setItem("azkarapp.state.v1", "not-json");
    expect(loadAppState()).toEqual(DEFAULT_APP_STATE);
  });

  it("migrates the legacy light-mode flag to the new theme model", () => {
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { ...DEFAULT_APP_STATE.settings, themeMode: undefined, darkMode: false } }),
    );
    expect(loadAppState().settings.themeMode).toBe("light");
  });

  it("migrates Reader-only saved zikr into app state", () => {
    window.localStorage.setItem("azkarapp.saved-zikr.v1", JSON.stringify(["m-hm-75", "m-hm-75", 3]));

    expect(loadAppState().savedZikrIds).toEqual(["m-hm-75"]);
  });

  it("repairs malformed nested settings instead of exposing them to the renderer", () => {
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          themeMode: "sepia",
          textSize: "giant",
          reminders: { morning: null, evening: { enabled: true, time: "99:72" } },
        },
        sessions: [null, { id: "broken" }],
      }),
    );

    const state = loadAppState();
    expect(state.settings.themeMode).toBe("midnight");
    expect(state.settings.textSize).toBe("medium");
    expect(state.settings.reminders).toEqual({
      ...DEFAULT_APP_STATE.settings.reminders,
      evening: { enabled: true, time: DEFAULT_APP_STATE.settings.reminders.evening.time },
    });
    expect(state.sessions).toEqual([]);
  });

  it("migrates legacy complete sessions once and keeps their progress-day keys stable", () => {
    const completedAt = new Date(2026, 6, 18, 2, 30).toISOString();
    const migrated = normalizeAppState({
      settings: { ...DEFAULT_APP_STATE.settings, progressDayStartHour: 4 },
      sessions: [
        {
          id: "legacy-morning",
          category: "morning",
          completedAt,
          completedCount: 5,
          totalCount: 5,
          durationSeconds: 60,
          isComplete: true,
        },
      ],
    });

    expect(migrated.dailyCompletions).toEqual([
      { dayKey: "2026-07-17", category: "morning", timeZone: expect.any(String) },
    ]);

    const afterBoundaryChange = normalizeAppState({
      ...migrated,
      settings: { ...migrated.settings, progressDayStartHour: 0 },
    });
    expect(afterBoundaryChange.dailyCompletions).toEqual(migrated.dailyCompletions);
  });

  it("repairs invalid quiet-progress preferences", () => {
    const state = normalizeAppState({
      settings: { quietProgressEnabled: "yes", progressDayStartHour: 12 },
    });

    expect(state.settings.quietProgressEnabled).toBe(true);
    expect(state.settings.progressDayStartHour).toBe(4);
  });

  it("drops out-of-range completion indexes from untrusted storage", () => {
    const state = normalizeAppState({ completed: { morning: [0, 999], evening: [], before_sleep: [] } });

    expect(state.completed.morning).toEqual([0]);
  });

  it("clears account-owned private data while preserving device preferences", () => {
    const cleared = clearPrivateAppData({
      ...DEFAULT_APP_STATE,
      settings: { ...DEFAULT_APP_STATE.settings, themeMode: "light" },
      profile: {
        displayName: "Ahmed",
        lastPhoneNumber: "+201000000000",
        isGuest: false,
        accountUserId: "account-a",
      },
      completed: { morning: [0], evening: [], before_sleep: [] },
      sessions: [
        {
          id: "private-session",
          category: "morning",
          completedAt: new Date(2026, 6, 18, 9).toISOString(),
          completedCount: 1,
          totalCount: 1,
          durationSeconds: 10,
          isComplete: true,
        },
      ],
      dailyCompletions: [{ dayKey: "2026-07-18", category: "morning", timeZone: "Africa/Cairo" }],
      savedZikrIds: ["m-hm-75"],
    });

    expect(cleared.settings.themeMode).toBe("light");
    expect(cleared.profile).toEqual(DEFAULT_APP_STATE.profile);
    expect(cleared.completed.morning).toEqual([]);
    expect(cleared.sessions).toEqual([]);
    expect(cleared.dailyCompletions).toEqual([]);
    expect(cleared.savedZikrIds).toEqual([]);
  });
});

describe("state merging", () => {
  it("deduplicates completed items", () => {
    const incoming = { completed: { morning: [2, 2, 1], evening: [], before_sleep: [] } };
    const merged = mergeAppStates(DEFAULT_APP_STATE, incoming);
    expect(merged.completed.morning).toEqual([1, 2]);
  });

  it("serializes completion sets in stable order", () => {
    expect(
      fromCompletedSets({ morning: new Set([2, 1]), evening: new Set(), before_sleep: new Set() }).morning,
    ).toEqual([1, 2]);
  });

  it("merges saved zikr without duplicates", () => {
    const base = { ...DEFAULT_APP_STATE, savedZikrIds: ["m-hm-75"] };
    const merged = mergeAppStates(base, { savedZikrIds: ["m-hm-75", "e-hm-79"] });

    expect(merged.savedZikrIds).toEqual(["e-hm-79", "m-hm-75"]);
  });

  it("normalizes invalid remote preferences during merge", () => {
    const incoming = {
      settings: { ...DEFAULT_APP_STATE.settings, themeMode: "sepia", reminders: undefined },
    } as unknown as Parameters<typeof mergeAppStates>[1];

    expect(mergeAppStates(DEFAULT_APP_STATE, incoming).settings).toEqual(DEFAULT_APP_STATE.settings);
  });

  it("normalizes completely untrusted snapshots", () => {
    expect(normalizeAppState(null)).toEqual(DEFAULT_APP_STATE);
  });

  it("unions explicit completion ledgers without duplicate leaves", () => {
    const base = {
      ...DEFAULT_APP_STATE,
      dailyCompletions: [{ dayKey: "2026-07-18", category: "morning" as const, timeZone: "Africa/Cairo" }],
    };
    const merged = mergeAppStates(base, {
      dailyCompletions: [
        { dayKey: "2026-07-18", category: "morning", timeZone: "Africa/Cairo" },
        { dayKey: "2026-07-18", category: "evening", timeZone: "Africa/Cairo" },
      ],
    });

    expect(merged.dailyCompletions).toEqual([
      { dayKey: "2026-07-18", category: "morning", timeZone: "Africa/Cairo" },
      { dayKey: "2026-07-18", category: "evening", timeZone: "Africa/Cairo" },
    ]);
  });
});

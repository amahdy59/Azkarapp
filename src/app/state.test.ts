import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_APP_STATE,
  MAX_STORED_SESSIONS,
  clearStoredAppData,
  clearPrivateAppData,
  fromCompletedSets,
  loadAppState,
  mergeAppStates,
  normalizeAppState,
  saveAppState,
  toCompletedSets,
} from "./state";

describe("app state persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns defaults when storage is empty", () => {
    expect(loadAppState()).toEqual(DEFAULT_APP_STATE);
  });

  it("round-trips a valid state", () => {
    const state = {
      ...DEFAULT_APP_STATE,
      settings: {
        ...DEFAULT_APP_STATE.settings,
        location: {
          ...DEFAULT_APP_STATE.settings.location!,
          latitude: 31.2001,
          longitude: 29.9187,
          cityName: "Alexandria",
          calculationMethod: 4,
        },
      },
      profile: { ...DEFAULT_APP_STATE.profile, displayName: "Ahmed" },
    };
    expect(saveAppState(state)).toBe(true);
    expect(loadAppState()).toMatchObject({
      profile: { displayName: "Ahmed" },
      settings: {
        location: {
          latitude: 31.2001,
          longitude: 29.9187,
          cityName: "Alexandria",
          calculationMethod: 4,
        },
      },
    });
  });

  it("reports storage write failures without throwing", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    expect(saveAppState(DEFAULT_APP_STATE)).toBe(false);
    write.mockRestore();
  });

  it("clears dynamic Friday and counter-sound data without touching unrelated origin storage", () => {
    window.localStorage.setItem("azkarapp.state.v1", "{}");
    window.localStorage.setItem("azkarapp.counter-sound.v1", "false");
    window.localStorage.setItem("azkarapp.friday-duas.2026-W31", '["friday-dua-01"]');
    window.localStorage.setItem("azkarapp.friday-checklist.2026-W31", "[]");
    window.localStorage.setItem("unrelated.product.key", "keep");

    clearStoredAppData();

    expect(window.localStorage.getItem("azkarapp.state.v1")).toBeNull();
    expect(window.localStorage.getItem("azkarapp.counter-sound.v1")).toBeNull();
    expect(window.localStorage.getItem("azkarapp.friday-duas.2026-W31")).toBeNull();
    expect(window.localStorage.getItem("azkarapp.friday-checklist.2026-W31")).toBeNull();
    expect(window.localStorage.getItem("unrelated.product.key")).toBe("keep");
  });

  it("retains only the newest bounded session history", () => {
    const sessions = Array.from({ length: MAX_STORED_SESSIONS + 5 }, (_, index) => ({
      id: `session-${index}`,
      category: "morning" as const,
      completedAt: new Date(2026, 0, 1, 0, index).toISOString(),
      completedCount: 1,
      totalCount: 1,
      durationSeconds: 1,
      isComplete: true,
    }));

    const normalized = normalizeAppState({ sessions });
    expect(normalized.sessions).toHaveLength(MAX_STORED_SESSIONS);
    expect(normalized.sessions[0]?.id).toBe(`session-${MAX_STORED_SESSIONS + 4}`);
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

  it("preserves valid comprehensive-dua session progress and saved items", () => {
    const state = normalizeAppState({
      completed: { comprehensive_duas: ["friday-dua-01", "comprehensive-dua-47", "bad-dua"] },
      savedZikrIds: ["comprehensive-dua-36", "bad-dua"],
    });

    expect(state.completed.comprehensive_duas).toEqual(["comprehensive-dua-47", "friday-dua-01"]);
    expect(state.savedZikrIds).toEqual(["comprehensive-dua-36"]);
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
      {
        dayKey: "2026-07-17",
        category: "morning",
        timeZone: expect.any(String),
        completionLevel: "complete",
      },
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

  it("normalizes prayer location, method, timezone, and manual adjustments", () => {
    const state = normalizeAppState({
      settings: {
        location: {
          latitude: 31.2,
          longitude: 29.9,
          cityName: "  Alexandria  ",
          calculationMethod: 4,
          autoDetect: false,
          timeZone: "Africa/Cairo",
          adjustments: { fajr: -3.4, isha: 500 },
        },
      },
    });

    expect(state.settings.location).toEqual({
      latitude: 31.2,
      longitude: 29.9,
      cityName: "Alexandria",
      calculationMethod: 4,
      autoDetect: false,
      timeZone: "Africa/Cairo",
      adjustments: { fajr: -3, dhuhr: 0, asr: 0, maghrib: 0, isha: 120 },
    });
  });

  it("migrates legacy completion indexes by the pre-arrangement order and drops invalid indexes", () => {
    const state = normalizeAppState({
      completed: {
        morning: [0, 5, 999],
        evening: [],
        before_sleep: [],
        waking_up: [],
        home: [],
        mosque: [],
        after_prayer: [],
        restroom: [],
        food_drink: [],
        travel: [],
      },
    });

    expect(state.completed.morning).toEqual(["m-hm-77m"]);
  });

  it("clears account-owned private data while preserving device preferences", () => {
    const cleared = clearPrivateAppData({
      ...DEFAULT_APP_STATE,
      settings: { ...DEFAULT_APP_STATE.settings, themeMode: "light" },
      profile: {
        displayName: "Ahmed",
        email: "ahmed@example.com",
        phone: "+201000000000",
        avatarUrl: "",
        isGuest: false,
        accountUserId: "account-a",
      },
      completed: {
        ...DEFAULT_APP_STATE.completed,
        morning: ["m-hm-77m"],
      },
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
    const incoming = {
      completed: {
        ...DEFAULT_APP_STATE.completed,
        morning: ["m-hm-76a", "m-hm-76a", "m-hm-75"],
      },
    };
    const merged = mergeAppStates(DEFAULT_APP_STATE, incoming);
    expect(merged.completed.morning).toEqual(["m-hm-75", "m-hm-76a"]);
  });

  it("serializes completion sets in stable order", () => {
    expect(
      fromCompletedSets({
        ...toCompletedSets(DEFAULT_APP_STATE.completed),
        morning: new Set(["m-hm-76a", "m-hm-75"]),
      }).morning,
    ).toEqual(["m-hm-75", "m-hm-76a"]);
  });

  it("merges saved zikr without duplicates", () => {
    const base = { ...DEFAULT_APP_STATE, savedZikrIds: ["m-hm-75"] };
    const merged = mergeAppStates(base, { savedZikrIds: ["m-hm-75", "e-hm-79"] });

    expect(merged.savedZikrIds).toEqual(["e-hm-79", "m-hm-75"]);
  });

  it("merges sessions by stable ID and keeps the incoming version", () => {
    const baseSession = {
      id: "stable-session",
      category: "morning" as const,
      completedAt: "2026-07-30T05:00:00.000Z",
      completedCount: 1,
      totalCount: 2,
      durationSeconds: 30,
      isComplete: false,
    };
    const merged = mergeAppStates(
      { ...DEFAULT_APP_STATE, sessions: [baseSession] },
      {
        sessions: [
          { ...baseSession, completedCount: 2, isComplete: true },
          { ...baseSession, id: "second-session", completedAt: "2026-07-30T06:00:00.000Z" },
        ],
      },
    );

    expect(merged.sessions).toHaveLength(2);
    expect(merged.sessions.find((item) => item.id === "stable-session")).toMatchObject({
      completedCount: 2,
      isComplete: true,
    });
  });

  it("migrates the legacy phone profile field without retaining phone auth behavior", () => {
    const state = normalizeAppState({
      profile: { displayName: "Legacy", lastPhoneNumber: "+201000000000", isGuest: false },
    });

    expect(state.profile.phone).toBe("+201000000000");
    expect(state.profile.email).toBe("");
  });

  it("normalizes invalid remote preferences during merge", () => {
    const incoming = {
      settings: { ...DEFAULT_APP_STATE.settings, themeMode: "sepia", reminders: undefined },
    } as unknown as Parameters<typeof mergeAppStates>[1];

    expect(mergeAppStates(DEFAULT_APP_STATE, incoming).settings).toEqual(DEFAULT_APP_STATE.settings);
  });

  it("restores a remote prayer location over the local location", () => {
    const remoteLocation = {
      latitude: 24.7136,
      longitude: 46.6753,
      cityName: "Riyadh",
      calculationMethod: 4,
      autoDetect: true,
      timeZone: "Asia/Riyadh",
    };

    expect(
      mergeAppStates(DEFAULT_APP_STATE, {
        settings: { ...DEFAULT_APP_STATE.settings, location: remoteLocation },
      }).settings.location,
    ).toMatchObject(remoteLocation);
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
      {
        dayKey: "2026-07-18",
        category: "morning",
        timeZone: "Africa/Cairo",
        completionLevel: "complete",
      },
      {
        dayKey: "2026-07-18",
        category: "evening",
        timeZone: "Africa/Cairo",
        completionLevel: "complete",
      },
    ]);
  });
});

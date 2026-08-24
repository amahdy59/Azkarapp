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
import { getProgressDayKey, shiftProgressDayKey } from "./progress";

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

  it("normalizes Quran reading context and a custom wird plan without trusting invalid values", () => {
    const valid = normalizeAppState({
      quranReadingPosition: { page: 22, surahNumber: 2, ayahNumber: 142, juzNumber: 2 },
      quranWirdPlan: { kind: "custom", dailyPages: 11, durationDays: 55 },
    });
    const invalid = normalizeAppState({
      quranReadingPosition: { page: 700, surahNumber: 200 },
      quranWirdPlan: { kind: "custom", dailyPages: 0, durationDays: 700 },
    });

    expect(valid.quranReadingPosition).toEqual({ page: 22, surahNumber: 2, ayahNumber: 142, juzNumber: 2 });
    expect(valid.quranWirdPlan).toEqual({ kind: "custom", dailyPages: 11, durationDays: 55 });
    expect(invalid.quranReadingPosition?.page).toBe(1);
    expect(invalid.quranWirdPlan).toEqual({ kind: "custom", dailyPages: 4 });
  });

  it("reports storage write failures without throwing", () => {
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    expect(saveAppState(DEFAULT_APP_STATE)).toBe(false);
    write.mockRestore();
  });

  it("clears every app-owned namespace without touching unrelated origin storage", () => {
    const owned = [
      "azkarapp.state.v1",
      "azkarapp.saved-zikr.v1",
      "azkarapp.counter-sound.v1",
      "azkarapp.foreground-reminders.v1",
      "azkarapp.install-dismissed",
      "azkarapp.onboarding-complete.v1",
      "azkarapp.friday-duas.2026-W31",
      "azkarapp.friday-checklist.2026-W31",
      // These four survived the previous hand-maintained key list. Search
      // history and location-derived prayer caches outliving "clear local
      // data" is the part that actually matters.
      "azkarapp_recent_searches_ar",
      "azkarapp.prayer_times_cache.2026-08-09.30.0.31.2.5",
      "azkarapp.prayer_time_zone.30.0.31.2",
      "azkarapp.last-successful-sync.v1",
      "azkar.audio-preferences.v1",
    ];
    for (const key of owned) window.localStorage.setItem(key, "x");
    window.localStorage.setItem("unrelated.product.key", "keep");
    // Not swept on purpose: it is the only index of the Cache API audio bucket,
    // so dropping it alone would strand those bytes. See OWNED_STORAGE_PREFIXES.
    window.localStorage.setItem("azkar.audio-downloads.v1", "{}");

    clearStoredAppData();

    for (const key of owned) {
      expect(window.localStorage.getItem(key), `${key} should have been cleared`).toBeNull();
    }
    expect(window.localStorage.getItem("unrelated.product.key")).toBe("keep");
    expect(window.localStorage.getItem("azkar.audio-downloads.v1")).toBe("{}");
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

  it("migrates legacy Mushaf surfaces to the shared app theme model", () => {
    expect(normalizeAppState({ mushafTheme: "parchment" }).mushafTheme).toBe("follow-app");
    expect(normalizeAppState({ mushafTheme: "white" }).mushafTheme).toBe("light");
    expect(normalizeAppState({ mushafTheme: "unknown" }).mushafTheme).toBe("follow-app");
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

  it("migrates legacy progress boundaries to midnight", () => {
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
        dayKey: "2026-07-18",
        category: "morning",
        timeZone: expect.any(String),
        completionLevel: "complete",
      },
    ]);

    expect(migrated.settings.progressDayStartHour).toBe(0);
  });

  it("starts persisted daily routine progress fresh on a new local date", () => {
    const todayKey = getProgressDayKey();
    const state = normalizeAppState({
      ...DEFAULT_APP_STATE,
      lastActiveDayKey: shiftProgressDayKey(todayKey, -1),
      completed: {
        ...DEFAULT_APP_STATE.completed,
        morning: ["m-hm-75a"],
        travel: ["tr-ref-1"],
      },
    });

    expect(state.completed.morning).toEqual([]);
    expect(state.completed.travel).toEqual(["tr-ref-1"]);
    expect(state.lastActiveDayKey).toBe(todayKey);
  });

  it("repairs invalid quiet-progress preferences", () => {
    const state = normalizeAppState({
      settings: { quietProgressEnabled: "yes", progressDayStartHour: 12 },
    });

    expect(state.settings.quietProgressEnabled).toBe(true);
    // Asserts the default rather than a literal, so changing the day boundary
    // does not silently break an unrelated repair test.
    expect(state.settings.progressDayStartHour).toBe(DEFAULT_APP_STATE.settings.progressDayStartHour);
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

describe("prayer tracking persistence", () => {
  it("gives a state written before the field existed an empty array, not undefined", () => {
    // Every stored or synced snapshot from an earlier version lacks this key.
    // It reached the setter untouched, and the first tap did undefined.findIndex.
    const legacy = normalizeAppState({
      settings: { language: "ar" },
      completed: {},
      sessions: [],
      dailyCompletions: [],
      savedZikrIds: [],
    });
    expect(legacy.prayerTracking).toEqual([]);
  });

  it("keys records by day and stable prayer id, dropping anything malformed", () => {
    const normalized = normalizeAppState({
      ...DEFAULT_APP_STATE,
      prayerTracking: [
        { dayKey: "2026-08-17", prayer: "fajr", mosque: true, adhkar: false },
        { dayKey: "2026-08-17", prayer: "not-a-prayer", mosque: true, adhkar: true },
        { dayKey: "", prayer: "asr", mosque: true, adhkar: true },
        // Both flags false carries no information.
        { dayKey: "2026-08-17", prayer: "isha", mosque: false, adhkar: false },
        "nonsense",
      ],
    });
    expect(normalized.prayerTracking).toEqual([{ dayKey: "2026-08-17", prayer: "fajr", mosque: true, adhkar: false }]);
  });

  it("merges by (day, prayer) so two devices cannot duplicate a prayer", () => {
    const base = normalizeAppState({
      ...DEFAULT_APP_STATE,
      prayerTracking: [{ dayKey: "2026-08-17", prayer: "fajr", mosque: true, adhkar: false }],
    });
    const merged = mergeAppStates(base, {
      ...DEFAULT_APP_STATE,
      prayerTracking: [
        { dayKey: "2026-08-17", prayer: "fajr", mosque: true, adhkar: true },
        { dayKey: "2026-08-16", prayer: "isha", mosque: true, adhkar: true },
      ],
    });
    const fajr = merged.prayerTracking.filter((r) => r.dayKey === "2026-08-17" && r.prayer === "fajr");
    expect(fajr).toHaveLength(1);
    expect(fajr[0]?.adhkar).toBe(true);
    expect(merged.prayerTracking).toHaveLength(2);
  });
});

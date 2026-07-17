import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_APP_STATE,
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
});

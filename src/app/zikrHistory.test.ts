import { getZikrItemInsights } from "./progressInsights";
import { describe, expect, it } from "vitest";
import { normalizeZikrHistory, mergeZikrHistory } from "./zikrHistory";
import { normalizeAppState, mergeAppStates, clearPrivateAppData, DEFAULT_APP_STATE } from "./state";
import { createAppBackup, parseAppBackup } from "./appBackup";
import { buildRemoteSyncSnapshot } from "../lib/remoteSyncSnapshot";
import { hasPrivateProgress } from "./hooks/useAuthHandlers";

const row = {
  dayKey: "2026-10-01",
  category: "morning" as const,
  offeredIds: ["m-hm-77m", "m-hm-78m"],
  completedIds: ["m-hm-77m"],
};
describe("individual zikr history", () => {
  it("rejects corrupt records and foreign IDs, unions deterministically without inventing history", () => {
    expect(normalizeZikrHistory(null)).toEqual([]);
    const value = [
      null,
      4,
      {},
      { ...row, dayKey: "bad" },
      { ...row, category: "home" },
      { ...row, offeredIds: ["foreign"] },
      { ...row, completedIds: ["foreign", "m-hm-77m"] },
    ];
    expect(normalizeZikrHistory(value)).toEqual([row]);
    const another = { ...row, completedIds: ["m-hm-78m"] };
    const expected = [{ ...row, completedIds: [...row.offeredIds] }];
    expect(mergeZikrHistory([row], [another])).toEqual(expected);
    expect(mergeZikrHistory([another], [row])).toEqual(expected);
    expect(normalizeZikrHistory(expected)).toEqual(expected);
    expect(
      normalizeAppState({ dailyCompletions: [{ dayKey: row.dayKey, category: "morning", timeZone: "UTC" }] })
        .zikrHistory,
    ).toEqual([]);
  });
  it("survives normalization, backup, old-snapshot merge and remote export; clears with private data", () => {
    const state = normalizeAppState({ zikrHistory: [row] });
    expect(parseAppBackup(JSON.stringify(createAppBackup(state))).zikrHistory).toEqual([row]);
    expect(mergeAppStates(state, { settings: DEFAULT_APP_STATE.settings }).zikrHistory).toEqual([row]);
    expect(buildRemoteSyncSnapshot(state).zikrHistory).toEqual([row]);
    expect(hasPrivateProgress(state)).toBe(true);
    expect(clearPrivateAppData(state).zikrHistory).toEqual([]);
  });
  it("requires three observed days per item and respects selected dates", () => {
    const days = [1, 2, 3].map((day) => ({ ...row, dayKey: `2026-10-0${day}` }));
    expect(getZikrItemInsights(days, "2026-10-01", "2026-10-02")).toEqual([]);
    expect(getZikrItemInsights(days, "2026-10-01", "2026-10-03")).toEqual([
      { id: "m-hm-78m", category: "morning", recorded: 0, possible: 3 },
      { id: "m-hm-77m", category: "morning", recorded: 3, possible: 3 },
    ]);
  });
});

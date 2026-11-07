import { describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "./state";
import { saveProgressExport } from "./progressExport";
import { saveFileToDevice } from "./share/shareDispatcher";

vi.mock("./share/shareDispatcher", () => ({ saveFileToDevice: vi.fn().mockResolvedValue(undefined) }));
const now = new Date(2026, 9, 20, 12);
async function exportedData() {
  const file = vi.mocked(saveFileToDevice).mock.calls.at(-1)![0];
  const contents = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(file);
  });
  return { file, data: JSON.parse(contents) };
}
describe("Settings progress JSON export", () => {
  it("exports the complete chosen scope from the normalized snapshot without altering it", async () => {
    const snapshot = {
      ...DEFAULT_APP_STATE,
      settings: { ...DEFAULT_APP_STATE.settings, calendarType: "gregorian" as const, progressDayStartHour: 3 },
      dailyCompletions: ["2026-10-01", "2026-10-02", "2026-10-03"].map((dayKey) => ({
        dayKey,
        category: "morning" as const,
        timeZone: "Africa/Cairo",
      })),
      wirdHistory: { "2026-10-02": [1, 2], "2026-10-03": [2, 3] },
      quranWirdDailyGoals: { "2026-10-02": 4 },
      zikrHistory: [
        { dayKey: "2026-10-02", category: "morning" as const, offeredIds: ["morning-1"], completedIds: ["morning-1"] },
      ],
    };
    const before = JSON.stringify(snapshot);
    await saveProgressExport(snapshot, { startKey: "2026-10-02", endKey: "2026-10-03" }, now);
    const { file, data } = await exportedData();
    expect(file.name).toBe("progress-2026-10-02-2026-10-03.json");
    expect(data.schema).toBe("azkarapp.progress.v1");
    expect(data.dailyRecords).toHaveLength(2);
    expect(data.records.dailyCompletions).toHaveLength(2);
    expect(data.metrics.routines.count).toBe(2);
    expect(data.metrics.pages.count).toBe(4);
    expect(data.metrics.quranGoals.possible).toBe(1);
    expect(data.zikrHistory).toEqual(snapshot.zikrHistory);
    expect(data.calendar).toBe("gregorian");
    expect(JSON.stringify(snapshot)).toBe(before);
  });
  it("keeps today's civil prayer scope separate from its overnight devotional scope", async () => {
    const snapshot = {
      ...DEFAULT_APP_STATE,
      settings: { ...DEFAULT_APP_STATE.settings, calendarType: undefined, progressDayStartHour: 3 },
      dailyCompletions: [{ dayKey: "2026-10-19", category: "morning" as const, timeZone: "Africa/Cairo" }],
      prayerTracking: [{ dayKey: "2026-10-20", prayer: "fajr" as const, location: "home" as const }],
      wirdHistory: { "2026-10-19": [1, 2] },
      zikrHistory: [
        { dayKey: "2026-10-19", category: "morning" as const, offeredIds: ["morning-1"], completedIds: ["morning-1"] },
      ],
    };
    await saveProgressExport(snapshot, { startKey: "2026-10-20", endKey: "2026-10-20" }, new Date(2026, 9, 20, 1));
    const { data } = await exportedData();
    expect(data.windows.prayers).toEqual({ startKey: "2026-10-20", endKey: "2026-10-20" });
    expect(data.windows.routines).toEqual({ startKey: "2026-10-19", endKey: "2026-10-19" });
    expect(data.metrics.prayers.count).toBe(1);
    expect(data.metrics.routines.count).toBe(1);
    expect(data.metrics.pages.count).toBe(2);
    expect(data.zikrHistory).toEqual(snapshot.zikrHistory);
    expect(data.calendar).toBe("hijri");
  });
  it("rejects invalid/future dates before dispatching a file", async () => {
    vi.mocked(saveFileToDevice).mockClear();
    await expect(
      saveProgressExport(DEFAULT_APP_STATE, { startKey: "2026-10-21", endKey: "2026-10-22" }, now),
    ).rejects.toThrow("invalid-progress-range");
    expect(saveFileToDevice).not.toHaveBeenCalled();
  });
});

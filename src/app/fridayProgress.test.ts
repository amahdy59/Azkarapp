import { describe, expect, it } from "vitest";
import {
  fridayChecklistKey,
  fridayDuasKey,
  fridayKahfOpenedKey,
  fridaySalawatKey,
  getIsoWeekKey,
  readFridaySalawatProgress,
  readFridayDuaProgress,
  writeFridayDuaProgress,
  writeFridaySalawatProgress,
} from "./fridayProgress";

describe("Friday weekly progress", () => {
  it("uses the ISO week across a year boundary", () => {
    expect(getIsoWeekKey(new Date(2024, 11, 30))).toBe("2025-W01");
    expect(getIsoWeekKey(new Date(2025, 0, 3))).toBe("2025-W01");
  });

  it("names checklist storage by week", () => {
    expect(fridayChecklistKey("2026-W31")).toBe("azkarapp.friday-checklist.2026-W31");
    expect(fridayKahfOpenedKey("2026-W31")).toBe("azkarapp.friday-kahf-opened.2026-W31");
    expect(fridaySalawatKey("2026-W31")).toBe("azkarapp.friday-salawat.2026-W31");
    expect(fridayDuasKey("2026-W31")).toBe("azkarapp.friday-duas.2026-W31");
  });

  it("stores a validated weekly Salawat target and count", () => {
    localStorage.clear();
    writeFridaySalawatProgress({ count: 10, target: 100 }, "2026-W31");
    expect(readFridaySalawatProgress("2026-W31")).toEqual({ count: 10, target: 100 });
  });

  it("stores comprehensive-dua progress independently for each week", () => {
    localStorage.clear();
    writeFridayDuaProgress(["friday-dua-02", "friday-dua-01"], "2026-W31");
    const allowedIds = ["friday-dua-01", "friday-dua-02"];

    expect([...readFridayDuaProgress(allowedIds, "2026-W31")]).toEqual(["friday-dua-01", "friday-dua-02"]);
    expect(readFridayDuaProgress(allowedIds, "2026-W32").size).toBe(0);
  });

  it("drops stale or injected IDs that are not in the reviewed collection", () => {
    localStorage.setItem(fridayDuasKey("2026-W31"), JSON.stringify(["friday-dua-01", "fake-dua", 47]));

    expect([...readFridayDuaProgress(["friday-dua-01"], "2026-W31")]).toEqual(["friday-dua-01"]);
  });
});

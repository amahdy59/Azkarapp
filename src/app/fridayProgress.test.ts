import { describe, expect, it } from "vitest";
import {
  fridayChecklistKey,
  fridayDuasKey,
  fridayKahfOpenedKey,
  fridaySalawatKey,
  FRIDAY_KAHF_WEEK_KEY,
  getFridayCycleKey,
  getIsoWeekKey,
  pruneStaleFridayProgress,
  readFridaySalawatProgress,
  readFridayDuaProgress,
  writeFridayDuaProgress,
  writeFridaySalawatProgress,
} from "./fridayProgress";

describe("Friday cycle boundary", () => {
  // 2026-08-20 Thu, 08-21 Fri, 08-22 Sat, 08-28 the following Fri.
  it("clears the companion once Friday ends rather than on Monday", () => {
    expect(getFridayCycleKey(new Date(2026, 7, 21))).toBe("2026-08-21");
    // Thursday evening counts toward the Friday it prepares for.
    expect(getFridayCycleKey(new Date(2026, 7, 20))).toBe("2026-08-21");
    // Saturday has already rolled forward, so Friday's progress is gone.
    expect(getFridayCycleKey(new Date(2026, 7, 22))).toBe("2026-08-28");
  });

  it("kept Friday's progress visible on Saturday under the old ISO week", () => {
    // The bug this replaced: Friday and the Saturday after it shared a bucket.
    expect(getIsoWeekKey(new Date(2026, 7, 21))).toBe(getIsoWeekKey(new Date(2026, 7, 22)));
  });

  it("prunes keys left behind by the previous ISO-week scheme", () => {
    localStorage.clear();
    localStorage.setItem(fridayDuasKey("2026-W34"), "[]");
    localStorage.setItem(fridayChecklistKey("2026-08-21"), "[]");

    pruneStaleFridayProgress("2026-08-21");

    expect(localStorage.getItem(fridayDuasKey("2026-W34"))).toBeNull();
    expect(localStorage.getItem(fridayChecklistKey("2026-08-21"))).toBe("[]");
  });
});

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

  it("prunes past ISO weeks while keeping the current week and non-weekly keys", () => {
    localStorage.clear();
    localStorage.setItem(fridayDuasKey("2026-W29"), "[]");
    localStorage.setItem(fridayChecklistKey("2026-W29"), "[]");
    localStorage.setItem(fridaySalawatKey("2026-W30"), "{}");
    localStorage.setItem(fridayKahfOpenedKey("2026-W31"), "true");
    localStorage.setItem(fridayDuasKey("2026-W31"), "[]");
    // Not week-scoped: it ends in `.v1`, so pruning must never touch it.
    localStorage.setItem(FRIDAY_KAHF_WEEK_KEY, "2026-W31");
    localStorage.setItem("unrelated.product.key", "keep");

    pruneStaleFridayProgress("2026-W31");

    expect(localStorage.getItem(fridayDuasKey("2026-W29"))).toBeNull();
    expect(localStorage.getItem(fridayChecklistKey("2026-W29"))).toBeNull();
    expect(localStorage.getItem(fridaySalawatKey("2026-W30"))).toBeNull();
    expect(localStorage.getItem(fridayKahfOpenedKey("2026-W31"))).toBe("true");
    expect(localStorage.getItem(fridayDuasKey("2026-W31"))).toBe("[]");
    expect(localStorage.getItem(FRIDAY_KAHF_WEEK_KEY)).toBe("2026-W31");
    expect(localStorage.getItem("unrelated.product.key")).toBe("keep");
  });

  it("stores a validated weekly Salawat target and count", () => {
    localStorage.clear();
    writeFridaySalawatProgress({ count: 10, target: 100 }, "2026-W31");
    expect(readFridaySalawatProgress("2026-W31")).toEqual({ count: 10, target: 100 });
  });

  it("accepts custom Salawat targets and clamps injected values", () => {
    localStorage.clear();
    writeFridaySalawatProgress({ count: 12, target: 250 }, "2026-W31");
    expect(readFridaySalawatProgress("2026-W31")).toEqual({ count: 12, target: 250 });

    localStorage.setItem(fridaySalawatKey("2026-W31"), JSON.stringify({ count: -4, target: 999999 }));
    expect(readFridaySalawatProgress("2026-W31")).toEqual({ count: 0, target: 100000 });
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

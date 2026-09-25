import { describe, expect, it } from "vitest";
import { getContextualEvidence, getReminderContexts, getReminderSlotKey } from "./dailyEvidence";

const DAY = "2026-09-06";

describe("which contexts fit the moment", () => {
  it("puts the adhkar that follow a prayer first", () => {
    const contexts = getReminderContexts({ afterPrayer: true, timedCollection: "evening" });
    expect(contexts[0]).toBe("after_prayer");
  });

  it("prefers the timed collection over nothing at all", () => {
    expect(getReminderContexts({ timedCollection: "before_sleep" })).toEqual(["before_sleep", "general"]);
  });

  it("always ends with the general pool, so there is a floor", () => {
    expect(getReminderContexts({}).at(-1)).toBe("general");
  });
});

describe("choosing what is relevant now", () => {
  it("draws from the collection the moment belongs to", () => {
    const result = getContextualEvidence(DAY, "en", ["before_sleep", "general"]);
    expect(result?.context).toBe("before_sleep");
    expect(result?.evidence.categoryId).toBe("before_sleep");
  });

  it("takes the first context that has content, so order is the whole rule", () => {
    /* Every category in the corpus currently carries evidence, so the
       fall-through in the selector is defensive rather than reachable here.
       What is reachable, and what matters, is that the order decides. */
    expect(getContextualEvidence(DAY, "en", ["before_sleep", "morning"])?.context).toBe("before_sleep");
    expect(getContextualEvidence(DAY, "en", ["morning", "before_sleep"])?.context).toBe("morning");
  });

  it("is stable for the same day and context", () => {
    /* The behaviour that stops the card feeling like noise: navigating away and
       back must not re-roll it. */
    const first = getContextualEvidence(DAY, "en", ["morning", "general"]);
    const again = getContextualEvidence(DAY, "en", ["morning", "general"]);
    expect(again?.evidence.zikrId).toBe(first?.evidence.zikrId);
  });

  it("moves on to another day", () => {
    const today = getContextualEvidence(DAY, "en", ["morning", "general"]);
    const tomorrow = getContextualEvidence("2026-09-07", "en", ["morning", "general"]);
    expect(tomorrow?.evidence.zikrId).not.toBe(today?.evidence.zikrId);
  });

  it("changes when the moment changes, within the same day", () => {
    const morning = getContextualEvidence(DAY, "en", ["morning", "general"]);
    const night = getContextualEvidence(DAY, "en", ["before_sleep", "general"]);
    expect(night?.evidence.zikrId).not.toBe(morning?.evidence.zikrId);
  });

  it("only ever offers content that carries its own evidence", () => {
    // Every item must name what it rests on; that is the whole point of the pool.
    for (const context of ["morning", "evening", "before_sleep", "after_prayer", "general"] as const) {
      const result = getContextualEvidence(DAY, "ar", [context]);
      expect(result?.evidence.hadith).toBeTruthy();
      expect(result?.evidence.authenticity).toBeTruthy();
    }
  });

  it("returns nothing rather than guessing when given no contexts", () => {
    expect(getContextualEvidence(DAY, "en", [])).toBeNull();
  });

  it("supports manual offset to cycle through available evidence deterministically", () => {
    const base = getContextualEvidence(DAY, "ar", ["general"], 0);
    const next = getContextualEvidence(DAY, "ar", ["general"], 1);
    expect(base?.evidence.hadith).toBeTruthy();
    expect(next?.evidence.hadith).toBeTruthy();
    expect(next?.evidence.zikrId).not.toBe(base?.evidence.zikrId);
  });
});

describe("reminder time slots", () => {
  it("rotates every 30 minutes in standard windows", () => {
    const at0915 = new Date(2026, 8, 6, 9, 15);
    const at0929 = new Date(2026, 8, 6, 9, 29);
    const at0930 = new Date(2026, 8, 6, 9, 30);

    const slot0915 = getReminderSlotKey(DAY, at0915, false);
    const slot0929 = getReminderSlotKey(DAY, at0929, false);
    const slot0930 = getReminderSlotKey(DAY, at0930, false);

    expect(slot0915).toBe(slot0929);
    expect(slot0930).not.toBe(slot0915);
  });

  it("lingers for 45 minutes in extended devotional windows such as Dhuha and before Fajr", () => {
    const at0915 = new Date(2026, 8, 6, 9, 15);
    const at0940 = new Date(2026, 8, 6, 9, 40);
    const at1005 = new Date(2026, 8, 6, 10, 5);

    const slot0915 = getReminderSlotKey(DAY, at0915, true);
    const slot0940 = getReminderSlotKey(DAY, at0940, true);
    const slot1005 = getReminderSlotKey(DAY, at1005, true);

    // 09:15 (555 min) and 09:40 (580 min) fall into the same 45-minute slot (floor(555/45) = 12, floor(580/45) = 12)
    expect(slot0915).toBe(slot0940);
    // 10:05 (605 min) falls into slot 13 (floor(605/45) = 13)
    expect(slot1005).not.toBe(slot0915);
  });
});

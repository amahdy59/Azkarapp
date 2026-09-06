import { describe, expect, it } from "vitest";
import { getContextualEvidence, getReminderContexts } from "./dailyEvidence";

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
});

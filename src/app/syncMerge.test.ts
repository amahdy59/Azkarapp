import { describe, expect, it } from "vitest";
import { mergePrayerTracking, mergeQuranWirdDailyGoals, mergeWirdHistory, pickPrayerRecord } from "./syncMerge";
import type { PrayerTrackingRecord } from "./types";

const DAY = "2026-09-05";

function record(over: Partial<PrayerTrackingRecord> = {}): PrayerTrackingRecord {
  return { dayKey: DAY, prayer: "fajr", mosque: false, adhkar: false, ...over };
}

describe("merging prayer tracking across devices", () => {
  it("keeps a prayer recorded on only one device", () => {
    const merged = mergePrayerTracking([], [record({ location: "mosque", mosque: true })]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.location).toBe("mosque");
  });

  it("never lets a blank win over an answer", () => {
    const merged = pickPrayerRecord(record(), record({ location: "home" }));
    expect(merged.location).toBe("home");
  });

  it("unions the follow-ups, because they are separate acts", () => {
    // Adhkar done on the phone, rawatib on the laptop: one prayer, both done.
    const merged = pickPrayerRecord(
      record({ location: "mosque", mosque: true, adhkar: true }),
      record({ location: "mosque", mosque: true, sunnah: true }),
    );
    expect(merged.adhkar).toBe(true);
    expect(merged.sunnah).toBe(true);
  });

  it("reaches the same answer whichever device merges", () => {
    const a = record({ location: "home", adhkar: true });
    const b = record({ location: "mosque", mosque: true, sunnah: true });
    expect(pickPrayerRecord(a, b)).toEqual(pickPrayerRecord(b, a));
  });

  it("lets a later correction win over a more specific stale answer", () => {
    /* Without updatedAt the ordering keeps "mosque" forever and the correction
       is impossible — which is the whole reason the field exists. */
    const stale = record({ location: "mosque", mosque: true, updatedAt: "2026-09-05T10:00:00.000Z" });
    const corrected = record({ location: "home", updatedAt: "2026-09-05T11:00:00.000Z" });
    expect(pickPrayerRecord(stale, corrected).location).toBe("home");
    expect(pickPrayerRecord(corrected, stale).location).toBe("home");
  });

  it("keeps the mosque boolean agreeing with the location it merged to", () => {
    const stale = record({ location: "mosque", mosque: true, updatedAt: "2026-09-05T10:00:00.000Z" });
    const corrected = record({ location: "home", updatedAt: "2026-09-05T11:00:00.000Z" });
    // A client that only knows the legacy boolean must not read this as a
    // mosque prayer once it has been corrected to home.
    expect(pickPrayerRecord(stale, corrected).mosque).toBe(false);
  });

  it("understands a legacy record that has the boolean and no location", () => {
    const legacy = record({ mosque: true });
    expect(pickPrayerRecord(legacy, record()).mosque).toBe(true);
  });

  it("keeps records for different prayers and days apart", () => {
    const merged = mergePrayerTracking(
      [record({ prayer: "fajr", location: "mosque", mosque: true })],
      [record({ prayer: "asr", location: "home" }), record({ dayKey: "2026-09-04", prayer: "fajr" })],
    );
    expect(merged).toHaveLength(3);
  });

  it("orders the result so two devices serialise it identically", () => {
    const one = mergePrayerTracking([record({ prayer: "isha" })], [record({ prayer: "asr" })]);
    const other = mergePrayerTracking([record({ prayer: "asr" })], [record({ prayer: "isha" })]);
    expect(one.map((r) => r.prayer)).toEqual(other.map((r) => r.prayer));
  });
});

describe("merging the Qur'an wird", () => {
  it("unions the pages read on each device", () => {
    expect(mergeWirdHistory({ [DAY]: [1, 2] }, { [DAY]: [2, 3] })).toEqual({ [DAY]: [1, 2, 3] });
  });

  it("de-duplicates, because the goal counts unique pages", () => {
    expect(mergeWirdHistory({ [DAY]: [4, 4, 5] }, { [DAY]: [5] })[DAY]).toEqual([4, 5]);
  });

  it("keeps days only one device knows about", () => {
    const merged = mergeWirdHistory({ [DAY]: [1] }, { "2026-09-04": [9] });
    expect(Object.keys(merged).sort()).toEqual(["2026-09-04", DAY]);
  });

  it("never rewrites the goal a past day was held to", () => {
    // Rewriting this would silently change whether that day already counted.
    expect(mergeQuranWirdDailyGoals({ [DAY]: 4 }, { [DAY]: 10 })[DAY]).toBe(4);
  });

  it("adopts a goal for a day the local device never recorded", () => {
    expect(mergeQuranWirdDailyGoals({}, { [DAY]: 10 })[DAY]).toBe(10);
  });
});

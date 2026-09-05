import { describe, expect, it } from "vitest";
import { getPrayerMoment, trackedLocation } from "./prayerMoment";
import { getEstimatedPrayerTimes } from "./content/prayerTimes";
import { CONFIRMED_RAKAH_TOTAL } from "./content/prayerSunnah";
import type { PrayerName, PrayerTrackingRecord } from "./types";

const DAY = "2026-09-04";

/** A clock set to the given "HH:MM" on the day the records name. */
function at(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return new Date(2026, 8, 4, h ?? 0, m ?? 0, 0, 0);
}

/** The estimated times the module itself will use, so a test never hard-codes them. */
function timeOf(prayer: PrayerName): string {
  return getEstimatedPrayerTimes(at("12:00"))[prayer];
}

function shift(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function moment(prayer: PrayerName, now: Date, records: PrayerTrackingRecord[] = []) {
  return getPrayerMoment({ prayer, now, dayKey: DAY, records });
}

describe("where a prayer stands", () => {
  it("leads the screen twenty minutes before its adhan, and not an hour before", () => {
    const dhuhr = timeOf("dhuhr");
    expect(moment("dhuhr", at(shift(dhuhr, -60))).phase).toBe("upcoming");
    expect(moment("dhuhr", at(shift(dhuhr, -10))).phase).toBe("approaching");
  });

  it("holds through its whole window rather than for the first few minutes", () => {
    const dhuhr = timeOf("dhuhr");
    const asr = timeOf("asr");
    expect(moment("dhuhr", at(shift(dhuhr, 5))).phase).toBe("now");
    expect(moment("dhuhr", at(shift(asr, -5))).phase).toBe("now");
    expect(moment("dhuhr", at(shift(asr, 5))).phase).toBe("passed");
  });

  it("tells a missed prayer from one whose time has not come", () => {
    // The old model could say neither: an unticked checkbox meant both.
    const maghrib = timeOf("maghrib");
    expect(moment("maghrib", at(shift(maghrib, -120))).phase).toBe("upcoming");
    expect(moment("maghrib", at(shift(timeOf("isha"), 30))).phase).toBe("passed");
  });

  it("takes what the reader recorded over what the clock thinks", () => {
    // Isha prayed at eleven is still Isha prayed, and the screen must not
    // insist it was missed because the window closed.
    const records: PrayerTrackingRecord[] = [
      { dayKey: DAY, prayer: "isha", mosque: true, adhkar: false, location: "mosque" },
    ];
    const late = moment("isha", at("23:30"), records);
    expect(late.phase).toBe("recorded");
    expect(late.location).toBe("mosque");
  });

  it("names the rak'ahs that are due, not the ones that are not", () => {
    const fajr = timeOf("fajr");
    // Before the fard while it is still ahead — the two before Fajr are the
    // whole reason the approach window exists.
    expect(moment("fajr", at(shift(fajr, -10))).sunnahFocus).toBe("before");
    // Fajr has no confirmed rawātib after it, so once it is in there is
    // nothing to name.
    expect(moment("fajr", at(shift(fajr, 10))).sunnahFocus).toBeNull();
    // Dhuhr has both.
    expect(moment("dhuhr", at(shift(timeOf("dhuhr"), -10))).sunnahFocus).toBe("before");
    expect(moment("dhuhr", at(shift(timeOf("dhuhr"), 10))).sunnahFocus).toBe("after");
  });

  it("offers Asr the four before it, and nothing after", () => {
    // They are not among the confirmed twelve, so the card names them as
    // encouraged rather than as rawātib — but leaving them out altogether left
    // the one prayer with a narration of its own saying nothing at all.
    const asr = timeOf("asr");
    expect(moment("asr", at(shift(asr, -10))).sunnahFocus).toBe("before");
    expect(moment("asr", at(shift(asr, 10))).sunnahFocus).toBeNull();
  });

  it("offers the two before Maghrib, which are encouraged rather than confirmed", () => {
    const maghrib = timeOf("maghrib");
    expect(moment("maghrib", at(shift(maghrib, -10))).sunnahFocus).toBe("before");
    expect(moment("maghrib", at(shift(maghrib, 10))).sunnahFocus).toBe("after");
  });
});

describe("the sunnah table", () => {
  it("adds to the twelve the narration it rests on names", () => {
    // Two before Fajr, four before Dhuhr and two after, two after Maghrib, two
    // after Isha. If an edit breaks that sum, the content no longer matches the
    // narration it cites.
    expect(CONFIRMED_RAKAH_TOTAL).toBe(12);
  });
});

describe("what a record says about where a prayer was prayed", () => {
  it("reads a record written before the field existed", () => {
    expect(trackedLocation({ dayKey: DAY, prayer: "fajr", mosque: true, adhkar: false })).toBe("mosque");
  });

  it("does not read an untouched record as praying at home", () => {
    // `mosque: false` has always meant "not recorded", which is exactly the
    // distinction the boolean could not draw.
    expect(trackedLocation({ dayKey: DAY, prayer: "fajr", mosque: false, adhkar: false })).toBeNull();
    expect(trackedLocation(undefined)).toBeNull();
  });

  it("keeps an explicit home answer", () => {
    expect(trackedLocation({ dayKey: DAY, prayer: "fajr", mosque: false, adhkar: false, location: "home" })).toBe(
      "home",
    );
  });
});

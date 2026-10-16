import { describe, expect, it } from "vitest";
import { getPrayerActions } from "./prayerActions";
import type { PrayerTrackingRecord } from "../types";

describe("prayer action saved-state presentation", () => {
  it.each(["fajr", "asr", "maghrib", "isha"] as const)(
    "%s can show a single Sunnah action checked again after clearing split fields",
    (prayer) => {
      for (const sunnah of [true, false, true]) {
        const record: PrayerTrackingRecord = {
          prayer,
          dayKey: "2026-09-05",
          mosque: false,
          adhkar: false,
          sunnah,
          sunnahBefore: false,
          sunnahAfter: false,
        };
        const actions = getPrayerActions({ prayer, language: "en", record });
        expect(actions.find((action) => action.field === "sunnah")?.checked).toBe(sunnah);
        expect(actions.filter((action) => action.field !== "sunnah").every((action) => !action.checked)).toBe(true);
      }
    },
  );

  it.each(["fajr", "maghrib"] as const)("%s retains legacy split-only completion", (prayer) => {
    const record: PrayerTrackingRecord = {
      prayer,
      dayKey: "2026-09-05",
      mosque: false,
      adhkar: false,
      ...(prayer === "fajr" ? { sunnahBefore: true } : { sunnahAfter: true }),
    };
    expect(
      getPrayerActions({ prayer, language: "ar", record }).find((action) => action.field === "sunnah")?.checked,
    ).toBe(true);
  });

  it("Dhuhr keeps before and after independent despite its aggregate Sunnah completion", () => {
    const record: PrayerTrackingRecord = {
      prayer: "dhuhr",
      dayKey: "2026-09-05",
      mosque: false,
      adhkar: false,
      sunnah: true,
      sunnahBefore: false,
      sunnahAfter: true,
    };
    const actions = getPrayerActions({ prayer: "dhuhr", language: "en", record });
    expect(actions.find((action) => action.field === "sunnahBefore")?.checked).toBe(false);
    expect(actions.find((action) => action.field === "sunnahAfter")?.checked).toBe(true);
  });
});

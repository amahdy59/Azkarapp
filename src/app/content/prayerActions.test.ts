import { describe, expect, it } from "vitest";
import { getPrayerActions, getPrayerInfoData } from "./prayerActions";
import { JUMUAH_VIRTUE } from "./fridayPrayer";
import type { PrayerTrackingRecord } from "../types";

describe("owner-approved Friday guidance", () => {
  it.each(["ar", "en"] as const)("uses the record date for %s Friday actions and evidence", (language) => {
    const record: PrayerTrackingRecord = {
      prayer: "dhuhr",
      dayKey: "2026-10-16",
      mosque: true,
      adhkar: true,
      sunnahBefore: true,
      sunnahAfter: true,
    };
    const actions = getPrayerActions({ prayer: "dhuhr", language, record });
    expect(actions.map((action) => action.field)).toEqual(["location", "adhkar", "sunnahAfter"]);
    expect(actions.every((action) => action.checked)).toBe(true);
    expect(actions[2].label).toBe(language === "ar" ? "سنة بعد الجمعة" : "Sunnah after Jumu‘ah");
    const info = getPrayerInfoData("dhuhr", language, record.dayKey);
    expect(info.rawatibVirtue).toBeUndefined();
    expect(info.sunnahItems.map((item) => [item.position, item.rakahs])).toEqual([
      ["after", 4],
      ["after", 2],
    ]);
    expect(info.sunnahItems.map((item) => item.sunnah.evidence.referenceEnglish)).toEqual([
      "Sahih Muslim 881a",
      "Sahih Muslim 882a — reported from Ibn ‘Umar",
    ]);
    expect(JUMUAH_VIRTUE.referenceEnglish).toBe("Sahih Muslim 857a");
    expect(record.sunnahBefore).toBe(true);
    expect(
      getPrayerActions({ prayer: "dhuhr", language, record, dayKey: "2026-10-15" }).map((item) => item.field),
    ).toEqual(["location", "sunnahBefore", "adhkar", "sunnahAfter"]);
    expect(getPrayerInfoData("dhuhr", language, "2026-10-15").rawatibVirtue).toBeDefined();
  });
});

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

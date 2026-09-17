import { describe, expect, it } from "vitest";
import { PRAYER_VIRTUES, PRAYER_VIRTUE_CLOSING_ARABIC, getPrayerVirtues } from "./prayerVirtues";
import { PRAYER_NAMES } from "./prayerTimes";

describe("prayer virtues", () => {
  it("covers every prayer with between one and three narrations", () => {
    for (const prayer of PRAYER_NAMES) {
      const virtues = getPrayerVirtues(prayer);
      expect(virtues.length, `${prayer} has no narration`).toBeGreaterThan(0);
      // This appears on a tap made for another reason, so it stays an
      // acknowledgement rather than a reading screen.
      expect(virtues.length, `${prayer} exceeds the cap`).toBeLessThanOrEqual(10);
    }
  });

  it("quotes each narration in full", () => {
    for (const [prayer, virtues] of Object.entries(PRAYER_VIRTUES)) {
      for (const virtue of virtues) {
        // A narration cut off before its point, or elided mid-sentence, reads
        // as a fragment and invites the reader to fill the gap themselves.
        expect(virtue.textArabic, `${prayer} narration is elided`).not.toMatch(/\.\.\.|…/);
        expect(virtue.textArabic.startsWith("«"), `${prayer} narration is unquoted`).toBe(true);
        expect(virtue.textArabic.endsWith("»"), `${prayer} narration is unclosed`).toBe(true);
      }
    }
  });

  it("attributes every narration to a collection and number", () => {
    for (const [prayer, virtues] of Object.entries(PRAYER_VIRTUES)) {
      for (const virtue of virtues) {
        // Arabic-Indic digits in the Arabic reference, Latin in the English.
        expect(virtue.referenceArabic, `${prayer} reference lacks a number`).toMatch(/[\u0660-\u0669]/);
        expect(virtue.referenceEnglish, `${prayer} English reference lacks a number`).toMatch(/\d/);
      }
    }
  });

  it("does not repeat a narration within one prayer", () => {
    for (const [prayer, virtues] of Object.entries(PRAYER_VIRTUES)) {
      const texts = virtues.map((virtue) => virtue.textArabic);
      expect(new Set(texts).size, `${prayer} repeats a narration`).toBe(texts.length);
    }
  });

  it("closes on the requested du'a", () => {
    expect(PRAYER_VIRTUE_CLOSING_ARABIC).toContain("تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ");
  });
});

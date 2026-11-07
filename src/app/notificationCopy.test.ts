import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import evidence from "./content/notificationEvidence.json";
import { notificationCopy } from "./notificationCopy";

const approved =
  readFileSync("docs/NOTIFICATION_HADITH_REVIEW_V2_2026_11_05.md", "utf8") +
  readFileSync("docs/NOTIFICATION_CATALOG_APPROVAL_2026_11_05.md", "utf8");

describe("approved notification evidence", () => {
  it("preserves each exact approved Arabic quotation and source", () => {
    for (const [id, entry] of Object.entries(evidence)) {
      const row = approved.split("\n").find((line) => new RegExp(`^\\|\\s*${id}\\s*\\|`).test(line));
      expect(row, id).toContain(`«${entry.arabic}»`);
      expect(approved).toContain(`https://sunnah.com/${entry.source}`);
      expect(entry.english.length, id).toBeGreaterThan(20);
    }
  });

  it.each(["ar", "en"] as const)("uses only the Asr pool, with Fajr retained in its conditions in %s", (language) => {
    const ids = new Set();
    for (let day = 1; day <= 12; day++) {
      const date = `2026-11-${String(day).padStart(2, "0")}`;
      const copy = notificationCopy(language, { kind: "prayer", prayer: "asr", leadMinutes: 15 }, date, "15:05");
      ids.add(copy.evidenceId);
      expect(copy.body.replace(/[ً-ْ]/g, "")).toMatch(language === "ar" ? /الفجر/ : /Fajr/);
      expect(copy).toEqual(
        notificationCopy(language, { kind: "prayer", prayer: "asr", leadMinutes: 15 }, date, "15:05"),
      );
    }
    expect(ids).toEqual(new Set(["P3", "R01"]));
  });

  it("uses Dhuhr's voluntary-prayer conditions before zawal", () => {
    for (let day = 10; day < 15; day++) {
      const copy = notificationCopy("ar", { kind: "prayer", prayer: "dhuhr", leadMinutes: 10 }, `2026-11-${day}`);
      expect(copy.evidenceId).toBe("P2b");
      expect(copy.body).toContain("أَرْبَعٍ بَعْدَهَا");
      expect(copy.body).toContain("سنة الظهر");
    }
  });

  it("keeps group benefits tied to their acts, counts and time", () => {
    const evening = Array.from({ length: 4 }, (_, i) =>
      notificationCopy("ar", { kind: "evening" }, `2026-11-${10 + i}`),
    );
    expect(evening.find((copy) => copy.evidenceId === "R04")!.body).toContain("مائة مرة صباحًا ومساءً");
    expect(evening.find((copy) => copy.evidenceId === "Z2")!.body).toContain("ثَلاَثَ مَرَّاتٍ");
    const sleep = Array.from({ length: 4 }, (_, i) =>
      notificationCopy("ar", { kind: "before_sleep" }, `2026-11-${10 + i}`),
    );
    expect(sleep.find((copy) => copy.evidenceId === "R05")!.body).toContain("أَرْبَعًا وَثَلاَثِينَ");
    expect(sleep.find((copy) => copy.evidenceId === "Z3")!.body).toContain("فِي لَيْلَةٍ");
  });
});

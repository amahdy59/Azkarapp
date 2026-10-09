import { describe, expect, it } from "vitest";
import { loadAyahTranslation, numberedAyahTranslation } from "./ayahTranslations";
import { QURAN_PASSAGES } from "./quranPassages";
import { FRIDAY_KAHF } from "./fridayKahf";
import { BAQARAH_SURAH } from "./baqarahSurah";

describe("reviewed ayah translation boundaries", () => {
  it("requires a unique explicit boundary and preserves the supplied wording", () => {
    expect(numberedAyahTranslation("First. (1) Second (with context). (2)", 2)).toBe("Second (with context).");
    expect(numberedAyahTranslation("Unnumbered", 1)).toBeNull();
    expect(numberedAyahTranslation("First (1) Duplicate (1)", 1)).toBeNull();
    expect(numberedAyahTranslation("First (1)", 2)).toBeNull();
  });
  it("extracts whole ayahs from existing content with their original translation source", async () => {
    for (const [key, content, source] of [
      ["32:2", QURAN_PASSAGES.asSajdah.translation, "Pickthall"],
      ["67:30", QURAN_PASSAGES.alMulk.translation, "Pickthall"],
      ["112:1", QURAN_PASSAGES.alIkhlas.translation, "Pickthall"],
      ["2:255", QURAN_PASSAGES.ayatAlKursi.translation, "Pickthall"],
      ["2:286", QURAN_PASSAGES.lastTwoAlBaqarah.translation, "Pickthall"],
      ["18:110", FRIDAY_KAHF[0]!.translation, "Saheeh International"],
      ["2:282", BAQARAH_SURAH.translation, "Saheeh International"],
    ] as const) {
      const translation = await loadAyahTranslation(key);
      expect(translation, key).not.toBeNull();
      expect(content).toContain(translation!.text);
      expect(translation!.text).not.toMatch(/\(\d+\)/u);
      expect(translation!.source).toBe(source);
    }
  });
  it("does not invent unavailable or invalid translations", async () => {
    for (const key of ["1:1", "2:287", "18:111", "112:5", "bad", "112:0"])
      expect(await loadAyahTranslation(key)).toBeNull();
  });
});

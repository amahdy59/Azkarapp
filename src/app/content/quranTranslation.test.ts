import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import { FRIDAY_KAHF } from "./fridayKahf";
import { AUDIO_CATALOG } from "../audio/audioManifest";
import { splitQuranTranslation } from "./quranTranslation";

describe("reviewed Quran translation boundaries", () => {
  it("preserves every character and verse identity in each shipped multi-page surah", () => {
    const entries = [...ALL_AZKAR, ...FRIDAY_KAHF].filter((entry) => entry.mushafPages?.length);
    expect(entries.length).toBeGreaterThanOrEqual(4);
    for (const entry of entries) {
      const range = AUDIO_CATALOG.assets[entry.audioAssetId!]!.requiredQuranRange;
      const verses = splitQuranTranslation(entry.translation, range);
      expect(verses, entry.id).toHaveLength(entry.verseCount!);
      expect(verses.map((verse) => verse.text + verse.marker).join(""), entry.id).toBe(entry.translation);
      expect(verses[0]?.verseKey).toBe(`${range!.surah}:${range!.ayahStart}`);
    }
  });
  it("fails closed for missing, duplicate, reordered or unmarked translations", () => {
    const range = { surah: 67, ayahStart: 1, ayahEnd: 2 };
    for (const text of [
      "One (1)",
      "One (1) Two (1)",
      "Two (2) One (1)",
      "Unmarked",
      "One (1) (2)",
      "One (1) Two (2) tail",
    ])
      expect(splitQuranTranslation(text, range)).toEqual([]);
    expect(splitQuranTranslation("One (1)", undefined)).toEqual([]);
  });
  it("supports a numbered excerpt without splitting nonnumeric parenthetical wording", () => {
    expect(splitQuranTranslation("Exact (reviewed) text (255)", { surah: 2, ayahStart: 255, ayahEnd: 255 })).toEqual([
      { verseKey: "2:255", text: "Exact (reviewed) text ", marker: "(255)" },
    ]);
  });
});

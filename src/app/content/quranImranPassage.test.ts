import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ALL_AZKAR } from "./azkar";
import { QURAN_IMRAN_PASSAGE } from "./quranImranPassage";
import type { MushafVerseData } from "./qcfMushaf";
import { APPROVED_AUDIO_ASSIGNMENTS } from "../audio/audioAssignments";

it("includes every unchanged Mushaf word and end marker from 3:190 through 3:200", () => {
  const verses = [75, 76]
    .flatMap((page) => JSON.parse(readFileSync(`public/data/mushaf/${page}.json`, "utf8")) as MushafVerseData[])
    .filter((verse) => /^3:(19\d|200)$/u.test(verse.k));
  expect(verses.map((verse) => verse.k)).toEqual(Array.from({ length: 11 }, (_, index) => `3:${190 + index}`));
  expect(QURAN_IMRAN_PASSAGE.arabicText).toBe(
    verses.map((verse) => verse.w.map((word) => (word[2] ? `﴿${word[3]}﴾` : word[3])).join(" ")).join(" "),
  );
  expect(QURAN_IMRAN_PASSAGE.arabicText).toMatch(/تُفْلِحُونَ ﴿٢٠٠﴾$/u);
  expect(QURAN_IMRAN_PASSAGE.verseCount).toBe(11);
  for (const field of [QURAN_IMRAN_PASSAGE.translation, QURAN_IMRAN_PASSAGE.transliteration])
    expect([...field.matchAll(/\((\d+)\)/gu)].map((match) => Number(match[1]))).toEqual(
      Array.from({ length: 11 }, (_, index) => 190 + index),
    );
});

it("keeps the waking entry identity/count while classifying the complete passage as Quran", () => {
  const entry = ALL_AZKAR.find((zikr) => zikr.id === "wu-hm-4")!;
  expect(entry).toMatchObject({
    category: "waking_up",
    orderIndex: 3,
    repetitionCount: 1,
    quranText: true,
    canonicalKey: "quran-003-190-200",
  });
  expect(entry.arabicText).toBe(QURAN_IMRAN_PASSAGE.arabicText);
  expect(entry.audioAssetId).toBe("wu-hm-4");
  expect(APPROVED_AUDIO_ASSIGNMENTS[entry.id]).toBe("wu-hm-4");
});

import { expect, it } from "vitest";
import { reminderAttribution, reminderToShareItem } from "./reminderSharing";
import type { DailyEvidence } from "../dailyEvidence";

const evidence: DailyEvidence = {
  hadith: "ما زال يوصيني جبريل بالجار حتى ظننت أنه سيورثه",
  hadithInArabic: true,
  benefit: "معنى",
  authenticity: "البخاري 6014 — صحيح",
  evidenceId: "neighbor",
  sourceUrl: "https://sunnah.com/bukhari:6014",
};

it("exposes the existing reviewed English narration as an optional addition to an Arabic share", () => {
  const translated = { ...evidence, translationForSharing: "Gabriel kept advising me about the neighbor." };
  const shared = reminderToShareItem(translated, "ar");
  expect(shared.arabicText).toContain(evidence.hadith);
  expect(shared.translation).toBe(translated.translationForSharing);
  expect(translated.translation).toBeUndefined();
});

it("attributes bare prophetic quotations in the displayed language and shared payload without altering them", () => {
  expect(reminderAttribution(evidence)).toBe("قال رسول الله صلى الله عليه وسلم:");
  const shared = reminderToShareItem(evidence, "ar");
  expect(shared.arabicText).toBe(`قال رسول الله صلى الله عليه وسلم:\n${evidence.hadith}`);
  expect(shared.hideRepetition).toBe(true);
  expect(shared.sourceReference).toContain(evidence.authenticity);
  expect(shared.readingUrl).toBe(evidence.sourceUrl);
  expect(reminderAttribution({ ...evidence, hadithInArabic: false, hadith: "A bare saying" })).toBe(
    "The Messenger of Allah ﷺ said:",
  );
});

it("keeps Quran, Companion reports, reported actions and existing attribution distinct", () => {
  for (const override of [
    { isQuran: true },
    { companionReport: true },
    { reportedAction: true },
    { hadith: "قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: النص" },
    { hadith: "The Prophet ﷺ said: the text", hadithInArabic: false },
  ])
    expect(reminderAttribution({ ...evidence, ...override })).toBeUndefined();
  const quran = reminderToShareItem({ ...evidence, isQuran: true, canonicalKey: "home-quran-Q06" }, "en");
  expect(quran.arabicText).toBe(evidence.hadith);
  expect(quran.quranText).toBe(true);
  expect(quran.canonicalKey).toBe("home-quran-Q06");
});

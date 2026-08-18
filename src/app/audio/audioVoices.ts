import type { AppLanguage } from "../types";

/**
 * The reciters a listener can choose between for the dua/adhkar recordings.
 *
 * `id` is the stable key written to preferences and used as the voice folder
 * in storage; it never changes, so a renamed display label cannot orphan the
 * files or reset someone's choice.
 */
export interface AudioVoice {
  id: string;
  nameArabic: string;
  nameEnglish: string;
}

const VOICES: readonly AudioVoice[] = Object.freeze([
  { id: "abdullah-muhammad", nameArabic: "عبد الله محمد", nameEnglish: "Abdullah Muhammad" },
  { id: "muhammad-alshara", nameArabic: "محمد الشرع", nameEnglish: "Muhammad Al-Shara" },
  { id: "muhammad-moataz", nameArabic: "محمد معتز", nameEnglish: "Muhammad Moataz" },
]);

/**
 * Ordered by the reader's own alphabet.
 *
 * Sorted at call time with `Intl.Collator` rather than kept in a hand-ordered
 * array: Arabic does not sort by code point, so the literal order above would
 * only be right by luck, and adding a fourth reciter would quietly put it in
 * the wrong place.
 */
export function getAudioVoices(language: AppLanguage): AudioVoice[] {
  const collator = new Intl.Collator(language === "ar" ? "ar" : "en", { sensitivity: "base" });
  return [...VOICES].sort((a, b) =>
    language === "ar" ? collator.compare(a.nameArabic, b.nameArabic) : collator.compare(a.nameEnglish, b.nameEnglish),
  );
}

export function getAudioVoiceName(voiceId: string, language: AppLanguage): string | undefined {
  const voice = VOICES.find((candidate) => candidate.id === voiceId);
  if (!voice) return undefined;
  return language === "ar" ? voice.nameArabic : voice.nameEnglish;
}

export function isKnownAudioVoice(voiceId: string): boolean {
  return VOICES.some((voice) => voice.id === voiceId);
}

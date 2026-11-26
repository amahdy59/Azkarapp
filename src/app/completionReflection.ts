import { HADITH_DHIKR_EVIDENCE, QURAN_DHIKR_EVIDENCE } from "./content/zikrBenefits";

// Whole, short general evidence from the existing reviewed catalogue. No reward
// is inferred from a session total, and no time-specific practice is prescribed.
const reflectionIds = ["h-two-phrases", "quran-13-28", "h-four-phrases", "quran-2-152"];
const catalogue = [...HADITH_DHIKR_EVIDENCE, ...QURAN_DHIKR_EVIDENCE];
const reflections = reflectionIds.map((id) => catalogue.find((item) => item.id === id)!);

/** Stable throughout a session, including rerenders, language changes and share dismissal. */
export function getCompletionReflection(sessionStart: number) {
  const seed = Number.isFinite(sessionStart) ? Math.abs(Math.floor(sessionStart / 1000)) : 0;
  return reflections[seed % reflections.length]!;
}

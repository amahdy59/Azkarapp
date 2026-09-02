import { ALL_AZKAR } from "./content/azkar";
import { toArabicAttribution, toArabicBenefit, toArabicSourceReference } from "./content/attributionArabic";
import type { AppLanguage, Zikr } from "./types";

/**
 * One piece of reviewed evidence a day: the narration behind a zikr, its
 * grading, and what the practice is for.
 *
 * Nothing new is authored here. Every one of the app's azkar already carries a
 * `hadithText` in Arabic, an `authenticityNote` with its grading, a `benefit`,
 * and a source reference — reviewed content that until now was only reachable
 * by opening a zikr and its reference sheet. The card surfaces what is already
 * there rather than introducing text that would need reviewing on its own.
 */
export interface DailyEvidence {
  zikrId: string;
  /** The narration, in Arabic. */
  hadith: string;
  /** Its grading and where it is recorded. */
  authenticity: string;
  /** What the practice is for, in the reader's language where available. */
  benefit: string;
  sourceReference?: string;
  /** The zikr this came from, so the card can offer to open it. */
  categoryId: Zikr["category"];
}

/**
 * Only entries carrying both a narration and a grading are eligible. A card
 * that showed a hadith without saying who graded it would be the one place in
 * the app making a claim it could not support.
 */
function isEligible(zikr: Zikr): boolean {
  return Boolean(zikr.hadithText && zikr.authenticityNote && zikr.benefit);
}

const POOL: readonly Zikr[] = ALL_AZKAR.filter(isEligible);

/**
 * A stable 32-bit hash of the day key.
 *
 * Deterministic on purpose. Random selection would show a different narration
 * on a phone and a tablet on the same day, and could repeat one twice in a week
 * while skipping others entirely. This walks the whole pool before repeating and
 * needs nothing stored or synced.
 */
function hashDayKey(dayKey: string): number {
  let hash = 2166136261;
  for (let index = 0; index < dayKey.length; index += 1) {
    hash ^= dayKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyEvidence(dayKey: string, language: AppLanguage): DailyEvidence | null {
  if (POOL.length === 0) return null;
  const zikr = POOL[hashDayKey(dayKey) % POOL.length]!;

  return {
    zikrId: zikr.id,
    hadith: zikr.hadithText!,
    // The gradings and most benefits were authored in English only, so an
    // Arabic reader met an Arabic narration under an English citation. The
    // lookup falls back to the reviewed English wherever no rendering exists.
    authenticity: (language === "ar" ? toArabicAttribution(zikr.authenticityNote) : zikr.authenticityNote)!,
    benefit: (language === "ar" ? zikr.benefitArabic || toArabicBenefit(zikr.benefit) : zikr.benefit)!,
    sourceReference:
      language === "ar"
        ? zikr.sourceReferenceArabic || toArabicSourceReference(zikr.sourceReference)
        : zikr.sourceReference,
    categoryId: zikr.category,
  };
}

/** How many days pass before a narration comes round again. */
export const DAILY_EVIDENCE_CYCLE_DAYS = POOL.length;

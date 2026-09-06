import { ALL_AZKAR } from "./content/azkar";
import { toArabicAttribution, toArabicBenefit, toArabicSourceReference } from "./content/attributionArabic";
import type { AppLanguage, CategoryId, Zikr } from "./types";

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
  /** The narration, in the reader's language where a rendering exists. */
  hadith: string;
  /**
   * Whether {@link hadith} is the Arabic.
   *
   * The card has to know, because `lang` and `dir` describe the text on screen
   * rather than the interface around it — marking English prose `lang="ar"` had
   * screen readers pronouncing it with an Arabic voice.
   */
  hadithInArabic: boolean;
  /** Its grading and where it is recorded. */
  authenticity: string;
  /** What the practice is for, in the reader's language where available. */
  benefit: string;
  sourceReference?: string;
  authenticityLevel?: Zikr["authenticityLevel"];
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
  return shapeEvidence(POOL[hashDayKey(dayKey) % POOL.length]!, language);
}

/** One zikr's reviewed evidence, in the reader's language where it exists. */
function shapeEvidence(zikr: Zikr, language: AppLanguage): DailyEvidence {
  /* Every narration now has a reviewed English rendering, but the fallback
     stays: it is what makes adding one more a content change rather than a
     code change, and the card must not go blank if an entry arrives without
     one. */
  const inArabic = language === "ar" || !zikr.hadithTextEnglish;
  return {
    zikrId: zikr.id,
    hadith: inArabic ? zikr.hadithText! : zikr.hadithTextEnglish!,
    hadithInArabic: inArabic,
    // The gradings and most benefits were authored in English only, so an
    // Arabic reader met an Arabic narration under an English citation. The
    // lookup falls back to the reviewed English wherever no rendering exists.
    authenticity: (language === "ar" ? toArabicAttribution(zikr.authenticityNote) : zikr.authenticityNote)!,
    benefit: (language === "ar" ? zikr.benefitArabic || toArabicBenefit(zikr.benefit) : zikr.benefit)!,
    sourceReference:
      language === "ar"
        ? zikr.sourceReferenceArabic || toArabicSourceReference(zikr.sourceReference)
        : zikr.sourceReference,
    authenticityLevel: zikr.authenticityLevel,
    categoryId: zikr.category,
  };
}

/** How many days pass before a narration comes round again. */
export const DAILY_EVIDENCE_CYCLE_DAYS = POOL.length;

/**
 * What is relevant now, rather than what is relevant today.
 *
 * The card above shows one reviewed narration a day. This narrows the same pool
 * to the moment: after Maghrib it draws on the evening collection, at bedtime
 * on the before-sleep one, and just after a prayer on the adhkar that follow
 * it. Same reviewed content, same deterministic rotation — only the pool
 * changes.
 *
 * It is deliberately not a second content library. Every item here already
 * carries a narration, a grading and a benefit that a reviewer signed off, and
 * the corpus is already organised by exactly the contexts this needs: 26
 * morning, 24 evening, 18 before sleep, 15 after prayer. A parallel module
 * would have meant a second pool to review and a second card on Home showing a
 * hadith beside the first.
 */
export type ReminderContext = CategoryId | "general";

/**
 * The contexts that fit this moment, most specific first.
 *
 * Order is the whole rule: the first context with anything in it wins, so a
 * bedtime reminder outranks a generic one, and the general pool is the floor
 * rather than a competitor. The caller supplies the moment; this file does not
 * own a second clock.
 */
export function getReminderContexts(input: {
  /** The prayer whose window is open, when one is. */
  activePrayer?: CategoryId;
  /** Which timed collection the hour belongs to, when it belongs to one. */
  timedCollection?: CategoryId;
  /** True when the reader has recorded the prayer and its adhkar are next. */
  afterPrayer?: boolean;
}): ReminderContext[] {
  const contexts: ReminderContext[] = [];
  if (input.afterPrayer) contexts.push("after_prayer");
  if (input.activePrayer) contexts.push(input.activePrayer);
  if (input.timedCollection) contexts.push(input.timedCollection);
  contexts.push("general");
  return contexts;
}

/**
 * One reviewed item for this moment, stable for the whole day.
 *
 * Keyed on the day and the context together, so moving from the evening pool to
 * the bedtime one changes the card — but returning to Home an hour later does
 * not. Random selection would have re-rolled on every navigation, which is the
 * behaviour that makes a card like this feel like noise.
 */
export function getContextualEvidence(
  dayKey: string,
  language: AppLanguage,
  contexts: readonly ReminderContext[],
): { evidence: DailyEvidence; context: ReminderContext } | null {
  for (const context of contexts) {
    const pool = context === "general" ? POOL : POOL.filter((zikr) => zikr.category === context);
    if (pool.length === 0) continue;
    const zikr = pool[hashDayKey(`${dayKey}|${context}`) % pool.length]!;
    // One shaping function, so the Arabic fallbacks cannot diverge between the
    // daily card and this one.
    return { evidence: shapeEvidence(zikr, language), context };
  }
  return null;
}

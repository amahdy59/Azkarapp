import { ALL_AZKAR } from "./content/azkar";
import { toArabicAttribution, toArabicBenefit, toArabicSourceReference } from "./content/attributionArabic";
import type { AppLanguage, CategoryId, DayMomentContext, PrayerMomentContext, ReminderContext, Zikr } from "./types";
import type { RelevantNowSource } from "./content/relevantNowLibrary";
import type { RelevantNowVerse } from "./content/relevantNowVerses";

/* Re-exported so callers keep importing the reminder vocabulary from the module
   that uses it. The types themselves live in types.ts because the library
   content declares its own contexts and must not import this module back. */
export type { DayMomentContext, PrayerMomentContext, ReminderContext };

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
  /**
   * The zikr this came from, when it came from one.
   *
   * Absent for the reviewed source library, whose Qur'an passages and
   * narrations are not azkar and have no collection to open.
   */
  zikrId?: string;
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
  /** The collection the zikr belongs to, when this came from one. */
  categoryId?: Zikr["category"];
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
 * This began as the azkar corpus alone, on the reasoning that a parallel module
 * would mean a second pool to review. A reviewed library of 41 sources — 18
 * Qur'an passages and 23 Sahih narrations, curated per moment — has since been
 * signed off, so that reasoning no longer holds and the decision is reversed.
 * What it bought is still the point: the library is an additional pool feeding
 * this same card, never a second card, and it arrives through
 * {@link selectLibraryEvidence} rather than an import, so it cannot be pulled
 * into the chunk that paints the first screen.
 */

/**
 * The contexts that fit this moment, most specific first.
 *
 * Order is the whole rule: the first context with anything in it wins, so a
 * bedtime reminder outranks a generic one, and the general pool is the floor
 * rather than a competitor. The caller supplies the moment; this file does not
 * own a second clock.
 *
 * The day contexts sit below the moment ones deliberately: on a Friday
 * afternoon the reminder should still be about Asr, and Friday's own evidence
 * surfaces in the hours that belong to nothing narrower.
 */
export function getReminderContexts(input: {
  /** The prayer whose window is open, when one is. */
  activePrayer?: CategoryId;
  /** Which timed collection the hour belongs to, when it belongs to one. */
  timedCollection?: CategoryId;
  /** True when the reader has recorded the prayer and its adhkar are next. */
  afterPrayer?: boolean;
  /** The prayer window or night watch the clock is in, when it is in one. */
  prayerMoment?: PrayerMomentContext;
  /** Windows the weekday opens, narrowest first. */
  dayMoments?: readonly DayMomentContext[];
}): ReminderContext[] {
  const contexts: ReminderContext[] = [];
  /* Friday's response hour is the narrowest window in the week and outranks
     everything, including the prayer whose window it sits inside. */
  if (input.dayMoments?.includes("friday_after_asr")) contexts.push("friday_after_asr");
  if (input.afterPrayer) contexts.push("after_prayer");
  if (input.prayerMoment) contexts.push(input.prayerMoment);
  if (input.activePrayer) contexts.push(input.activePrayer);
  if (input.timedCollection) contexts.push(input.timedCollection);
  for (const day of input.dayMoments ?? []) {
    if (day !== "friday_after_asr") contexts.push(day);
  }
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

/**
 * The same choice, made over the reviewed source library instead of the corpus.
 *
 * The library is passed in rather than imported. `dailyEvidence.ts` is reached
 * from Home, which is the initial route, and 41 sources of Arabic and English
 * would land in the chunk that paints the first screen — the growth DEC-153
 * had to re-baseline. The caller loads it with `import()` after first paint and
 * hands it here.
 *
 * Selection is the same deterministic hash over the day and the context, so a
 * source is stable for the day and the two pools cannot disagree about what
 * "stable" means.
 */
export function selectLibraryEvidence(
  library: readonly RelevantNowSource[],
  verses: readonly RelevantNowVerse[],
  dayKey: string,
  language: AppLanguage,
  contexts: readonly ReminderContext[],
): { evidence: DailyEvidence; context: ReminderContext } | null {
  for (const context of contexts) {
    const pool = library.filter((source) => source.contexts.includes(context));
    if (pool.length === 0) continue;
    const source = pool[hashDayKey(`${dayKey}|${context}`) % pool.length]!;
    const evidence = shapeLibrarySource(source, verses, language);
    if (evidence) return { evidence, context };
  }
  return null;
}

/** One library source in the shape the card already renders. */
function shapeLibrarySource(
  source: RelevantNowSource,
  verses: readonly RelevantNowVerse[],
  language: AppLanguage,
): DailyEvidence | null {
  const isArabic = language === "ar";
  const benefit = isArabic ? source.messageArabic : source.message;

  if (source.type === "quran") {
    const verse = verses.find((entry) => entry.id === source.id);
    if (!verse) return null;
    return {
      /* The Qur'an is quoted in Arabic to every reader. A translation is a
         translation, and the card says so by carrying the Pickthall rendering
         as the line underneath rather than in place of the verse. */
      hadith: verse.arabic,
      hadithInArabic: true,
      authenticity: isArabic
        ? `${verse.referenceArabic} — ${verse.surahArabic}`
        : `${verse.reference} — ${verse.surahEnglish}`,
      benefit: isArabic ? benefit : `${verse.english} — ${benefit}`,
    };
  }

  /* A narration the corpus already carries is looked up rather than copied, so
     a correction to it cannot leave two versions disagreeing. */
  if (source.zikrId) {
    const zikr =
      POOL.find((entry) => entry.id === source.zikrId) ?? ALL_AZKAR.find((entry) => entry.id === source.zikrId);
    if (!zikr) return null;
    return { ...shapeEvidence(zikr, language), benefit };
  }

  const inArabic = isArabic || !source.english;
  if (!source.arabic) return null;
  return {
    hadith: inArabic ? source.arabic : source.english!,
    hadithInArabic: inArabic,
    authenticity: (isArabic ? source.referenceArabic : source.reference) ?? "",
    benefit,
  };
}

import manifest from "./homeReminderManifest.json";
import type { DailyEvidence } from "../dailyEvidence";
import type { AppLanguage } from "../types";
import type { RelevantNowSource } from "./relevantNowLibrary";
import type { RelevantNowVerse } from "./relevantNowVerses";

export interface ReminderReadingRecord {
  evidenceId?: string;
  sourceUrl?: string;
  arabic?: string;
  english?: string;
  meaningArabic: string;
  meaningEnglish: string;
  commentaryId?: number;
  sourceStart?: number;
  sourceEnd?: number;
  referenceEnglish?: string;
  referenceArabic?: string;
  authenticityEnglish?: string;
  authenticityArabic?: string;
  meaningSourceUrl?: string;
  meaningSourceName?: "dorar";
  reportedAction?: boolean;
}

export interface ReminderReadingData {
  readings: Readonly<Record<string, ReminderReadingRecord>>;
  fallbacks: Readonly<Record<string, { reading: string; replacement: boolean }>>;
  library?: readonly RelevantNowSource[];
  verses?: readonly RelevantNowVerse[];
}

/** Exact, modern reference numbers only. Volume/page citations never become guessed IDs. */
export function reminderSourceIdentity(evidence: DailyEvidence): string | undefined {
  if (evidence.evidenceId) return evidence.evidenceId;
  if (evidence.sourceUrl) {
    const decoded = evidence.sourceUrl.replace(/%3a/gi, ":");
    const match = /^https:\/\/sunnah\.com\/((?:bukhari|muslim|tirmidhi|nasai):\d+[a-z]?)$/.exec(decoded);
    if (match) return match[1];
  }
  const reference = evidence.sourceReferenceEnglish ?? evidence.sourceReference ?? "";
  for (const [name, collection] of [
    ["(?:Sahih )?(?:al-)?Bukhari", "bukhari"],
    ["(?:Sahih )?Muslim", "muslim"],
  ]) {
    const match = new RegExp(`(?:^|;\\s*)${name} (\\d+[a-z]?)(?![\\d/])`, "i").exec(reference);
    if (match) return `${collection}:${match[1]}`;
  }
  return undefined;
}

/** Home-only enrichment; canonical azkar, counts and stored IDs remain untouched. */
export function createReminderReadingCatalogue(data: ReminderReadingData) {
  const byEvidenceId = new Map(Object.values(data.readings).map((record) => [record.evidenceId, record]));
  return {
    library: (data.library ?? []).map((source): RelevantNowSource => {
      const reading = data.readings[source.id];
      return source.type === "hadith" && reading?.arabic
        ? { ...source, arabic: reading.arabic, english: reading.english, excerpt: false }
        : source;
    }),
    verses: data.verses ?? [],
    withReminderReading(evidence: DailyEvidence, language: AppLanguage): DailyEvidence {
      const fallback = evidence.zikrId ? data.fallbacks[evidence.zikrId] : undefined;
      const identity = reminderSourceIdentity(evidence);
      const record = evidence.evidenceId
        ? (data.readings[evidence.evidenceId] ?? byEvidenceId.get(evidence.evidenceId))
        : fallback
          ? data.readings[fallback.reading]
          : identity
            ? (data.readings[identity] ?? byEvidenceId.get(identity))
            : undefined;
      if (!record) return evidence;
      const isArabic = language === "ar";
      const meaning = isArabic ? record.meaningArabic : record.meaningEnglish;
      const reference = isArabic ? record.referenceArabic : record.referenceEnglish;
      const grade = isArabic ? record.authenticityArabic : record.authenticityEnglish;
      return {
        ...evidence,
        evidenceId: evidence.evidenceId ?? record.evidenceId,
        ...(fallback?.replacement ? { zikrId: undefined, takeaway: undefined, benefit: meaning } : {}),
        hadith: record.arabic ? (isArabic ? record.arabic : record.english!) : evidence.hadith,
        hadithInArabic: record.arabic ? isArabic : evidence.hadithInArabic,
        meaning,
        meaningSourceUrl:
          record.meaningSourceUrl ??
          (record.commentaryId
            ? `https://hadeethenc.com/${isArabic ? "ar" : "en"}/browse/hadith/${record.commentaryId}`
            : (record.sourceUrl ?? evidence.sourceUrl)),
        meaningSourceName: record.meaningSourceName ?? (record.commentaryId ? "hadeethenc" : "source"),
        sourceUrl: record.sourceUrl ?? evidence.sourceUrl,
        sourceReference: reference ?? evidence.sourceReference,
        authenticity: grade ? `${reference} — ${grade}` : evidence.authenticity,
        authenticityLevel: grade ? undefined : evidence.authenticityLevel,
        excerpt: record.arabic ? false : evidence.excerpt,
        companionReport: record.reportedAction,
        reportedAction: record.reportedAction ? false : evidence.reportedAction,
      };
    },
  };
}

let cached: Promise<ReturnType<typeof createReminderReadingCatalogue>> | undefined;
export const REMINDER_CACHE_NAME = "azkar-home-reminders-v1";

async function verifyResponse(response: Response) {
  if (!response.ok) throw new Error("Reminder catalogue unavailable");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== manifest.bytes) throw new Error("Reminder catalogue size mismatch");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const checksum = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (checksum !== manifest.sha256) throw new Error("Reminder catalogue checksum mismatch");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const data = JSON.parse(await new Response(stream).text()) as ReminderReadingData;
  if (!data.readings || !data.fallbacks) throw new Error("Invalid reminder catalogue");
  return { catalogue: createReminderReadingCatalogue(data), bytes };
}

/** Pinned R2 bytes, verified on both network and offline-cache reads. */
export function loadReminderReadings() {
  return (cached ??= (async () => {
    try {
      let cache: Cache | undefined;
      try {
        if (typeof caches !== "undefined") cache = await caches.open(REMINDER_CACHE_NAME);
        const stored = await cache?.match(manifest.url);
        if (stored) {
          try {
            return (await verifyResponse(stored)).catalogue;
          } catch {
            await cache?.delete(manifest.url);
          }
        }
      } catch {
        // Restricted/quota-limited storage must not prevent online reading.
      }
      const response = await fetch(manifest.url, { credentials: "omit" });
      const verified = await verifyResponse(response);
      try {
        await cache?.put(manifest.url, new Response(verified.bytes));
      } catch {
        // Online reading still works when a browser denies offline storage.
      }
      return verified.catalogue;
    } catch (error) {
      cached = undefined;
      throw error;
    }
  })());
}

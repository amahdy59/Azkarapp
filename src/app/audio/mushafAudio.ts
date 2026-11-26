import { MUSHAF_AUDIO_PACK } from "./mushafAudioPack";
import { SURAHS } from "../content/surahInfo";
import { loadMushafPage } from "../content/qcfMushaf";
import { AUDIO_CATALOG } from "./audioManifest";
import { buildPlaybackPlan } from "./buildPlaybackPlan";
import { verifyMushafSurahText, type MushafAudioRecord } from "./mushafAudioIntegrity";
import type { AudioAsset, AudioCatalog, AudioPreferences } from "./audioTypes";
import type { Zikr } from "../types";
import { expandLibraryVariant } from "./libraryVerification";

let recordsPromise: Promise<MushafAudioRecord[]> | undefined;
export function loadMushafAudioRecords() {
  return (recordsPromise ??= (async () => {
    const bytes = Uint8Array.from(atob(MUSHAF_AUDIO_PACK), (character) => character.charCodeAt(0));
    const stream = new Response(bytes).body!.pipeThrough(new DecompressionStream("gzip"));
    const data = (await new Response(stream).json()) as MushafAudioRecord[];
    return data.map((record) => ({ ...record, variants: record.variants.map(expandLibraryVariant) }));
  })().catch((error) => {
    recordsPromise = undefined;
    throw error;
  }));
}
export const mushafAudioId = (surah: number) => `mushaf-surah-${surah}`;

/** Load existing offline-capable page data on an explicit listening request.
 * The shared resolver validates the resulting explicit asset/assignment. */
export async function buildMushafSurahPlan(surah: number, preferences: AudioPreferences) {
  const record = (await loadMushafAudioRecords()).find((item) => item.surah === surah);
  const metadata = SURAHS.find((item) => item.number === surah);
  if (!record || !metadata || record.verseCount !== metadata.versesCount || !record.variants.length)
    throw new Error("Surah recording unavailable");
  const pages = await Promise.all(record.pages.map((range) => loadMushafPage(range.page)));
  const text = verifyMushafSurahText(record, pages);
  const id = mushafAudioId(surah);
  const asset: AudioAsset = {
    id,
    titleArabic: metadata.nameArabic,
    titleEnglish: metadata.nameEnglish,
    contentKind: "quran",
    kind: "single",
    canonicalArabicText: text,
    normalizedTextHash: record.textHash,
    requiredQuranRange: { surah, ayahStart: 1, ayahEnd: record.verseCount },
    segments: [
      {
        id: `${id}-complete`,
        order: 1,
        transcriptArabic: text,
        normalizedTranscriptHash: record.textHash,
        quranReference: { surah, ayahStart: 1, ayahEnd: record.verseCount },
        variants: record.variants,
      },
    ],
    defaultVoiceId: record.variants[0]!.voiceId,
    reviewStatus: "approved",
    version: 1,
    reviewedBy: "Automated source/range/byte verification under owner release authority",
    reviewedAt: "2026-11-26",
    reviewNotes: "Owner enables automated verification for this phase; no human listening review is claimed.",
  };
  const catalog: AudioCatalog = {
    version: AUDIO_CATALOG.version,
    sources: AUDIO_CATALOG.sources,
    assets: { [id]: asset },
    assignments: { [id]: id },
  };
  const zikr: Zikr = {
    id,
    canonicalKey: id,
    audioAssetId: id,
    audioBehavior: { defaultMode: "play-once", supportedModes: ["play-once"] },
    category: "miscellaneous",
    orderIndex: surah,
    arabicText: text,
    translation: "",
    transliteration: "",
    benefit: "",
    repetitionCount: 1,
    sourceReference: `${surah}:1–${record.verseCount}`,
    isSurah: true,
    quranText: true,
    surahNameArabic: metadata.nameArabic,
    surahNameEnglish: metadata.nameEnglish,
    verseCount: record.verseCount,
    mushafPages: record.pages,
  };
  const plan = buildPlaybackPlan({
    zikrs: [zikr],
    context: { category: "miscellaneous", routineMode: "complete", source: "single", subCategory: "mushaf" },
    mode: "play-once",
    preferences,
    audioLanguage: "ar",
    catalog,
  });
  if (plan.entries.length !== 1) throw new Error("Surah recording did not pass resolution");
  return plan;
}

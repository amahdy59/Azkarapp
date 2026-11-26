import type { AudioAsset, AudioSegment, AudioVariant } from "./audioTypes";
import { getAudioVoiceName } from "./audioVoices";

export type LibraryVariant = Omit<AudioVariant, "sourceId" | "voiceName" | "mimeType"> &
  Partial<Pick<AudioVariant, "sourceId" | "voiceName" | "mimeType">>;

export type LibraryAsset = Omit<AudioAsset, "segments"> & {
  segments: (Omit<AudioSegment, "variants"> & { variants: LibraryVariant[] })[];
};

export const LIBRARY_VERIFICATION = {
  reviewedBy: "Automated verification under owner publication authority",
  reviewedAt: "2026-11-26",
  reviewNotes:
    "Pinned source transcripts/ranges, SHA-256 identity, full decoding and duration checked automatically. Hosting is verified before deployment. Human listening review is deferred; no word timing is inferred.",
};

/** Trusted generated source data only; common metadata is stored once in code
 * rather than repeated across hundreds of immutable recordings. */
export function expandLibraryVariant(value: LibraryVariant): AudioVariant {
  return {
    ...LIBRARY_VERIFICATION,
    ...value,
    sourceId: value.sourceId ?? (value.voiceId.startsWith("mp3quran-") ? "mp3quran" : "opendua-muhammad-jumah"),
    voiceName: value.voiceName ?? getAudioVoiceName(value.voiceId, "ar") ?? value.voiceId,
    mimeType: value.mimeType ?? "audio/mpeg",
    embeddedRepetitions: value.embeddedRepetitions ?? 1,
  };
}

export function expandLibraryAsset(value: LibraryAsset): AudioAsset {
  return {
    ...LIBRARY_VERIFICATION,
    ...value,
    segments: value.segments.map((segment) => ({ ...segment, variants: segment.variants.map(expandLibraryVariant) })),
  };
}

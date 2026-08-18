import type { CategoryId, RoutineMode, RitualGroupId, ZikrAudioMode } from "../types";

export type AudioReviewStatus = "pending" | "approved" | "rejected";
export type AudioContentKind = "quran" | "dua";
export type AudioStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "buffering" | "ended" | "error";
export type AudioErrorCode =
  | "not-found"
  | "network"
  | "cors"
  | "unsupported-format"
  | "decode"
  | "playback-blocked"
  | "metadata-timeout"
  | "offline-not-cached"
  | "unknown";

export interface AudioSourceRecord {
  id: string;
  name: string;
  attribution: string;
  licenseName?: string;
  licenseEvidence?: string;
  notes?: string;
}

export interface AudioVariant {
  id: string;
  voiceId: string;
  voiceName: string;
  relativePath: string;
  /** `audio/mp4` covers the m4a/mp4 masters the reciters record to. */
  mimeType: "audio/mpeg" | "audio/ogg" | "audio/mp4";
  durationMs: number;
  byteSize: number;
  sha256: string;
  sourceId: string;
  reviewStatus: AudioReviewStatus;
}

export interface AudioSegment {
  id: string;
  order: number;
  transcriptArabic: string;
  normalizedTranscriptHash: string;
  quranReference?: {
    surah: number;
    ayahStart: number;
    ayahEnd: number;
  };
  variants: AudioVariant[];
}

export interface AudioAsset {
  id: string;
  titleArabic: string;
  titleEnglish: string;
  contentKind: AudioContentKind;
  kind: "single" | "sequence";
  canonicalArabicText: string;
  normalizedTextHash: string;
  requiredQuranRange?: {
    surah: number;
    ayahStart: number;
    ayahEnd: number;
  };
  segments: AudioSegment[];
  defaultVoiceId: string;
  reviewStatus: AudioReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  version: number;
}

export interface AudioCatalog {
  version: number;
  sources: Readonly<Record<string, AudioSourceRecord>>;
  assets: Readonly<Record<string, AudioAsset>>;
  assignments: Readonly<Record<string, string>>;
}

export interface ResolvedAudioSegment {
  id: string;
  variantId: string;
  voiceId: string;
  voiceName: string;
  sourceName: string;
  attribution: string;
  url: string;
  durationMs: number;
  mimeType: AudioVariant["mimeType"];
}

export interface PlaybackEntry {
  entryId: string;
  zikrId: string;
  canonicalKey: string;
  audioAssetId: string;
  titleArabic: string;
  titleEnglish: string;
  contentKind: AudioContentKind;
  repetitions: number;
  prescribedRepetitions: number;
  repetitionUnit: "zikr" | "ritual-round";
  ritualGroupId?: RitualGroupId;
  supportedModes: ZikrAudioMode[];
  defaultVoiceId: string;
  segmentsByVoice: Readonly<Record<string, readonly ResolvedAudioSegment[]>>;
  availableVoiceIds: readonly string[];
}

export interface PlaybackPlan {
  id: string;
  context: {
    category: CategoryId;
    routineMode: RoutineMode;
    source: "single" | "section" | "full-session";
  };
  entries: readonly PlaybackEntry[];
  createdAt: number;
}

export interface AudioPlaybackError {
  code: AudioErrorCode;
  message: string;
  assetId?: string;
  variantId?: string;
  mediaErrorCode?: number;
}

export interface AudioPreferences {
  quranReciterId: string;
  duaVoiceId: string;
  playbackRate: number;
  continueOnNavigation: boolean;
}

export interface AudioControllerState {
  status: AudioStatus;
  plan: PlaybackPlan | null;
  entryIndex: number;
  segmentIndex: number;
  repetitionIndex: number;
  currentTime: number;
  duration: number;
  error: AudioPlaybackError | null;
  generation: number;
  currentVoiceId: string | null;
  playbackRate: number;
  announcement: string;
}

export type AudioResolution =
  | {
      available: true;
      asset: AudioAsset;
      segmentsByVoice: Readonly<Record<string, readonly ResolvedAudioSegment[]>>;
      availableVoiceIds: readonly string[];
    }
  | {
      available: false;
      reason:
        "unassigned" | "asset-missing" | "not-approved" | "text-mismatch" | "base-url-missing" | "variant-unavailable";
    };

export interface AudioCoverage {
  total: number;
  available: number;
  unavailable: number;
  availableZikrIds: readonly string[];
  unavailableZikrIds: readonly string[];
}

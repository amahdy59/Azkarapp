import { APPROVED_AUDIO_ASSIGNMENTS } from "./audioAssignments";
import type { AudioCatalog, AudioAsset, AudioSourceRecord } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { createArabicTextFingerprint } from "./arabicMatching";

export const AUDIO_MANIFEST_VERSION = 2;

const kahfText = FRIDAY_KAHF[0]!.arabicText;
const kahfFingerprint = createArabicTextFingerprint(kahfText);

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({
  "internal-upload": {
    id: "internal-upload",
    name: "Internal Upload",
    attribution: "Recitation by Muhammad Al-Shara",
    licenseName: "Publicly distributed",
    licenseEvidence: "N/A",
  },
});

export const AUDIO_ASSETS: Readonly<Record<string, AudioAsset>> = Object.freeze({
  "quran-018": {
    id: "quran-018",
    titleArabic: "سورة الكهف",
    titleEnglish: "Surah Al-Kahf",
    contentKind: "quran",
    kind: "sequence",
    canonicalArabicText: kahfText,
    normalizedTextHash: kahfFingerprint,
    requiredQuranRange: {
      surah: 18,
      ayahStart: 1,
      ayahEnd: 110,
    },
    segments: [
      {
        id: "quran-018-complete",
        order: 1,
        transcriptArabic: kahfText,
        normalizedTranscriptHash: kahfFingerprint,
        quranReference: {
          surah: 18,
          ayahStart: 1,
          ayahEnd: 110,
        },
        variants: [
          {
            id: "quran-018-voice-muhammad-alshara-v1",
            voiceId: "muhammad-alshara",
            voiceName: "Muhammad Al-Shara",
            relativePath: "quran/friday-kahf/muhammad-alshara/v1/friday-kahf.mp3",
            mimeType: "audio/mpeg",
            durationMs: 1931376,
            byteSize: 77256100,
            sha256: "1551ea74e07229f36bee297efa0ca8c169425bab3acf7c247e99453ffdebe6b4",
            sourceId: "internal-upload",
            reviewStatus: "approved",
          },
        ],
      },
    ],
    defaultVoiceId: "muhammad-alshara",
    reviewStatus: "approved",
    reviewNotes: "Local test version.",
    reviewedBy: "Tester",
    reviewedAt: "2026-08-29T00:00:00.000Z",
    version: 1,
  },
});

export const AUDIO_CATALOG: AudioCatalog = Object.freeze({
  version: AUDIO_MANIFEST_VERSION,
  sources: AUDIO_SOURCES,
  assets: AUDIO_ASSETS,
  assignments: APPROVED_AUDIO_ASSIGNMENTS,
});

import { ALL_AZKAR } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
const manifestIssues = validateAudioCatalog(AUDIO_CATALOG, [...ALL_AZKAR, ...COMPREHENSIVE_DUAS, ...FRIDAY_KAHF]);
if (manifestIssues.length > 0) {
  throw new Error(`Invalid audio manifest: ${manifestIssues.map((issue) => issue.code).join(", ")}`);
}

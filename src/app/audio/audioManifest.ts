import { APPROVED_AUDIO_ASSIGNMENTS } from "./audioAssignments";
import { CORE_AUDIO_ASSETS } from "./audioAssetsCore";
import { DUA_AUDIO_ASSETS } from "./audioAssetsDuas";
import additional from "./additionalAudio.data.json" with { type: "json" };
import { expandLibraryAsset, expandLibraryVariant } from "./libraryVerification";
import type { LibraryAsset, LibraryVariant } from "./libraryVerification";
import type { AudioCatalog, AudioAsset, AudioSourceRecord } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";
import { FRIDAY_KAHF } from "../content/fridayKahf";

export const AUDIO_MANIFEST_VERSION = 10;

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({
  mp3quran: {
    id: "mp3quran",
    name: "MP3Quran",
    nameArabic: "MP3Quran",
    attribution:
      "Quran recitations by Muhammad Siddiq Al-Minshawi, Mahmoud Khalil Al-Hussary and Yasser Al-Dosari, via MP3Quran.",
    attributionArabic: "تلاوات القرآن لمحمد صديق المنشاوي ومحمود خليل الحصري وياسر الدوسري، من MP3Quran.",
    licenseName: "MP3Quran developer copying permission",
    licenseEvidence: "https://www.mp3quran.net/eng/privacy",
    notes:
      "Original Al-Mulk listening acceptance remains pinned. The owner subsequently authorized expanded automatically verified source recordings without a human review gate; see docs/audio/expanded-library/evidence.json. Current defaults and reviewed timings are preserved.",
  },
  "opendua-muhammad-jumah": {
    id: "opendua-muhammad-jumah",
    name: "OpenDua",
    nameArabic: "OpenDua",
    attribution: "Recitation by Muhammad Jumah for OpenDua.",
    attributionArabic: "تلاوة محمد جمعة لصالح OpenDua.",
    licenseName: "CC BY 4.0",
    licenseEvidence: "https://opendua.org/licence/audio",
    notes:
      "Three pilot files retain owner listening acceptance. Additional v0.0.2 recordings use exact source-transcript/byte/decode verification under the owner's 2026-11-26 authority; human listening is deferred. See docs/audio/expanded-library/evidence.json. Existing defaults are preserved.",
  },
  "internal-upload": {
    id: "internal-upload",
    name: "Internal Upload",
    nameArabic: "تسجيل مرفوع داخلياً",
    attribution: "Recitation by Muhammad Al-Shara",
    attributionArabic: "تلاوة محمد الشرع",
    licenseName: "Owner-authorized internal upload",
    licenseEvidence: "internal:owner-upload-2026-10-23",
  },
  "internal-upload-abdullah-muhammad": {
    id: "internal-upload-abdullah-muhammad",
    name: "Azkarapp owner-supplied recordings",
    nameArabic: "تسجيلات زوّد بها مالك وَذَكِّرْ",
    attribution: "Recitation by Abdullah Muhammad",
    attributionArabic: "تلاوة عبد الله محمد",
    licenseName: "Owner-authorized internal upload",
    licenseEvidence: "internal:owner-upload-2026-09-12",
  },
  "english-george-recordings": {
    id: "english-george-recordings",
    name: "Azkarapp English Translation",
    nameArabic: "ترجمة إنجليزية",
    attribution: "Voice by George",
    attributionArabic: "بصوت جورج",
    licenseName: "Owner-authorized internal upload",
    licenseEvidence: "internal:owner-upload",
  },
});

export const AUDIO_ASSETS: Readonly<Record<string, AudioAsset>> = Object.freeze({
  ...Object.fromEntries(
    Object.entries({ ...CORE_AUDIO_ASSETS, ...DUA_AUDIO_ASSETS }).map(([id, asset]) => [
      id,
      {
        ...asset,
        segments: asset.segments.map((segment) => ({
          ...segment,
          variants: [
            ...segment.variants,
            ...((additional.additions as Record<string, Record<string, LibraryVariant[]>>)[id]?.[segment.id] ?? []).map(
              expandLibraryVariant,
            ),
          ],
        })),
      },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(additional.assets as Record<string, LibraryAsset>).map(([id, asset]) => [
      id,
      expandLibraryAsset(asset),
    ]),
  ),
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
  throw new Error(
    `Invalid audio manifest:\n${manifestIssues.map((issue) => `- [${issue.code}] ${issue.message}`).join("\n")}`,
  );
}

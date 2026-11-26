import { APPROVED_AUDIO_ASSIGNMENTS } from "./audioAssignments";
import { CORE_AUDIO_ASSETS } from "./audioAssetsCore";
import { DUA_AUDIO_ASSETS } from "./audioAssetsDuas";
import type { AudioCatalog, AudioAsset, AudioSourceRecord } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";
import { FRIDAY_KAHF } from "../content/fridayKahf";

export const AUDIO_MANIFEST_VERSION = 9;

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({
  mp3quran: {
    id: "mp3quran",
    name: "MP3Quran",
    nameArabic: "MP3Quran",
    attribution:
      "Al-Mulk recitations by Muhammad Siddiq Al-Minshawi, Mahmoud Khalil Al-Hussary and Yasser Al-Dosari, via MP3Quran.",
    attributionArabic: "تلاوات سورة الملك لمحمد صديق المنشاوي ومحمود خليل الحصري وياسر الدوسري، من MP3Quran.",
    licenseName: "MP3Quran developer copying permission",
    licenseEvidence: "https://www.mp3quran.net/eng/privacy",
    notes:
      "Original complete Al-Mulk files and provider permission snapshot are checksum-pinned in docs/audio/quran-reciter-pilot/manifest.json. Owner accepted all three local comparison recordings on 2026-11-26. Current defaults and timings are unchanged.",
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
      "Three pinned v0.0.2 recordings accepted after owner listening on 2026-11-26; see docs/audio/opendua-pilot/activation.json. Optional voice only; existing defaults are unchanged.",
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
  ...CORE_AUDIO_ASSETS,
  ...DUA_AUDIO_ASSETS,
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

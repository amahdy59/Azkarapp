import { APPROVED_AUDIO_ASSIGNMENTS } from "./audioAssignments";
import { CORE_AUDIO_ASSETS } from "./audioAssetsCore";
import { DUA_AUDIO_ASSETS } from "./audioAssetsDuas";
import type { AudioCatalog, AudioAsset, AudioSourceRecord } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";
import { FRIDAY_KAHF } from "../content/fridayKahf";

export const AUDIO_MANIFEST_VERSION = 5;

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({
  "internal-upload": {
    id: "internal-upload",
    name: "Internal Upload",
    nameArabic: "تسجيل مرفوع داخلياً",
    attribution: "Recitation by Muhammad Al-Shara",
    attributionArabic: "تلاوة محمد شرعي",
    licenseName: "Publicly distributed",
    licenseEvidence: "N/A",
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

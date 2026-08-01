import { APPROVED_AUDIO_ASSIGNMENTS } from "./audioAssignments";
import type { AudioCatalog, AudioAsset, AudioSourceRecord } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";

export const AUDIO_MANIFEST_VERSION = 1;

export const AUDIO_SOURCES: Readonly<Record<string, AudioSourceRecord>> = Object.freeze({});
export const AUDIO_ASSETS: Readonly<Record<string, AudioAsset>> = Object.freeze({});

export const AUDIO_CATALOG: AudioCatalog = Object.freeze({
  version: AUDIO_MANIFEST_VERSION,
  sources: AUDIO_SOURCES,
  assets: AUDIO_ASSETS,
  assignments: APPROVED_AUDIO_ASSIGNMENTS,
});

const manifestIssues = validateAudioCatalog(AUDIO_CATALOG);
if (manifestIssues.length > 0) {
  throw new Error(`Invalid audio manifest: ${manifestIssues.map((issue) => issue.code).join(", ")}`);
}

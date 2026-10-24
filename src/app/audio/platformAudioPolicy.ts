import { isNativeAndroid } from "../native/platform";

declare const __ANDROID_BUILD__: boolean | undefined;
export const isAndroidRelease = () =>
  (typeof __ANDROID_BUILD__ === "boolean" && __ANDROID_BUILD__) || isNativeAndroid();

/**
 * Keep Android eligibility explicit: only sources with recorded owner
 * authorization may be cached or redistributed by the packaged app.
 */
const ANDROID_ALLOWED_AUDIO_SOURCES = new Set([
  "internal-upload",
  "internal-upload-abdullah-muhammad",
  "english-george-recordings",
]);

export function isAudioSourceAllowed(sourceId: string, android = isAndroidRelease()) {
  return !android || ANDROID_ALLOWED_AUDIO_SOURCES.has(sourceId);
}

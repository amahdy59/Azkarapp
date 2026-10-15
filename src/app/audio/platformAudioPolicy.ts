import { isNativeAndroid } from "../native/platform";

declare const __ANDROID_BUILD__: boolean | undefined;
export const isAndroidRelease = () =>
  (typeof __ANDROID_BUILD__ === "boolean" && __ANDROID_BUILD__) || isNativeAndroid();

/** Owner decision 2026-10-15: public distribution is not recorded permission for Android. */
export function isAudioSourceAllowed(sourceId: string, android = isAndroidRelease()) {
  return !android || sourceId !== "internal-upload";
}

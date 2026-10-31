import { registerPlugin } from "@capacitor/core";
import { isNativeAndroid } from "./platform";

interface HapticsPlugin {
  vibrate(options: { pattern?: number[]; duration?: number }): Promise<void>;
  tap(): Promise<void>;
  cancel(): Promise<void>;
}

const NativeHaptics = registerPlugin<HapticsPlugin>("AzkarHaptics");

/**
 * Fires native tactile feedback on Android.
 * Synchronous and non-blocking: errors or unsupported devices never interrupt counting.
 */
export function triggerNativeHaptics(pattern: number | number[]): boolean {
  if (!isNativeAndroid()) return false;
  try {
    if (pattern === 0 || (Array.isArray(pattern) && !pattern.some((duration) => duration > 0))) {
      NativeHaptics.cancel().catch(() => {});
    } else if (Array.isArray(pattern)) {
      NativeHaptics.vibrate({ pattern }).catch(() => {});
    } else if (pattern <= 15) {
      NativeHaptics.tap().catch(() => {});
    } else {
      NativeHaptics.vibrate({ duration: pattern }).catch(() => {});
    }
  } catch {
    // Hardware haptics failure must never impact counting
  }
  // Android owns the request even if an older binary lacks the plugin. Do
  // not send a second waveform through WebView or override system policy.
  return true;
}

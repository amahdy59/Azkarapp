import type { AudioPreferences } from "./audioTypes";

const STORAGE_KEY = "azkar.audio-preferences.v1";
export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  quranReciterId: "alafasy",
  duaVoiceId: "default-dua",
  playbackRate: 1,
  continueOnNavigation: true,
};

export function loadAudioPreferences(): AudioPreferences {
  if (typeof window === "undefined") return DEFAULT_AUDIO_PREFERENCES;
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<AudioPreferences>;
    return {
      quranReciterId:
        typeof value.quranReciterId === "string" && value.quranReciterId ? value.quranReciterId : "alafasy",
      duaVoiceId: typeof value.duaVoiceId === "string" && value.duaVoiceId ? value.duaVoiceId : "default-dua",
      playbackRate:
        typeof value.playbackRate === "number" && value.playbackRate >= 0.5 && value.playbackRate <= 2
          ? value.playbackRate
          : 1,
      continueOnNavigation: typeof value.continueOnNavigation === "boolean" ? value.continueOnNavigation : true,
    };
  } catch {
    return DEFAULT_AUDIO_PREFERENCES;
  }
}

export function saveAudioPreferences(preferences: AudioPreferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Playback remains available when persistence is denied or full.
  }
}

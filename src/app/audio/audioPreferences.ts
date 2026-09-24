import type { AudioPreferences } from "./audioTypes";
import { isKnownAudioVoice } from "./audioVoices";

const STORAGE_KEY = "azkar.audio-preferences.v1";
const DEFAULT_DUA_VOICE_ID = "abdullah-muhammad";
export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  quranReciterId: "alafasy",
  duaVoiceId: DEFAULT_DUA_VOICE_ID,
  playbackRate: 1,
  volume: 1,
  muted: false,
  continueOnNavigation: true,
};

export function loadAudioPreferences(): AudioPreferences {
  if (typeof window === "undefined") return DEFAULT_AUDIO_PREFERENCES;
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<AudioPreferences>;
    const volume = typeof value.volume === "number" && value.volume >= 0 && value.volume <= 1 ? value.volume : 1;
    return {
      quranReciterId:
        typeof value.quranReciterId === "string" && value.quranReciterId ? value.quranReciterId : "alafasy",
      duaVoiceId:
        typeof value.duaVoiceId === "string" && isKnownAudioVoice(value.duaVoiceId)
          ? value.duaVoiceId
          : DEFAULT_DUA_VOICE_ID,
      playbackRate:
        typeof value.playbackRate === "number" && value.playbackRate >= 0.5 && value.playbackRate <= 2
          ? value.playbackRate
          : 1,
      volume,
      muted: volume === 0 || value.muted === true,
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

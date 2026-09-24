import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_AUDIO_PREFERENCES, loadAudioPreferences } from "./audioPreferences";

describe("audio preferences", () => {
  afterEach(() => window.localStorage.clear());

  it("uses a stable reviewed voice by default", () => {
    expect(DEFAULT_AUDIO_PREFERENCES.duaVoiceId).toBe("abdullah-muhammad");
    expect(loadAudioPreferences().duaVoiceId).toBe("abdullah-muhammad");
  });

  it("migrates the legacy placeholder and unknown voices to the reviewed default", () => {
    window.localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ duaVoiceId: "default-dua" }));
    expect(loadAudioPreferences().duaVoiceId).toBe("abdullah-muhammad");

    window.localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ duaVoiceId: "unreviewed-voice" }));
    expect(loadAudioPreferences().duaVoiceId).toBe("abdullah-muhammad");
  });

  it("keeps a known saved voice", () => {
    window.localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ duaVoiceId: "muhammad-moataz" }));
    expect(loadAudioPreferences().duaVoiceId).toBe("muhammad-moataz");
  });
});

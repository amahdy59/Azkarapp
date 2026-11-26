import { describe, expect, it } from "vitest";
import acceptance from "../../../docs/audio/quran-reciter-pilot/activation.json";
import manifest from "../../../docs/audio/quran-reciter-pilot/manifest.json";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "./audioManifest";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { getAudioVoices, getAudioVoiceName, isKnownAudioVoice } from "./audioVoices";
import { getPreferredVoiceId, resolveAudioAssetById } from "./resolveAudioAsset";
import { isAudioSourceAllowed } from "./platformAudioPolicy";
import { resolveQuranTiming } from "./quranTimings";
import { ALL_AZKAR } from "../content/azkar";
import { estimateAudioDownloadBytes, getAudioDownloadVoices } from "./audioOfflineCache";

describe("accepted optional Al-Mulk reciters", () => {
  it("binds exactly the three approved complete recordings without changing the existing default or Quran range", () => {
    const resolution = resolveAudioAssetById("s-hm-110b")!;
    expect(resolution.asset).toMatchObject({
      defaultVoiceId: "abdullah-muhammad",
      version: 1,
      requiredQuranRange: { surah: 67, ayahStart: 1, ayahEnd: 30 },
    });
    expect(AUDIO_MANIFEST_VERSION).toBe(9);
    expect(getPreferredVoiceId({ available: true, ...resolution }, DEFAULT_AUDIO_PREFERENCES)).toBe(
      "abdullah-muhammad",
    );
    expect(resolution.availableVoiceIds).toEqual([
      "abdullah-muhammad",
      ...acceptance.recordings.map((recording) => recording.voiceId),
    ]);
    for (const accepted of acceptance.recordings) {
      const original = manifest.recordings.find((recording) => recording.readingId === accepted.readingId)!;
      const variant = resolution.asset.segments[0]!.variants.find((entry) => entry.voiceId === accepted.voiceId)!;
      expect(variant).toMatchObject({
        sha256: original.sha256,
        byteSize: original.byteSize,
        durationMs: accepted.durationMs,
        reviewStatus: "approved",
        reviewedAt: acceptance.reviewedAt,
        embeddedRepetitions: 1,
      });
      expect(accepted.sha256).toBe(original.sha256);
      expect(variant.reviewedBy).toContain("Ahmed Mahdy");
      expect(isAudioSourceAllowed(variant.sourceId, true)).toBe(true);
      expect(resolveQuranTiming(resolution.segmentsByVoice[accepted.voiceId]![0]!)).toBeNull();
      const preferences = { ...DEFAULT_AUDIO_PREFERENCES, quranReciterId: accepted.voiceId };
      const readings = ALL_AZKAR.filter((entry) => entry.audioAssetId === "s-hm-110b");
      expect(readings.length).toBeGreaterThan(0);
      expect(estimateAudioDownloadBytes(readings, preferences)).toBe(original.byteSize);
      expect(getAudioDownloadVoices(readings, preferences)).toEqual([
        { id: accepted.voiceId, name: original.nameArabic },
      ]);
    }
  });

  it("keeps Quran reciter names separate from dua choices and preserves fallback on other surahs", () => {
    for (const accepted of acceptance.recordings) {
      const original = manifest.recordings.find((recording) => recording.readingId === accepted.readingId)!;
      expect(getAudioVoiceName(accepted.voiceId, "ar")).toBe(original.nameArabic);
      expect(getAudioVoiceName(accepted.voiceId, "en")).toBe(original.nameEnglish);
      expect(getAudioVoices("ar").some((voice) => voice.id === accepted.voiceId)).toBe(false);
      expect(isKnownAudioVoice(accepted.voiceId)).toBe(false);
      const kahf = resolveAudioAssetById("quran-018")!;
      expect(
        getPreferredVoiceId(
          { available: true, ...kahf },
          { ...DEFAULT_AUDIO_PREFERENCES, quranReciterId: accepted.voiceId },
        ),
      ).toBe(kahf.asset.defaultVoiceId);
    }
    const extra = Object.values(AUDIO_CATALOG.assets).filter((asset) =>
      asset.segments.some((segment) => segment.variants.some((variant) => variant.sourceId === "mp3quran")),
    );
    expect(extra.map((asset) => asset.id)).toEqual(["s-hm-110b"]);
    expect(DEFAULT_AUDIO_PREFERENCES).toMatchObject({ duaVoiceId: "abdullah-muhammad", quranReciterId: "alafasy" });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import * as platform from "../native/platform";
import { ALL_AZKAR } from "../content/azkar";
import { AUDIO_CATALOG } from "./audioManifest";
import { isAudioSourceAllowed } from "./platformAudioPolicy";
import { resolveAudioAssetById } from "./resolveAudioAsset";
import { estimateAudioDownloadBytes } from "./audioOfflineCache";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";

afterEach(() => vi.restoreAllMocks());

describe("Android recording eligibility", () => {
  it("identifies only two Muhammad Al-Shara recordings under the restricted source", () => {
    const variants = Object.values(AUDIO_CATALOG.assets).flatMap((asset) =>
      asset.segments.flatMap((segment) => segment.variants),
    );
    const restricted = variants.filter(({ sourceId }) => !isAudioSourceAllowed(sourceId, true));
    expect(restricted.map(({ id }) => id)).toEqual([
      "quran-002-voice-muhammad-alshara-v1",
      "quran-018-voice-muhammad-alshara-v1",
    ]);
    for (const variant of variants.filter(({ voiceId }) => voiceId === "abdullah-muhammad")) {
      expect(variant.sourceId).toBe("internal-upload-abdullah-muhammad");
      expect(isAudioSourceAllowed(variant.sourceId, true)).toBe(true);
    }
    expect(isAudioSourceAllowed("english-george-recordings", true)).toBe(true);
  });

  it("keeps the existing web catalog available", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(false);
    expect(resolveAudioAssetById("quran-002")).not.toBeNull();
    expect(resolveAudioAssetById("quran-018")).not.toBeNull();
  });

  it("blocks Android playback and download estimates only for the excluded recordings", () => {
    vi.spyOn(platform, "isNativeAndroid").mockReturnValue(true);
    expect(resolveAudioAssetById("quran-002")).toBeNull();
    expect(resolveAudioAssetById("quran-018")).toBeNull();
    const restricted = ALL_AZKAR.filter(
      ({ audioAssetId }) => audioAssetId === "quran-002" || audioAssetId === "quran-018",
    );
    expect(restricted.length).toBeGreaterThan(0);
    expect(estimateAudioDownloadBytes(restricted, DEFAULT_AUDIO_PREFERENCES)).toBe(0);
    const evening = ALL_AZKAR.filter(({ id }) => id === "e-hm-76a");
    expect(evening).toHaveLength(1);
    expect(estimateAudioDownloadBytes(evening, DEFAULT_AUDIO_PREFERENCES)).toBeGreaterThan(0);
  });
});

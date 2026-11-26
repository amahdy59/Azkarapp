import { describe, expect, it } from "vitest";
import acceptance from "../../../docs/audio/opendua-pilot/activation.json";
import pilot from "../../../docs/audio/opendua-pilot/pilot.json";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "./audioManifest";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { getPreferredVoiceId, getVoiceIdForLanguage, resolveAudioAssetById } from "./resolveAudioAsset";
import { isAudioSourceAllowed } from "./platformAudioPolicy";

describe("owner-accepted optional OpenDua recordings", () => {
  it("retains the three accepted recordings' exact bytes and owner listening evidence within expanded coverage", () => {
    const additional = Object.values(AUDIO_CATALOG.assets).flatMap((asset) =>
      asset.segments.flatMap((segment) =>
        segment.variants
          .filter(
            (variant) =>
              variant.voiceId === pilot.voiceId &&
              acceptance.recordings.some(
                (recording) => recording.assetId === asset.id && recording.sha256 === variant.sha256,
              ),
          )
          .map((variant) => ({ asset, variant })),
      ),
    );
    expect(additional).toHaveLength(3);
    for (const { asset, variant } of additional) {
      const candidate = pilot.candidates.find((item) => item.assetId === asset.id)!;
      expect(acceptance.recordings).toContainEqual({ assetId: asset.id, sha256: variant.sha256 });
      expect(variant).toMatchObject({
        sha256: candidate.sha256,
        byteSize: candidate.byteSize,
        relativePath: candidate.relativePath,
        reviewStatus: "approved",
        reviewedAt: acceptance.reviewedAt,
        embeddedRepetitions: 1,
      });
      expect(variant.reviewedBy).toContain("Ahmed Mahdy");
      expect(isAudioSourceAllowed(variant.sourceId, true)).toBe(true);
      expect(AUDIO_CATALOG.sources[variant.sourceId]).toMatchObject({
        licenseName: "CC BY 4.0",
        licenseEvidence: "https://opendua.org/licence/audio",
      });
    }
  });

  it("uses the optional voice only after selection and keeps legacy voices and cache identities", () => {
    expect(AUDIO_MANIFEST_VERSION).toBe(10);
    expect(DEFAULT_AUDIO_PREFERENCES).toMatchObject({ duaVoiceId: "abdullah-muhammad", quranReciterId: "alafasy" });
    for (const candidate of pilot.candidates) {
      const resolution = resolveAudioAssetById(candidate.assetId)!;
      expect(resolution.asset.defaultVoiceId).toBe("abdullah-muhammad");
      expect(resolution.asset.version).toBe(candidate.assetId === "m-hm-91" ? 2 : 1);
      expect(resolution.availableVoiceIds).toContain("abdullah-muhammad");
      expect(getPreferredVoiceId({ available: true, ...resolution }, DEFAULT_AUDIO_PREFERENCES)).toBe(
        "abdullah-muhammad",
      );
      expect(
        getVoiceIdForLanguage(
          { available: true, ...resolution },
          { ...DEFAULT_AUDIO_PREFERENCES, duaVoiceId: pilot.voiceId },
          "ar",
        ),
      ).toBe(pilot.voiceId);
      expect(resolution.segmentsByVoice[pilot.voiceId]![0]!.url).toContain(
        `${candidate.relativePath}?sha256=${candidate.sha256}`,
      );
    }
  });

  it("preserves default fallback on uncovered items and never substitutes the new voice for Quran or English", () => {
    const preferences = { ...DEFAULT_AUDIO_PREFERENCES, duaVoiceId: pilot.voiceId };
    const uncovered = resolveAudioAssetById("s-hm-107")!;
    expect(getPreferredVoiceId({ available: true, ...uncovered }, preferences)).toBe(uncovered.asset.defaultVoiceId);
    const english = resolveAudioAssetById("m-hm-91")!;
    expect(getVoiceIdForLanguage({ available: true, ...english }, preferences, "en")).toBe("english-george");
    for (const asset of Object.values(AUDIO_CATALOG.assets).filter((item) => item.contentKind === "quran")) {
      expect(
        asset.segments.every((segment) => segment.variants.every((variant) => variant.voiceId !== pilot.voiceId)),
      ).toBe(true);
    }
  });
});

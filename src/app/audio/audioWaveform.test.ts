import { describe, expect, it } from "vitest";
import { AUDIO_CATALOG } from "./audioManifest";
import { getAudioWaveform } from "./audioWaveform";
import type { ResolvedAudioSegment } from "./audioTypes";
import unavailable from "./audioWaveformUnavailable.json";

describe("approved recording waveforms", () => {
  it("accounts for every approved recording with verified peaks or an explicit failed source check", () => {
    for (const asset of Object.values(AUDIO_CATALOG.assets)) {
      if (asset.reviewStatus !== "approved") continue;
      for (const segment of asset.segments)
        for (const variant of segment.variants) {
          if (variant.reviewStatus !== "approved") continue;
          const rejected = unavailable.find((record) => record.manifestChecksum === variant.sha256);
          if (rejected) {
            expect(rejected.hostedChecksum).not.toBe(rejected.manifestChecksum);
            expect(
              getAudioWaveform({ url: `https://audio.test/file?sha256=${variant.sha256}` } as ResolvedAudioSegment),
            ).toBeNull();
            continue;
          }
          const peaks = getAudioWaveform({
            url: `https://audio.test/file?sha256=${variant.sha256}`,
          } as ResolvedAudioSegment);
          expect(peaks, variant.id).toHaveLength(96);
          expect(peaks?.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)).toBe(true);
          expect(Math.max(...peaks!)).toBe(255);
        }
    }
  });
  it("falls back rather than inventing peaks for missing, changed, or malformed recordings", () => {
    for (const segment of [
      null,
      { url: "bad" },
      { url: "https://audio.test/file" },
      { url: "https://audio.test/file?sha256=changed" },
    ]) {
      expect(getAudioWaveform(segment as ResolvedAudioSegment | null)).toBeNull();
    }
  });
});

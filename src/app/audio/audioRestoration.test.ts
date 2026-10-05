import { describe, expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { AUDIO_CATALOG } from "./audioManifest";
import { buildPlaybackPlan } from "./buildPlaybackPlan";
import { getAudioWaveform } from "./audioWaveform";

describe("owner-reviewed Arabic audio restoration", () => {
  for (const id of ["m-hm-91", "e-hm-91", "misc-ref-3", "m-hm-96", "e-hm-96", "friday-dua-08"]) {
    it(`plays the exact replacement for ${id} and retains explicit English narration`, () => {
      const zikr = [...ALL_AZKAR, ...COMPREHENSIVE_DUAS].find((item) => item.id === id)!;
      const isDua = id === "friday-dua-08";
      const isIstighfar = id.endsWith("96");
      const options = {
        zikrs: [zikr],
        context: { category: zikr.category, source: "single" as const, routineMode: "complete" as const },
      };
      const arabic = buildPlaybackPlan({ ...options, audioLanguage: "ar", mode: "repeat-prescribed-count" });
      expect(arabic.entries).toHaveLength(1);
      const entry = arabic.entries[0]!;
      expect(entry.availableVoiceIds).toEqual(["abdullah-muhammad"]);
      const segments = entry.segmentsByVoice[entry.defaultVoiceId]!;
      expect(segments).toHaveLength(1);
      const segment = segments[0]!;
      expect(segment.url).toContain(
        isDua
          ? "/dua/friday-dua-08/abdullah-muhammad/v2/friday-dua-08.mp3"
          : isIstighfar
            ? "/dua/m-hm-96/abdullah-muhammad/v2/m-hm-96.wav"
            : "/dua/m-hm-91/abdullah-muhammad/v2/m-hm-91.wav",
      );
      expect(segment.url).toContain(
        isDua
          ? "sha256=58c80cb54e7a893e241bb9192b304af10493fd2f07e1a920a596dc773f621962"
          : isIstighfar
            ? "sha256=4d8202df6bc5801c9a272bee31152c9871806e41ff91a671033b6953854d93c0"
            : "sha256=d8a955ce62ce89037c4e61bbf5d686e75205c7e44f9577cf2c7efc2aea4b75ed",
      );
      expect(entry.repetitions).toBe(zikr.repetitionCount);
      expect(segment.embeddedRepetitions).toBe(1);
      expect(getAudioWaveform(segment)).toHaveLength(96);
      const english = buildPlaybackPlan({ ...options, audioLanguage: "en" });
      expect(english.entries).toHaveLength(1);
      expect(english.entries[0]?.availableVoiceIds).toEqual(["english-george"]);
      expect(english.entries[0]?.segmentsByVoice["english-george"]?.[0]?.url).toContain("/english-george/v1/");
      expect(AUDIO_CATALOG.assets[entry.audioAssetId]?.version).toBe(2);
    });
  }
});

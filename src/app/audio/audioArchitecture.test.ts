import { describe, expect, it } from "vitest";
import { ALL_AZKAR, getAzkarForMode } from "../content/azkar";
import type { Zikr } from "../types";
import { createArabicTextFingerprint, normalizeArabicForAudioMatching } from "./arabicMatching";
import { buildPlaybackPlan, getAudioCoverage } from "./buildPlaybackPlan";
import { QURAN_AUDIO_REVIEW_CANDIDATES, REJECTED_LEGACY_AUDIO_MATCHES } from "./audioReviewCandidates";
import { resolveAudioAsset } from "./resolveAudioAsset";
import type { AudioAsset, AudioCatalog } from "./audioTypes";
import { validateAudioCatalog } from "./validateAudioCatalog";

const SHA256 = "a".repeat(64);

function catalogFor(zikrs: readonly Zikr[], voices = ["voice-a"]): { catalog: AudioCatalog; zikrs: Zikr[] } {
  const sources = {
    source: {
      id: "source",
      name: "Test source",
      attribution: "Test attribution",
      licenseName: "Test only",
      licenseEvidence: "https://example.test/license",
    },
  };
  const assets: Record<string, AudioAsset> = {};
  const assignments: Record<string, string> = {};
  const playable = zikrs.map((zikr) => {
    const assetId = `asset:${zikr.canonicalKey}`;
    assignments[zikr.id] = assetId;
    assets[assetId] ??= {
      id: assetId,
      titleArabic: zikr.surahNameArabic ?? "ذِكْر",
      titleEnglish: zikr.surahNameEnglish ?? zikr.translation.split(".")[0] ?? "Zikr",
      contentKind: zikr.surahNameEnglish ? "quran" : "dua",
      kind: "single",
      canonicalArabicText: zikr.arabicText,
      normalizedTextHash: createArabicTextFingerprint(zikr.arabicText),
      segments: [
        {
          id: `${assetId}:1`,
          order: 1,
          transcriptArabic: zikr.arabicText,
          normalizedTranscriptHash: createArabicTextFingerprint(zikr.arabicText),
          variants: voices.map((voiceId) => ({
            id: `${assetId}:${voiceId}`,
            voiceId,
            voiceName: voiceId,
            relativePath: `${encodeURIComponent(assetId)}/${voiceId}/v1.mp3`,
            mimeType: "audio/mpeg",
            durationMs: 1_000,
            byteSize: 100,
            sha256: SHA256,
            sourceId: "source",
            reviewStatus: "approved",
          })),
        },
      ],
      defaultVoiceId: "voice-a",
      reviewStatus: "approved",
      reviewedBy: "Test reviewer",
      reviewedAt: "2026-08-01T00:00:00.000Z",
      version: 1,
    };
    return { ...zikr, audioAssetId: assetId };
  });
  return { catalog: { version: 1, sources, assets, assignments }, zikrs: playable };
}

describe("explicit audio content architecture", () => {
  it("normalizes formatting without merging different Arabic letters", () => {
    expect(normalizeArabicForAudioMatching("قُـلْ  هُوَ ﴿١﴾")).toBe("قل هو");
    expect(createArabicTextFingerprint("أَمْسَيْنَا")).not.toBe(createArabicTextFingerprint("أَصْبَحْنَا"));
  });

  it("resolves only an exact approved assignment and never falls back", () => {
    const ayatAlKursi = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-75")!;
    const introduction = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-75a")!;
    const { catalog, zikrs } = catalogFor([ayatAlKursi], ["voice-a", "voice-b"]);
    const playable = zikrs[0]!;

    const resolution = resolveAudioAsset(playable, { catalog, baseUrl: "https://audio.example.test/v1" });
    expect(resolution.available).toBe(true);
    if (resolution.available) expect(resolution.availableVoiceIds).toEqual(["voice-a", "voice-b"]);
    expect(resolveAudioAsset(introduction, { catalog, baseUrl: "https://audio.example.test/v1" })).toEqual({
      available: false,
      reason: "unassigned",
    });
    expect(REJECTED_LEGACY_AUDIO_MATCHES["m-hm-75a"]).toContain("2:255");
  });

  it("rejects an assigned recording when the Arabic fingerprint differs", () => {
    const source = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-75")!;
    const { catalog, zikrs } = catalogFor([source]);
    expect(
      resolveAudioAsset(
        { ...zikrs[0]!, arabicText: `${source.arabicText} ا` },
        { catalog, baseUrl: "https://audio.example.test" },
      ),
    ).toEqual({ available: false, reason: "text-mismatch" });
  });

  it("preserves Core and Complete semantic order in immutable plans", () => {
    for (const category of ["morning", "evening", "before_sleep"] as const) {
      for (const mode of ["core", "complete"] as const) {
        const source = getAzkarForMode(category, mode);
        const { catalog, zikrs } = catalogFor(source);
        const plan = buildPlaybackPlan({
          zikrs,
          context: { category, routineMode: mode, source: "full-session" },
          catalog,
          baseUrl: "https://audio.example.test",
        });
        expect(plan.entries.map((entry) => entry.zikrId)).toEqual(source.map((zikr) => zikr.id));
        expect(Object.isFrozen(plan)).toBe(true);
        expect(Object.isFrozen(plan.entries)).toBe(true);
        expect(getAudioCoverage(zikrs, { catalog, baseUrl: "https://audio.example.test" }).unavailable).toBe(0);
      }
    }
  });

  it("reuses canonical identities across every audited shared group", () => {
    const expectShared = (ids: string[]) =>
      expect(new Set(ids.map((id) => ALL_AZKAR.find((zikr) => zikr.id === id)?.canonicalKey)).size).toBe(1);
    expectShared(["m-hm-75", "e-hm-75", "s-hm-100", "ap-ref-9"]);
    expectShared(["m-hm-76a", "e-hm-76a", "s-hm-99-ikhlas"]);
    expectShared(["m-hm-79", "e-hm-79", "misc-ref-8"]);
    expectShared(["s-hm-106-allahu-akbar", "ap-tasbeeh-allahuakbar"]);
  });

  it("models the complete required Quran ranges before any recording can be approved", () => {
    const candidate = (id: string) => QURAN_AUDIO_REVIEW_CANDIDATES.find((item) => item.assetId === id)!;
    expect(candidate("quran-112").expectedSegmentIds).toEqual(["112-1", "112-2", "112-3", "112-4"]);
    expect(candidate("quran-113").expectedSegmentIds).toHaveLength(5);
    expect(candidate("quran-114").expectedSegmentIds).toHaveLength(6);
    expect(candidate("quran-002-285-286").expectedSegmentIds).toEqual(["002-285", "002-286"]);
    expect(candidate("quran-032").expectedSegmentIds).toHaveLength(30);
    expect(candidate("quran-067").expectedSegmentIds).toHaveLength(30);
  });

  it("never treats a partial Three Quls download as a complete ritual round", () => {
    const threeQuls = getAzkarForMode("before_sleep", "core").filter((zikr) => zikr.ritualGroupId === "three_quls");
    const { catalog, zikrs: playable } = catalogFor(threeQuls.slice(0, 2));
    const byId = new Map(playable.map((zikr) => [zikr.id, zikr]));
    const plan = buildPlaybackPlan({
      zikrs: threeQuls.map((zikr) => byId.get(zikr.id) ?? zikr),
      context: { category: "before_sleep", routineMode: "core", source: "section" },
      mode: "repeat-prescribed-count",
      catalog,
      baseUrl: "https://audio.example.test",
    });
    expect(plan.entries).toHaveLength(2);
    expect(plan.entries.every((entry) => entry.repetitions === 1 && !entry.ritualGroupId)).toBe(true);
  });

  it("fails validation for an incomplete Quran range", () => {
    const zikr = ALL_AZKAR.find((item) => item.id === "m-hm-76a")!;
    const { catalog, zikrs } = catalogFor([zikr]);
    const asset = catalog.assets[zikrs[0]!.audioAssetId!]!;
    const invalidCatalog: AudioCatalog = {
      ...catalog,
      assets: {
        ...catalog.assets,
        [asset.id]: {
          ...asset,
          requiredQuranRange: { surah: 112, ayahStart: 1, ayahEnd: 4 },
          segments: [{ ...asset.segments[0]!, quranReference: { surah: 112, ayahStart: 1, ayahEnd: 1 } }],
        },
      },
    };
    expect(validateAudioCatalog(invalidCatalog, zikrs).map((issue) => issue.code)).toContain("quran-range");
  });
});

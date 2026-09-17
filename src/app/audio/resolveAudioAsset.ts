import type { Zikr } from "../types";
import { AUDIO_CATALOG } from "./audioManifest";
import { createArabicTextFingerprint } from "./arabicMatching";
import type { AudioCatalog, AudioPreferences, AudioResolution, ResolvedAudioSegment } from "./audioTypes";

export function getAudioBaseUrl(): string {
  return (import.meta.env.VITE_AUDIO_BASE_URL ?? "").trim().replace(/\/+$/, "");
}

function joinAudioUrl(baseUrl: string, relativePath: string): string {
  return `${baseUrl}/${relativePath.replace(/^\/+/, "")}`;
}

export function resolveAudioAsset(
  zikr: Zikr,
  options: { catalog?: AudioCatalog; baseUrl?: string } = {},
): AudioResolution {
  const catalog = options.catalog ?? AUDIO_CATALOG;
  const assetId = catalog.assignments[zikr.id];
  if (!assetId || zikr.audioAssetId !== assetId) return { available: false, reason: "unassigned" };

  const asset = catalog.assets[assetId];
  if (!asset) return { available: false, reason: "asset-missing" };
  if (asset.reviewStatus !== "approved") return { available: false, reason: "not-approved" };
  if (asset.normalizedTextHash !== createArabicTextFingerprint(zikr.arabicText)) {
    return { available: false, reason: "text-mismatch" };
  }

  const baseUrl = (options.baseUrl ?? getAudioBaseUrl()).replace(/\/+$/, "");
  if (!baseUrl) return { available: false, reason: "base-url-missing" };

  const voices = new Set(
    asset.segments.flatMap((segment) =>
      segment.variants
        .filter(
          (variant) =>
            variant.reviewStatus === "approved" && Boolean(catalog.sources[variant.sourceId]?.attribution.trim()),
        )
        .map((variant) => variant.voiceId),
    ),
  );
  const availableVoiceIds = [...voices].filter((voiceId) =>
    asset.segments.every((segment) =>
      segment.variants.some((variant) => variant.voiceId === voiceId && variant.reviewStatus === "approved"),
    ),
  );
  if (!availableVoiceIds.includes(asset.defaultVoiceId)) return { available: false, reason: "variant-unavailable" };

  const segmentsByVoice = Object.fromEntries(
    availableVoiceIds.map((voiceId) => [
      voiceId,
      asset.segments
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((segment): ResolvedAudioSegment => {
          const variant = segment.variants.find(
            (candidate) =>
              candidate.voiceId === voiceId &&
              candidate.reviewStatus === "approved" &&
              Boolean(catalog.sources[candidate.sourceId]?.attribution.trim()),
          )!;
          const source = catalog.sources[variant.sourceId]!;
          return {
            id: segment.id,
            variantId: variant.id,
            voiceId,
            voiceName: variant.voiceName,
            sourceName: source.name,
            attribution: source.attribution,
            url: joinAudioUrl(baseUrl, variant.relativePath),
            durationMs: variant.durationMs,
            mimeType: variant.mimeType,
          };
        }),
    ]),
  );

  return { available: true, asset, segmentsByVoice, availableVoiceIds };
}

export function getPreferredVoiceId(
  resolution: Extract<AudioResolution, { available: true }>,
  preferences: AudioPreferences,
) {
  const preferred = resolution.asset.contentKind === "quran" ? preferences.quranReciterId : preferences.duaVoiceId;
  return resolution.availableVoiceIds.includes(preferred) ? preferred : resolution.asset.defaultVoiceId;
}

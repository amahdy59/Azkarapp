import type { AppLanguage, Zikr } from "../types";
import { AUDIO_CATALOG } from "./audioManifest";
import { createArabicTextFingerprint } from "./arabicMatching";
import type { AudioCatalog, AudioPreferences, AudioResolution, ResolvedAudioSegment } from "./audioTypes";

export function getAudioBaseUrl(): string {
  const url = import.meta.env.VITE_AUDIO_BASE_URL || "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev";
  return url.trim().replace(/\/+$/, "");
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
            sourceNameArabic: source.nameArabic,
            attribution: source.attribution,
            attributionArabic: source.attributionArabic,
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

/**
 * Resolves a voice without ever crossing the listener's requested language.
 * English narration exists only for dua assets; Qur'an remains Arabic
 * recitation. Returning null lets coverage and playback omit unavailable
 * entries instead of silently switching languages mid-session.
 */
export function getVoiceIdForLanguage(
  resolution: Extract<AudioResolution, { available: true }>,
  preferences: AudioPreferences,
  language: AppLanguage,
): string | null {
  if (language === "en") {
    return resolution.asset.contentKind === "dua" && resolution.availableVoiceIds.includes("english-george")
      ? "english-george"
      : null;
  }

  const arabicVoiceIds = resolution.availableVoiceIds.filter((voiceId) => voiceId !== "english-george");
  if (arabicVoiceIds.length === 0) return null;
  const preferred = resolution.asset.contentKind === "quran" ? preferences.quranReciterId : preferences.duaVoiceId;
  if (arabicVoiceIds.includes(preferred)) return preferred;
  return arabicVoiceIds.includes(resolution.asset.defaultVoiceId)
    ? resolution.asset.defaultVoiceId
    : arabicVoiceIds[0]!;
}

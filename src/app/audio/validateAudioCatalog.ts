import type { Zikr } from "../types";
import { createArabicTextFingerprint } from "./arabicMatching";
import type { AudioCatalog } from "./audioTypes";

export interface AudioValidationIssue {
  code: string;
  message: string;
  assetId?: string;
  zikrId?: string;
}

const isSha256 = (value: string) => /^[a-f\d]{64}$/i.test(value);

export function validateAudioCatalog(catalog: AudioCatalog, zikrs: readonly Zikr[] = []): AudioValidationIssue[] {
  const issues: AudioValidationIssue[] = [];
  const paths = new Map<string, string>();

  for (const [assetId, asset] of Object.entries(catalog.assets)) {
    if (asset.id !== assetId)
      issues.push({ code: "asset-id-conflict", message: `${assetId} has conflicting id.`, assetId });
    if (asset.reviewStatus === "approved" && (!asset.reviewedBy || !asset.reviewedAt)) {
      issues.push({ code: "missing-review", message: `${assetId} has no human review record.`, assetId });
    }
    if (asset.normalizedTextHash !== createArabicTextFingerprint(asset.canonicalArabicText)) {
      issues.push({ code: "asset-text-hash", message: `${assetId} has an invalid Arabic fingerprint.`, assetId });
    }
    if (asset.segments.length === 0)
      issues.push({ code: "missing-segments", message: `${assetId} has no segments.`, assetId });

    const orderedSegments = [...asset.segments].sort((a, b) => a.order - b.order);
    if (
      createArabicTextFingerprint(orderedSegments.map((segment) => segment.transcriptArabic).join(" ")) !==
      asset.normalizedTextHash
    ) {
      issues.push({
        code: "segment-asset-text-mismatch",
        message: `${assetId} segments do not match its canonical transcript.`,
        assetId,
      });
    }
    orderedSegments.forEach((segment, index) => {
      if (segment.order !== index + 1) {
        issues.push({ code: "segment-order", message: `${assetId} segment order is not contiguous.`, assetId });
      }
      if (segment.normalizedTranscriptHash !== createArabicTextFingerprint(segment.transcriptArabic)) {
        issues.push({
          code: "segment-text-hash",
          message: `${assetId}:${segment.id} has an invalid transcript fingerprint.`,
          assetId,
        });
      }
      for (const variant of segment.variants) {
        const source = catalog.sources[variant.sourceId];
        if (!source) issues.push({ code: "missing-source", message: `${variant.id} has no source record.`, assetId });
        if (source && !source.attribution.trim()) {
          issues.push({ code: "missing-attribution", message: `${variant.id} has no attribution.`, assetId });
        }
        if (source && (!source.licenseName?.trim() || !source.licenseEvidence?.trim())) {
          issues.push({ code: "missing-license", message: `${variant.id} has no licence evidence.`, assetId });
        }
        if (!variant.voiceName.trim()) {
          issues.push({ code: "missing-voice-name", message: `${variant.id} has no display voice name.`, assetId });
        }
        if (variant.durationMs <= 0 || variant.byteSize <= 0) {
          issues.push({
            code: "invalid-media-metadata",
            message: `${variant.id} has invalid media metadata.`,
            assetId,
          });
        }
        if (!isSha256(variant.sha256)) {
          issues.push({ code: "invalid-checksum", message: `${variant.id} has no valid SHA-256 checksum.`, assetId });
        }
        if (/^(?:https?:)?\/\//i.test(variant.relativePath) || variant.relativePath.includes("..")) {
          issues.push({ code: "unsafe-path", message: `${variant.id} must use a safe relative path.`, assetId });
        }
        const previousTranscript = paths.get(variant.relativePath);
        const fingerprint = segment.normalizedTranscriptHash;
        if (previousTranscript && previousTranscript !== fingerprint) {
          issues.push({
            code: "conflicting-path",
            message: `${variant.relativePath} has conflicting transcripts.`,
            assetId,
          });
        }
        paths.set(variant.relativePath, fingerprint);
      }
    });

    if (asset.reviewStatus === "approved") {
      const approvedDefaultCoverage = orderedSegments.every((segment) =>
        segment.variants.some(
          (variant) => variant.voiceId === asset.defaultVoiceId && variant.reviewStatus === "approved",
        ),
      );
      if (!approvedDefaultCoverage) {
        issues.push({
          code: "missing-default-variant",
          message: `${assetId} lacks approved default voice coverage.`,
          assetId,
        });
      }
    }

    if (asset.requiredQuranRange) {
      const actualVerses = orderedSegments.flatMap((segment) => {
        const reference = segment.quranReference;
        if (!reference) return [];
        return Array.from({ length: reference.ayahEnd - reference.ayahStart + 1 }, (_, index) => ({
          surah: reference.surah,
          ayah: reference.ayahStart + index,
        }));
      });
      const expectedVerses = Array.from(
        { length: asset.requiredQuranRange.ayahEnd - asset.requiredQuranRange.ayahStart + 1 },
        (_, index) => ({ surah: asset.requiredQuranRange!.surah, ayah: asset.requiredQuranRange!.ayahStart + index }),
      );
      if (JSON.stringify(actualVerses) !== JSON.stringify(expectedVerses)) {
        issues.push({
          code: "quran-range",
          message: `${assetId} does not contain its exact required verse range.`,
          assetId,
        });
      }
    }
  }

  const zikrById = new Map(zikrs.map((zikr) => [zikr.id, zikr]));
  const canonicalByFingerprint = new Map<string, { canonicalKey: string; zikrId: string }>();
  for (const zikr of zikrs) {
    const fingerprint = createArabicTextFingerprint(zikr.arabicText);
    const previous = canonicalByFingerprint.get(fingerprint);
    if (previous && previous.canonicalKey !== zikr.canonicalKey) {
      issues.push({
        code: "duplicate-canonical-conflict",
        message: `${previous.zikrId} and ${zikr.id} have identical text but different canonical keys.`,
        zikrId: zikr.id,
      });
    } else {
      canonicalByFingerprint.set(fingerprint, { canonicalKey: zikr.canonicalKey, zikrId: zikr.id });
    }
  }
  const assetByCanonicalKey = new Map<string, string>();
  for (const [zikrId, assetId] of Object.entries(catalog.assignments)) {
    const zikr = zikrById.get(zikrId);
    const asset = catalog.assets[assetId];
    if (!zikr) issues.push({ code: "missing-zikr", message: `${zikrId} is not application content.`, zikrId });
    if (!asset)
      issues.push({ code: "missing-asset", message: `${zikrId} references missing asset ${assetId}.`, zikrId });
    if (asset && asset.reviewStatus !== "approved") {
      issues.push({
        code: "unapproved-assignment",
        message: `${zikrId} references an unapproved asset.`,
        zikrId,
        assetId,
      });
    }
    if (zikr && asset && createArabicTextFingerprint(zikr.arabicText) !== asset.normalizedTextHash) {
      issues.push({
        code: "assignment-text-mismatch",
        message: `${zikrId} text does not match ${assetId}.`,
        zikrId,
        assetId,
      });
    }
    if (zikr) {
      const previousAssetId = assetByCanonicalKey.get(zikr.canonicalKey);
      if (previousAssetId && previousAssetId !== assetId) {
        issues.push({
          code: "canonical-asset-conflict",
          message: `${zikr.canonicalKey} uses multiple assets.`,
          zikrId,
          assetId,
        });
      }
      assetByCanonicalKey.set(zikr.canonicalKey, assetId);
    }
  }

  return issues;
}

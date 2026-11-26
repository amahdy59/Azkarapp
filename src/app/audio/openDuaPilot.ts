import pilot from "../../../docs/audio/opendua-pilot/pilot.json";
import { normalizeArabicForAudioMatching } from "./arabicMatching";
import type { AudioCatalog } from "./audioTypes";

/** Review intake only. This module is never imported by the production catalogue. */
export const OPEN_DUA_PILOT = pilot;
export type OpenDuaCandidate = (typeof pilot.candidates)[number];
export interface OpenDuaReview {
  reviewer: string;
  decision: "unreviewed" | "reviewed-match" | "rejected" | "needs-new-recording";
  notes: string;
  updatedAt?: string;
}
const REVIEW_KEY = "azkar.opendua-pilot-review.v1";
export const EMPTY_OPEN_DUA_REVIEW: OpenDuaReview = { reviewer: "", decision: "unreviewed", notes: "" };

export function matchesOpenDuaCandidate(candidate: OpenDuaCandidate, catalog: AudioCatalog): boolean {
  const asset = catalog.assets[candidate.assetId];
  const segment = asset?.segments[0];
  return Boolean(
    asset?.contentKind === "dua" &&
    asset.segments.length === 1 &&
    segment?.id === candidate.segmentId &&
    normalizeArabicForAudioMatching(asset.canonicalArabicText) ===
      normalizeArabicForAudioMatching(candidate.transcriptArabic) &&
    normalizeArabicForAudioMatching(segment.transcriptArabic) ===
      normalizeArabicForAudioMatching(candidate.transcriptArabic),
  );
}

export function loadOpenDuaReviews(): Record<string, OpenDuaReview> {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(REVIEW_KEY) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    return Object.fromEntries(
      pilot.candidates.flatMap((candidate) => {
        const review = (stored as Record<string, Partial<OpenDuaReview>>)[candidate.sha256];
        if (
          !review ||
          typeof review.reviewer !== "string" ||
          typeof review.notes !== "string" ||
          !["unreviewed", "reviewed-match", "rejected", "needs-new-recording"].includes(review.decision ?? "")
        )
          return [];
        return [
          [
            candidate.sha256,
            {
              reviewer: review.reviewer.slice(0, 160),
              decision: review.decision,
              notes: review.notes.slice(0, 4000),
              ...(typeof review.updatedAt === "string" ? { updatedAt: review.updatedAt } : {}),
            } as OpenDuaReview,
          ],
        ];
      }),
    );
  } catch {
    return {};
  }
}

export function saveOpenDuaReviews(reviews: Record<string, OpenDuaReview>): boolean {
  try {
    window.localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
    return true;
  } catch {
    return false;
  }
}

export function exportOpenDuaReviews(reviews: Record<string, OpenDuaReview>) {
  return {
    purpose: "Independent recording review evidence; does not activate production audio",
    source: { licence: pilot.licence, licenceUrl: pilot.licenceUrl, attribution: pilot.attribution },
    candidates: pilot.candidates.map((candidate) => ({
      ...candidate,
      review: reviews[candidate.sha256] ?? { ...EMPTY_OPEN_DUA_REVIEW },
    })),
  };
}

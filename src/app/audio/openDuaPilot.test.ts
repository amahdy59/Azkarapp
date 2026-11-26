import { beforeEach, describe, expect, it } from "vitest";
import { AUDIO_CATALOG } from "./audioManifest";
import { DEFAULT_AUDIO_PREFERENCES, loadAudioPreferences } from "./audioPreferences";
import { resolveAudioAssetById } from "./resolveAudioAsset";
import {
  EMPTY_OPEN_DUA_REVIEW,
  OPEN_DUA_PILOT,
  exportOpenDuaReviews,
  loadOpenDuaReviews,
  matchesOpenDuaCandidate,
  saveOpenDuaReviews,
} from "./openDuaPilot";

beforeEach(() => localStorage.clear());
describe("OpenDua additive review pilot", () => {
  it("retains pinned intake identities after owner acceptance without changing defaults or preferences", () => {
    const snapshot = JSON.stringify(AUDIO_CATALOG);
    const before = OPEN_DUA_PILOT.candidates.map((candidate) => resolveAudioAssetById(candidate.assetId));
    for (const candidate of OPEN_DUA_PILOT.candidates) {
      expect(candidate.reviewStatus).toBe("pending");
      expect(matchesOpenDuaCandidate(candidate, AUDIO_CATALOG)).toBe(true);
      expect(
        AUDIO_CATALOG.assets[candidate.assetId]!.segments[0]!.variants.some(
          (v) => v.voiceId === OPEN_DUA_PILOT.voiceId && v.sha256 === candidate.sha256,
        ),
      ).toBe(true);
    }
    expect(OPEN_DUA_PILOT.candidates.map((candidate) => resolveAudioAssetById(candidate.assetId))).toEqual(before);
    expect(JSON.stringify(AUDIO_CATALOG)).toBe(snapshot);
    expect(loadAudioPreferences()).toEqual(DEFAULT_AUDIO_PREFERENCES);
  });
  it("rejects changed wording, segment identity and Quran assets", () => {
    const candidate = OPEN_DUA_PILOT.candidates[0]!;
    expect(
      matchesOpenDuaCandidate({ ...candidate, transcriptArabic: `${candidate.transcriptArabic} زيادة` }, AUDIO_CATALOG),
    ).toBe(false);
    expect(matchesOpenDuaCandidate({ ...candidate, segmentId: "other" }, AUDIO_CATALOG)).toBe(false);
    expect(matchesOpenDuaCandidate({ ...candidate, assetId: "quran-002" }, AUDIO_CATALOG)).toBe(false);
  });
  it("excludes a pending additional variant even when an asset already has a human approval", () => {
    const catalog = structuredClone(AUDIO_CATALOG);
    const candidate = OPEN_DUA_PILOT.candidates[0]!;
    const asset = catalog.assets[candidate.assetId]!;
    asset.segments[0]!.variants.push({
      ...asset.segments[0]!.variants[0]!,
      id: "pending-opendua",
      voiceId: "pending-other-voice",
      reviewStatus: "pending",
    });
    const resolution = resolveAudioAssetById(candidate.assetId, { catalog });
    expect(resolution?.availableVoiceIds).not.toContain("pending-other-voice");
    expect(resolution?.asset.defaultVoiceId).toBe(AUDIO_CATALOG.assets[candidate.assetId]!.defaultVoiceId);
  });
  it("keys review notes by recording checksum and never treats notes as activation", () => {
    const before = resolveAudioAssetById(OPEN_DUA_PILOT.candidates[0]!.assetId);
    const candidate = OPEN_DUA_PILOT.candidates[0]!;
    const review = { reviewer: "Test reviewer", notes: "Test evidence only", decision: "reviewed-match" as const };
    expect(saveOpenDuaReviews({ [candidate.sha256]: review })).toBe(true);
    expect(loadOpenDuaReviews()[candidate.sha256]).toEqual(review);
    const exported = exportOpenDuaReviews(loadOpenDuaReviews());
    expect(exported.candidates[0]).toMatchObject({ sha256: candidate.sha256, reviewStatus: "pending", review });
    expect(exported.candidates[1]!.review).toEqual(EMPTY_OPEN_DUA_REVIEW);
    expect(resolveAudioAssetById(candidate.assetId)).toEqual(before);
    localStorage.setItem("azkar.opendua-pilot-review.v1", JSON.stringify({ "retired-checksum": review }));
    expect(loadOpenDuaReviews()).toEqual({});
  });
  it("recovers from malformed saved notes", () => {
    for (const value of [
      "null",
      "[]",
      "invalid",
      JSON.stringify({ [OPEN_DUA_PILOT.candidates[0]!.sha256]: { notes: 42 } }),
    ]) {
      localStorage.setItem("azkar.opendua-pilot-review.v1", value);
      expect(loadOpenDuaReviews()).toEqual({});
    }
  });
});

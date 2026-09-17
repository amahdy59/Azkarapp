import type { RoutineMode, Zikr, ZikrAudioMode } from "../types";
import { AUDIO_CATALOG } from "./audioManifest";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { getPreferredVoiceId, resolveAudioAsset } from "./resolveAudioAsset";
import type { AudioCatalog, AudioCoverage, AudioPreferences, PlaybackEntry, PlaybackPlan } from "./audioTypes";

type PlanContext = PlaybackPlan["context"];

const createPlanId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `audio-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function freezePlan(plan: PlaybackPlan): PlaybackPlan {
  for (const entry of plan.entries) {
    Object.values(entry.segmentsByVoice).forEach(Object.freeze);
    Object.freeze(entry.segmentsByVoice);
    Object.freeze(entry.availableVoiceIds);
    Object.freeze(entry.supportedModes);
    Object.freeze(entry);
  }
  Object.freeze(plan.entries);
  Object.freeze(plan.context);
  return Object.freeze(plan);
}

export function getAudioCoverage(
  zikrs: readonly Zikr[],
  options: { catalog?: AudioCatalog; baseUrl?: string } = {},
): AudioCoverage {
  const availableZikrIds: string[] = [];
  const unavailableZikrIds: string[] = [];
  for (const zikr of zikrs) {
    (resolveAudioAsset(zikr, options).available ? availableZikrIds : unavailableZikrIds).push(zikr.id);
  }
  return {
    total: zikrs.length,
    available: availableZikrIds.length,
    unavailable: unavailableZikrIds.length,
    availableZikrIds,
    unavailableZikrIds,
  };
}

export function buildPlaybackPlan({
  zikrs,
  context,
  mode = "play-once",
  catalog = AUDIO_CATALOG,
  baseUrl,
  preferences = DEFAULT_AUDIO_PREFERENCES,
}: {
  zikrs: readonly Zikr[];
  context: PlanContext;
  mode?: Extract<ZikrAudioMode, "play-once" | "repeat-prescribed-count">;
  catalog?: AudioCatalog;
  baseUrl?: string;
  preferences?: AudioPreferences;
}): PlaybackPlan {
  const entries: PlaybackEntry[] = [];
  const resolvedZikrs = zikrs.flatMap((zikr) => {
    const resolution = resolveAudioAsset(zikr, { catalog, baseUrl });
    return resolution.available ? [{ zikr, resolution }] : [];
  });
  const expectedRitualCounts = new Map<string, number>();
  const availableRitualCounts = new Map<string, number>();
  for (const zikr of zikrs) {
    if (zikr.ritualGroupId)
      expectedRitualCounts.set(zikr.ritualGroupId, (expectedRitualCounts.get(zikr.ritualGroupId) ?? 0) + 1);
  }
  for (const { zikr } of resolvedZikrs) {
    if (zikr.ritualGroupId)
      availableRitualCounts.set(zikr.ritualGroupId, (availableRitualCounts.get(zikr.ritualGroupId) ?? 0) + 1);
  }

  for (const { zikr, resolution } of resolvedZikrs) {
    const completeRitual =
      !zikr.ritualGroupId ||
      expectedRitualCounts.get(zikr.ritualGroupId) === availableRitualCounts.get(zikr.ritualGroupId);
    const canRepeat =
      zikr.audioBehavior.supportedModes.includes("repeat-prescribed-count") &&
      (zikr.ritualGroupId !== "three_quls" || completeRitual);
    const repetitions = mode === "repeat-prescribed-count" && canRepeat ? zikr.repetitionCount : 1;
    entries.push({
      entryId: `${zikr.id}:${entries.length + 1}`,
      zikrId: zikr.id,
      canonicalKey: zikr.canonicalKey,
      audioAssetId: resolution.asset.id,
      titleArabic: resolution.asset.titleArabic,
      titleEnglish: resolution.asset.titleEnglish,
      contentKind: resolution.asset.contentKind,
      repetitions,
      prescribedRepetitions: zikr.repetitionCount,
      repetitionUnit: zikr.ritualGroupId === "three_quls" && completeRitual ? "ritual-round" : "zikr",
      ...(zikr.ritualGroupId && completeRitual ? { ritualGroupId: zikr.ritualGroupId } : {}),
      supportedModes: [...zikr.audioBehavior.supportedModes],
      defaultVoiceId: getPreferredVoiceId(resolution, preferences),
      segmentsByVoice: resolution.segmentsByVoice,
      availableVoiceIds: [...resolution.availableVoiceIds],
    });
  }
  return freezePlan({ id: createPlanId(), context: { ...context }, entries, createdAt: Date.now() });
}

export function withPlaybackMode(
  plan: PlaybackPlan,
  mode: Extract<ZikrAudioMode, "play-once" | "repeat-prescribed-count">,
): PlaybackPlan {
  return freezePlan({
    ...plan,
    id: createPlanId(),
    createdAt: Date.now(),
    context: { ...plan.context },
    entries: plan.entries.map((entry) => ({
      ...entry,
      availableVoiceIds: [...entry.availableVoiceIds],
      supportedModes: [...entry.supportedModes],
      segmentsByVoice: Object.fromEntries(
        Object.entries(entry.segmentsByVoice).map(([voiceId, segments]) => [voiceId, [...segments]]),
      ),
      repetitions:
        mode === "repeat-prescribed-count" && entry.supportedModes.includes("repeat-prescribed-count")
          ? entry.prescribedRepetitions
          : 1,
    })),
  });
}

export function routineContext(
  category: PlanContext["category"],
  routineMode: RoutineMode,
  source: PlanContext["source"],
): PlanContext {
  return { category, routineMode, source };
}

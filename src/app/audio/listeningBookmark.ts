import type { AudioPreferences, PlaybackPlan } from "./audioTypes";

const KEY = "azkarapp.listening-bookmark.v1";
export interface ListeningBookmark {
  version: 1;
  savedAt: number;
  context: PlaybackPlan["context"];
  ids: string[];
  mode: "play-once" | "repeat-prescribed-count";
  voice: string;
  entry: number;
  segment: number;
  repetition: number;
  seconds: number;
  fingerprint: string;
}
export function recordingFingerprint(plan: PlaybackPlan, entry: number, segment: number, voice: string) {
  const item = plan.entries[entry]?.segmentsByVoice[voice]?.[segment];
  return item?.sha256 ? `${item.variantId}:${item.sha256}` : null;
}
export function readListeningBookmark(): ListeningBookmark | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null") as ListeningBookmark | null;
    if (
      !value ||
      value.version !== 1 ||
      !Number.isFinite(value.savedAt) ||
      Date.now() - value.savedAt > 30 * 86400_000 ||
      value.savedAt > Date.now() + 60_000 ||
      typeof value.context?.category !== "string" ||
      !value.context.category ||
      value.context.category.length > 80 ||
      !["core", "complete"].includes(value.context?.routineMode) ||
      !["single", "section", "full-session"].includes(value.context?.source) ||
      !Array.isArray(value.ids) ||
      !value.ids.length ||
      value.ids.length > 1000 ||
      !value.ids.every((id) => typeof id === "string" && id.length < 160) ||
      !["play-once", "repeat-prescribed-count"].includes(value.mode) ||
      typeof value.voice !== "string" ||
      value.voice.length > 100 ||
      ![value.entry, value.segment, value.repetition].every((index) => Number.isSafeInteger(index) && index >= 0) ||
      value.entry >= value.ids.length ||
      !Number.isFinite(value.seconds) ||
      value.seconds < 0 ||
      value.seconds > 86400 ||
      typeof value.fingerprint !== "string" ||
      value.fingerprint.length > 250
    )
      return null;
    return {
      ...value,
      context: {
        category: value.context.category,
        routineMode: value.context.routineMode,
        source: value.context.source,
        ...(typeof value.context.subCategory === "string" && value.context.subCategory.length < 100
          ? { subCategory: value.context.subCategory }
          : {}),
        ...(value.context.fridayDuaFlow === true ? { fridayDuaFlow: true } : {}),
      },
    };
  } catch {
    return null;
  }
}
export function saveListeningBookmark(value: ListeningBookmark | null) {
  try {
    if (value) localStorage.setItem(KEY, JSON.stringify(value));
    else localStorage.removeItem(KEY);
    return true;
  } catch {
    /* Listening works with denied/full storage. */
    return false;
  }
}
/** Rebuild from reviewed current content. Stored URLs or sacred text are never trusted. */
export async function restoreListeningPlan(bookmark: ListeningBookmark, preferences: AudioPreferences) {
  const { CATEGORIES } = await import("../content/categories");
  if (!CATEGORIES.some((category) => category.id === bookmark.context.category)) return null;
  const [{ ALL_AZKAR }, { buildPlaybackPlan }] = await Promise.all([
    import("../content/azkar"),
    import("./buildPlaybackPlan"),
  ]);
  const extra =
    bookmark.context.category === "friday_kahf"
      ? (await import("../content/fridayKahf")).FRIDAY_KAHF
      : bookmark.context.category === "comprehensive_duas"
        ? (await import("../content/comprehensiveDuas")).COMPREHENSIVE_DUAS
        : [];
  const byId = new Map([...ALL_AZKAR, ...extra].map((item) => [item.id, item]));
  const zikrs = bookmark.ids.map((id) => byId.get(id));
  if (zikrs.some((item) => !item)) return null;
  const plan = buildPlaybackPlan({
    zikrs: zikrs.filter((item) => item !== undefined),
    context: bookmark.context,
    mode: bookmark.mode,
    preferences: { ...preferences, duaVoiceId: bookmark.voice, quranReciterId: bookmark.voice },
    audioLanguage: bookmark.voice === "english-george" ? "en" : "ar",
  });
  if (
    plan.entries.length !== bookmark.ids.length ||
    plan.entries.some((entry, index) => entry.zikrId !== bookmark.ids[index]) ||
    bookmark.repetition >= (plan.entries[bookmark.entry]?.repetitions ?? 0) ||
    recordingFingerprint(plan, bookmark.entry, bookmark.segment, bookmark.voice) !== bookmark.fingerprint
  )
    return null;
  return plan;
}

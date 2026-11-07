import { afterEach, describe, expect, it } from "vitest";
import {
  readListeningBookmark,
  saveListeningBookmark,
  recordingFingerprint,
  restoreListeningPlan,
  type ListeningBookmark,
} from "./listeningBookmark";
import type { PlaybackPlan } from "./audioTypes";
const bookmark: ListeningBookmark = {
  version: 1,
  savedAt: Date.now(),
  context: { category: "morning", routineMode: "core", source: "section" },
  ids: ["m-hm-75"],
  mode: "play-once",
  voice: "alafasy",
  entry: 0,
  segment: 0,
  repetition: 0,
  seconds: 25,
  fingerprint: "variant:checksum",
};
afterEach(() => localStorage.removeItem("azkarapp.listening-bookmark.v1"));
describe("device listening bookmark", () => {
  it("roundtrips bounded identifiers and position without URLs or reviewed text", () => {
    saveListeningBookmark(bookmark);
    expect(readListeningBookmark()).toEqual(bookmark);
    const raw = localStorage.getItem("azkarapp.listening-bookmark.v1")!;
    expect(raw).not.toContain("https:");
    saveListeningBookmark(null);
    expect(readListeningBookmark()).toBeNull();
  });
  it.each([
    { seconds: -1 },
    { seconds: Infinity },
    { entry: 1 },
    { segment: 0.5 },
    { version: 2 },
    { ids: [] },
    { savedAt: Date.now() - 31 * 86400_000 },
    { context: { category: "unknown" } },
  ])("rejects malformed or expired input %j", (update) => {
    localStorage.setItem("azkarapp.listening-bookmark.v1", JSON.stringify({ ...bookmark, ...update }));
    expect(readListeningBookmark()).toBeNull();
  });
  it("does not accept unchecked recordings for offset restoration", () => {
    const plan = { entries: [{ segmentsByVoice: { voice: [{ variantId: "v" }] } }] } as unknown as PlaybackPlan;
    expect(recordingFingerprint(plan, 0, 0, "voice")).toBeNull();
  });
});

it("rebuilds the queue from reviewed content and rejects a changed recording or repetition", async () => {
  const [{ getAzkarForMode }, { buildPlaybackPlan }, { DEFAULT_AUDIO_PREFERENCES }] = await Promise.all([
    import("../content/azkar"),
    import("./buildPlaybackPlan"),
    import("./audioPreferences"),
  ]);
  const plan = buildPlaybackPlan({
    zikrs: getAzkarForMode("evening", "core"),
    context: { category: "evening", routineMode: "core", source: "section" },
    mode: "repeat-prescribed-count",
    audioLanguage: "ar",
  });
  expect(plan.entries.length).toBeGreaterThan(1);
  const voice = plan.entries[0]!.defaultVoiceId;
  const fingerprint = recordingFingerprint(plan, 0, 0, voice)!;
  expect(fingerprint).toBeTruthy();
  const saved: ListeningBookmark = {
    ...bookmark,
    context: plan.context,
    ids: plan.entries.map((entry) => entry.zikrId),
    voice,
    mode: "repeat-prescribed-count",
    fingerprint,
  };
  const restored = await restoreListeningPlan(saved, DEFAULT_AUDIO_PREFERENCES);
  expect(restored?.entries.map((entry) => entry.zikrId)).toEqual(saved.ids);
  expect(await restoreListeningPlan({ ...saved, fingerprint: "changed" }, DEFAULT_AUDIO_PREFERENCES)).toBeNull();
  expect(await restoreListeningPlan({ ...saved, repetition: 9999 }, DEFAULT_AUDIO_PREFERENCES)).toBeNull();
  expect(await restoreListeningPlan({ ...saved, ids: ["retired-recording"] }, DEFAULT_AUDIO_PREFERENCES)).toBeNull();
});

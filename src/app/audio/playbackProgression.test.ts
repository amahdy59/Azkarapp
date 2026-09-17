import { describe, expect, it } from "vitest";
import type { PlaybackEntry, PlaybackPlan } from "./audioTypes";
import { getNextPlaybackPosition } from "./playbackProgression";

const segment = (id: string) => ({
  id,
  variantId: id,
  voiceId: "voice",
  voiceName: "Voice",
  sourceName: "Source",
  attribution: "Attribution",
  url: `https://audio.test/${id}.mp3`,
  durationMs: 1,
  mimeType: "audio/mpeg" as const,
});
const entry = (id: string, segments: number, options: Partial<PlaybackEntry> = {}): PlaybackEntry => ({
  entryId: id,
  zikrId: id,
  canonicalKey: id,
  audioAssetId: id,
  titleArabic: id,
  titleEnglish: id,
  contentKind: "quran",
  repetitions: 1,
  prescribedRepetitions: 1,
  repetitionUnit: "zikr",
  supportedModes: ["play-once"],
  defaultVoiceId: "voice",
  segmentsByVoice: { voice: Array.from({ length: segments }, (_, index) => segment(`${id}-${index + 1}`)) },
  availableVoiceIds: ["voice"],
  ...options,
});
const plan = (entries: PlaybackEntry[]): PlaybackPlan => ({
  id: "plan",
  context: { category: "before_sleep", routineMode: "core", source: "full-session" },
  entries,
  createdAt: 1,
});

describe("playback progression", () => {
  it("advances internal Quran segments before the next logical zikr", () => {
    const value = plan([entry("surah", 4), entry("next", 1)]);
    expect(getNextPlaybackPosition(value, { entryIndex: 0, segmentIndex: 0, repetitionIndex: 0 }, "voice")).toEqual({
      complete: false,
      position: { entryIndex: 0, segmentIndex: 1, repetitionIndex: 0 },
      repetitionCompleted: false,
    });
    expect(getNextPlaybackPosition(value, { entryIndex: 0, segmentIndex: 3, repetitionIndex: 0 }, "voice")).toEqual({
      complete: false,
      position: { entryIndex: 1, segmentIndex: 0, repetitionIndex: 0 },
      repetitionCompleted: false,
    });
  });

  it("plays the Three Quls as three complete ritual rounds", () => {
    const ritual = { ritualGroupId: "three_quls" as const, repetitionUnit: "ritual-round" as const, repetitions: 3 };
    const value = plan([entry("ikhlas", 1, ritual), entry("falaq", 1, ritual), entry("nas", 1, ritual)]);
    expect(
      getNextPlaybackPosition(value, { entryIndex: 0, segmentIndex: 0, repetitionIndex: 0 }, "voice"),
    ).toMatchObject({
      position: { entryIndex: 1, repetitionIndex: 0 },
    });
    expect(getNextPlaybackPosition(value, { entryIndex: 2, segmentIndex: 0, repetitionIndex: 0 }, "voice")).toEqual({
      complete: false,
      position: { entryIndex: 0, segmentIndex: 0, repetitionIndex: 1 },
      repetitionCompleted: true,
    });
    expect(getNextPlaybackPosition(value, { entryIndex: 2, segmentIndex: 0, repetitionIndex: 2 }, "voice")).toEqual({
      complete: true,
    });
  });
});

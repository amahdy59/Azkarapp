import { describe, expect, it } from "vitest";
import { audioReducer, createInitialAudioState } from "./audioReducer";
import type { PlaybackPlan } from "./audioTypes";

const plan: PlaybackPlan = {
  id: "plan",
  context: { category: "morning", routineMode: "core", source: "single" },
  entries: [],
  createdAt: 1,
};

describe("audio reducer", () => {
  it("resets track timing and ignores stale media events", () => {
    const loaded = audioReducer(createInitialAudioState(), {
      type: "load",
      plan,
      entryIndex: 0,
      segmentIndex: 0,
      repetitionIndex: 0,
      generation: 2,
      voiceId: "voice",
    });
    expect(loaded).toMatchObject({ status: "loading", currentTime: 0, duration: 0, generation: 2 });
    expect(audioReducer(loaded, { type: "time", currentTime: 99, generation: 1 })).toBe(loaded);
    expect(audioReducer(loaded, { type: "time", currentTime: 4, generation: 2 }).currentTime).toBe(4);
  });

  it("keeps an errored plan available for retry or explicit skip", () => {
    const loaded = audioReducer(createInitialAudioState(), {
      type: "load",
      plan,
      entryIndex: 0,
      segmentIndex: 0,
      repetitionIndex: 0,
      generation: 1,
      voiceId: "voice",
    });
    const failed = audioReducer(loaded, {
      type: "error",
      generation: 1,
      error: { code: "network", message: "Audio could not be loaded." },
    });
    expect(failed.status).toBe("error");
    expect(failed.plan).toBe(plan);
  });
});

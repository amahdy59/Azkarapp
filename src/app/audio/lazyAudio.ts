import type { AudioCoverage } from "./audioTypes";

/** No verified coverage counts are available until the audio manifest loads.
 *  Reviewed assignments may expose a loading action; counts and coverage
 *  confirmation always wait for the actual manifest. */
export const EMPTY_AUDIO_COVERAGE: AudioCoverage = {
  total: 0,
  available: 0,
  unavailable: 0,
  availableZikrIds: [],
  unavailableZikrIds: [],
};

/**
 * The audio subsystem (player state, playback-plan resolution, and the
 * per-zikr manifest) is a single ~480KB chunk — most of it manifest data,
 * not code. Loading it eagerly on every visit meant every reader paid for
 * audio before they had asked for it. Both halves live in the same Rollup
 * `audio` manualChunk, so importing either one triggers the same fetch; this
 * loads both with one network request and hands back a stable pair.
 */
export async function loadAudioModule() {
  const [{ AudioProvider }, { buildPlaybackPlan, getAudioCoverage }] = await Promise.all([
    import("./AudioProvider"),
    import("./buildPlaybackPlan"),
  ]);
  return { AudioProvider, buildPlaybackPlan, getAudioCoverage };
}

export type AudioModule = Awaited<ReturnType<typeof loadAudioModule>>;

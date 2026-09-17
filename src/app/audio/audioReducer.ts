import type { AudioControllerState, AudioPlaybackError, AudioStatus, PlaybackPlan } from "./audioTypes";

export const createInitialAudioState = (playbackRate = 1): AudioControllerState => ({
  status: "idle",
  plan: null,
  entryIndex: 0,
  segmentIndex: 0,
  repetitionIndex: 0,
  currentTime: 0,
  duration: 0,
  error: null,
  generation: 0,
  currentVoiceId: null,
  playbackRate,
  announcement: "",
});

export type AudioAction =
  | {
      type: "load";
      plan: PlaybackPlan;
      entryIndex: number;
      segmentIndex: number;
      repetitionIndex: number;
      generation: number;
      voiceId: string;
    }
  | { type: "status"; status: Exclude<AudioStatus, "idle" | "error">; generation: number }
  | { type: "time"; currentTime: number; generation: number }
  | { type: "duration"; duration: number; generation: number }
  | { type: "error"; error: AudioPlaybackError; generation: number }
  | { type: "complete"; generation: number }
  | { type: "rate"; playbackRate: number }
  | { type: "announce"; announcement: string }
  | { type: "stop"; playbackRate: number };

export function audioReducer(state: AudioControllerState, action: AudioAction): AudioControllerState {
  if ("generation" in action && action.type !== "load" && action.generation !== state.generation) return state;
  switch (action.type) {
    case "load":
      return {
        ...state,
        status: "loading",
        plan: action.plan,
        entryIndex: action.entryIndex,
        segmentIndex: action.segmentIndex,
        repetitionIndex: action.repetitionIndex,
        currentTime: 0,
        duration: 0,
        error: null,
        generation: action.generation,
        currentVoiceId: action.voiceId,
        announcement: "track-changed",
      };
    case "status":
      return { ...state, status: action.status, error: null };
    case "time":
      return { ...state, currentTime: action.currentTime };
    case "duration":
      return { ...state, duration: action.duration };
    case "error":
      return { ...state, status: "error", error: action.error, announcement: action.error.code };
    case "complete":
      return { ...state, status: "ended", currentTime: state.duration, announcement: "queue-completed" };
    case "rate":
      return { ...state, playbackRate: action.playbackRate };
    case "announce":
      return { ...state, announcement: action.announcement };
    case "stop":
      return createInitialAudioState(action.playbackRate);
  }
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { audioReducer, createInitialAudioState, type AudioAction } from "./audioReducer";
import { mapMediaError, mapPlayError } from "./audioErrors";
import { loadAudioPreferences, saveAudioPreferences } from "./audioPreferences";
import { withPlaybackMode } from "./buildPlaybackPlan";
import type { AudioPreferences, PlaybackEntry, PlaybackPlan, ResolvedAudioSegment } from "./audioTypes";
import { getNextPlaybackPosition } from "./playbackProgression";
import { getAudioVoiceName } from "./audioVoices";

type PlaybackMode = "play-once" | "repeat-prescribed-count";

export interface AudioController {
  state: ReturnType<typeof createInitialAudioState>;
  preferences: AudioPreferences;
  currentEntry: PlaybackEntry | null;
  currentSegment: ResolvedAudioSegment | null;
  startPlan: (plan: PlaybackPlan) => boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  replay: () => void;
  retry: () => void;
  skip: () => void;
  seek: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVoice: (voiceId: string) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

const AudioControllerContext = createContext<AudioController | null>(null);

export function AudioProvider({
  children,
  onControllerReady,
}: {
  children?: ReactNode;
  /**
   * Reports the memoized controller outside React Context. `App` renders this
   * provider as a sibling of the rest of the app (not an ancestor) so that
   * the audio module can load lazily without delaying first paint or forcing
   * a remount of the app once it arrives — the controller instead flows in
   * as a prop, sourced from state this callback populates.
   */
  onControllerReady?: (controller: AudioController) => void;
}) {
  const [preferences, setPreferences] = useState(loadAudioPreferences);
  const preferencesRef = useRef(preferences);
  const [state, rawDispatch] = useReducer(audioReducer, preferences.playbackRate, createInitialAudioState);
  const stateRef = useRef(state);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generationRef = useRef(0);
  const removeListenersRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatch = useCallback((action: AudioAction) => {
    stateRef.current = audioReducer(stateRef.current, action);
    rawDispatch(action);
  }, []);

  const getAudio = useCallback(() => {
    audioRef.current ??= new Audio();
    return audioRef.current;
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const entry = state.plan?.entries[state.entryIndex];
    if (!entry) return;
    const voiceId = state.currentVoiceId ?? entry.defaultVoiceId;
    const reciterName = getAudioVoiceName(voiceId, "ar") ?? voiceId;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: entry.titleArabic,
      artist: reciterName,
      album: entry.contentKind === "quran" ? "القرآن الكريم" : "أذكار المسلم",
    });
  }, [state.currentVoiceId, state.entryIndex, state.plan]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !navigator.mediaSession.setPositionState) return;
    if (Number.isFinite(state.duration) && state.duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: state.playbackRate,
          position: Math.max(0, Math.min(state.currentTime, state.duration)),
        });
      } catch {
        // Position state non-fatal on unsupported environments
      }
    }
  }, [state.currentTime, state.duration, state.playbackRate]);

  const updatePreferences = useCallback((next: AudioPreferences) => {
    preferencesRef.current = next;
    setPreferences(next);
    saveAudioPreferences(next);
  }, []);

  const chooseVoice = useCallback((entry: PlaybackEntry, requested?: string) => {
    const preferred =
      requested ??
      (entry.contentKind === "quran" ? preferencesRef.current.quranReciterId : preferencesRef.current.duaVoiceId);
    return entry.availableVoiceIds.includes(preferred) ? preferred : entry.defaultVoiceId;
  }, []);

  const loadAtRef = useRef<
    (
      plan: PlaybackPlan,
      entryIndex: number,
      segmentIndex: number,
      repetitionIndex: number,
      autoPlay: boolean,
      requestedVoice?: string,
    ) => void
  >(() => undefined);

  const advanceAfterEnded = useCallback(
    (plan: PlaybackPlan, entryIndex: number, segmentIndex: number, repetitionIndex: number, voiceId: string) => {
      const next = getNextPlaybackPosition(plan, { entryIndex, segmentIndex, repetitionIndex }, voiceId);
      if (next.complete) {
        dispatch({ type: "complete", generation: generationRef.current });
        return;
      }
      if (next.repetitionCompleted) dispatch({ type: "announce", announcement: "repetition-completed" });
      loadAtRef.current(
        plan,
        next.position.entryIndex,
        next.position.segmentIndex,
        next.position.repetitionIndex,
        true,
      );
    },
    [dispatch],
  );

  const loadAt = useCallback(
    (
      plan: PlaybackPlan,
      entryIndex: number,
      segmentIndex: number,
      repetitionIndex: number,
      autoPlay: boolean,
      requestedVoice?: string,
    ) => {
      const entry = plan.entries[entryIndex];
      if (!entry) return;
      const voiceId = chooseVoice(entry, requestedVoice);
      const segment = entry.segmentsByVoice[voiceId]?.[segmentIndex];
      if (!segment) return;

      removeListenersRef.current();
      const audio = getAudio();
      generationRef.current += 1;
      const generation = generationRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = preferencesRef.current.playbackRate;
      dispatch({ type: "load", plan, entryIndex, segmentIndex, repetitionIndex, generation, voiceId });

      const metadataTimer = window.setTimeout(() => {
        dispatch({
          type: "error",
          generation,
          error: {
            code: "metadata-timeout",
            message: "Audio metadata took too long to load.",
            assetId: entry.audioAssetId,
            variantId: segment.variantId,
          },
        });
      }, 15_000);
      const isCurrent = () =>
        generationRef.current === generation && audio.src === new URL(segment.url, window.location.href).href;
      const on = (event: keyof HTMLMediaElementEventMap, listener: () => void) =>
        audio.addEventListener(event, listener as EventListener);
      const off = (event: keyof HTMLMediaElementEventMap, listener: () => void) =>
        audio.removeEventListener(event, listener as EventListener);
      const handlers = {
        loadstart: () => isCurrent() && dispatch({ type: "status", status: "loading", generation }),
        loadedmetadata: () => {
          if (!isCurrent()) return;
          window.clearTimeout(metadataTimer);
          dispatch({ type: "duration", duration: Number.isFinite(audio.duration) ? audio.duration : 0, generation });
        },
        canplay: () => {
          if (!isCurrent()) return;
          window.clearTimeout(metadataTimer);
          if (stateRef.current.status !== "playing") dispatch({ type: "status", status: "ready", generation });
        },
        playing: () => isCurrent() && dispatch({ type: "status", status: "playing", generation }),
        pause: () => {
          if (isCurrent() && !audio.ended && stateRef.current.status !== "error") {
            dispatch({ type: "status", status: "paused", generation });
          }
        },
        waiting: () => isCurrent() && dispatch({ type: "status", status: "buffering", generation }),
        stalled: () => isCurrent() && dispatch({ type: "status", status: "buffering", generation }),
        timeupdate: () => isCurrent() && dispatch({ type: "time", currentTime: audio.currentTime, generation }),
        ended: () => isCurrent() && advanceAfterEnded(plan, entryIndex, segmentIndex, repetitionIndex, voiceId),
        error: () => {
          if (!isCurrent()) return;
          window.clearTimeout(metadataTimer);
          dispatch({
            type: "error",
            generation,
            error: { ...mapMediaError(audio), assetId: entry.audioAssetId, variantId: segment.variantId },
          });
        },
        durationchange: () =>
          isCurrent() &&
          dispatch({ type: "duration", duration: Number.isFinite(audio.duration) ? audio.duration : 0, generation }),
      };
      for (const [event, handler] of Object.entries(handlers)) on(event as keyof HTMLMediaElementEventMap, handler);
      removeListenersRef.current = () => {
        window.clearTimeout(metadataTimer);
        for (const [event, handler] of Object.entries(handlers)) off(event as keyof HTMLMediaElementEventMap, handler);
      };

      audio.src = segment.url;
      audio.load();
      if (autoPlay) {
        try {
          void audio.play().catch((error: unknown) => {
            if (generationRef.current === generation)
              dispatch({ type: "error", generation, error: mapPlayError(error) });
          });
        } catch (error) {
          dispatch({ type: "error", generation, error: mapPlayError(error) });
        }
      }
    },
    [advanceAfterEnded, chooseVoice, dispatch, getAudio],
  );
  loadAtRef.current = loadAt;

  const startPlan = useCallback(
    (plan: PlaybackPlan) => {
      if (plan.entries.length === 0) return false;
      loadAt(plan, 0, 0, 0, true);
      return true;
    },
    [loadAt],
  );

  const play = useCallback(() => {
    const current = stateRef.current;
    if (!current.plan) return;
    if (current.status === "error") {
      loadAt(
        current.plan,
        current.entryIndex,
        current.segmentIndex,
        current.repetitionIndex,
        true,
        current.currentVoiceId ?? undefined,
      );
      return;
    }
    if (current.status === "ended") {
      loadAt(current.plan, current.entryIndex, 0, 0, true, current.currentVoiceId ?? undefined);
      return;
    }
    const audio = getAudio();
    const generation = generationRef.current;
    try {
      void audio.play().catch((error: unknown) => dispatch({ type: "error", generation, error: mapPlayError(error) }));
    } catch (error) {
      dispatch({ type: "error", generation, error: mapPlayError(error) });
    }
  }, [dispatch, getAudio, loadAt]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !stateRef.current.plan) return;
    audio.pause();
    dispatch({ type: "status", status: "paused", generation: generationRef.current });
  }, [dispatch]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    removeListenersRef.current();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.currentTime = 0;
    }
    dispatch({ type: "stop", playbackRate: preferencesRef.current.playbackRate });
  }, [dispatch]);

  useEffect(() => stop, [stop]);

  const next = useCallback(() => {
    const current = stateRef.current;
    if (current.plan && current.entryIndex + 1 < current.plan.entries.length) {
      loadAt(current.plan, current.entryIndex + 1, 0, 0, true);
    }
  }, [loadAt]);

  const previous = useCallback(() => {
    const current = stateRef.current;
    if (current.plan && current.entryIndex > 0) loadAt(current.plan, current.entryIndex - 1, 0, 0, true);
  }, [loadAt]);

  const replay = useCallback(() => {
    const current = stateRef.current;
    if (current.plan) loadAt(current.plan, current.entryIndex, 0, 0, true, current.currentVoiceId ?? undefined);
  }, [loadAt]);

  const retry = useCallback(() => {
    const current = stateRef.current;
    if (current.plan) {
      loadAt(
        current.plan,
        current.entryIndex,
        current.segmentIndex,
        current.repetitionIndex,
        true,
        current.currentVoiceId ?? undefined,
      );
    }
  }, [loadAt]);

  const skip = useCallback(() => {
    const current = stateRef.current;
    if (!current.plan || current.status !== "error") return;
    if (current.entryIndex + 1 < current.plan.entries.length) loadAt(current.plan, current.entryIndex + 1, 0, 0, true);
    else dispatch({ type: "complete", generation: generationRef.current });
  }, [dispatch, loadAt]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, Math.min(seconds, Number.isFinite(audio.duration) ? audio.duration : seconds));
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const setHandler = (action: MediaSessionAction, handler: MediaSessionActionHandler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Browsers expose different subsets of MediaSession actions.
      }
    };
    setHandler("play", play);
    setHandler("pause", pause);
    setHandler("previoustrack", previous);
    setHandler("nexttrack", next);
    setHandler("seekbackward", (details) => seek((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 10)));
    setHandler("seekforward", (details) => seek((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 10)));
    setHandler("seekto", (details) => seek(details.seekTime ?? 0));
    return () => {
      for (const action of [
        "play",
        "pause",
        "previoustrack",
        "nexttrack",
        "seekbackward",
        "seekforward",
        "seekto",
      ] as const) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // See the compatibility note above.
        }
      }
    };
  }, [next, pause, play, previous, seek]);

  const setPlaybackRate = useCallback(
    (playbackRate: number) => {
      const safeRate = Math.max(0.5, Math.min(2, playbackRate));
      if (audioRef.current) audioRef.current.playbackRate = safeRate;
      updatePreferences({ ...preferencesRef.current, playbackRate: safeRate });
      dispatch({ type: "rate", playbackRate: safeRate });
    },
    [dispatch, updatePreferences],
  );

  const setVoice = useCallback(
    (voiceId: string) => {
      const current = stateRef.current;
      const entry = current.plan?.entries[current.entryIndex];
      if (!current.plan || !entry?.availableVoiceIds.includes(voiceId)) return;
      updatePreferences({
        ...preferencesRef.current,
        ...(entry.contentKind === "quran" ? { quranReciterId: voiceId } : { duaVoiceId: voiceId }),
      });
      loadAt(
        current.plan,
        current.entryIndex,
        current.segmentIndex,
        current.repetitionIndex,
        current.status === "playing",
        voiceId,
      );
    },
    [loadAt, updatePreferences],
  );

  const setPlaybackMode = useCallback(
    (mode: PlaybackMode) => {
      const current = stateRef.current;
      if (!current.plan) return;
      const nextPlan = withPlaybackMode(current.plan, mode);
      loadAt(nextPlan, current.entryIndex, 0, 0, true, current.currentVoiceId ?? undefined);
    },
    [loadAt],
  );

  const currentEntry = state.plan?.entries[state.entryIndex] ?? null;
  const currentSegment =
    (state.currentVoiceId ? currentEntry?.segmentsByVoice[state.currentVoiceId]?.[state.segmentIndex] : undefined) ??
    null;
  const controller = useMemo<AudioController>(
    () => ({
      state,
      preferences,
      currentEntry,
      currentSegment,
      startPlan,
      play,
      pause,
      stop,
      next,
      previous,
      replay,
      retry,
      skip,
      seek,
      setPlaybackRate,
      setVoice,
      setPlaybackMode,
    }),
    [
      currentEntry,
      currentSegment,
      next,
      pause,
      play,
      preferences,
      previous,
      replay,
      retry,
      seek,
      setPlaybackMode,
      setPlaybackRate,
      setVoice,
      skip,
      startPlan,
      state,
      stop,
    ],
  );

  useEffect(() => {
    onControllerReady?.(controller);
  }, [controller, onControllerReady]);

  return <AudioControllerContext.Provider value={controller}>{children}</AudioControllerContext.Provider>;
}

/**
 * `null` while the audio module chunk has not loaded yet (`AudioProvider` is
 * mounted lazily so it does not block the app's first paint) — every caller
 * outside this module must handle that window rather than assume a provider
 * is always present.
 */
export function useAudioController(): AudioController | null {
  return useContext(AudioControllerContext);
}

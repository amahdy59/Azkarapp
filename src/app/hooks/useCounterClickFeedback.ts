import { useCallback, useState } from "react";

export const COUNTER_SOUND_STORAGE_KEY = "azkarapp.counter-sound.v1";

type CounterSoundStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): CounterSoundStorage | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readCounterSoundEnabled(storage: CounterSoundStorage | undefined = browserStorage()): boolean {
  if (!storage) return true;

  try {
    const stored = storage.getItem(COUNTER_SOUND_STORAGE_KEY);
    return stored === null ? true : stored !== "false";
  } catch {
    return true;
  }
}

export function writeCounterSoundEnabled(
  enabled: boolean,
  storage: CounterSoundStorage | undefined = browserStorage(),
): void {
  if (!storage) return;

  try {
    storage.setItem(COUNTER_SOUND_STORAGE_KEY, String(enabled));
  } catch {
    // Counting must remain usable when storage is unavailable or full.
  }
}

/**
 * Creates a short, restrained click without adding or downloading an audio
 * asset. The injected factory keeps the Web Audio boundary deterministic in
 * tests and lets unsupported browsers fail silently without affecting count.
 */
export function createCounterClickPlayer(createAudioContext: () => AudioContext | null): () => void {
  let context: AudioContext | null = null;

  return () => {
    try {
      context ??= createAudioContext();
      if (!context) return;

      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }

      const startAt = context.currentTime;
      const stopAt = startAt + 0.035;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(720, startAt);
      oscillator.frequency.exponentialRampToValueAtTime(420, stopAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.035, startAt + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(stopAt);
    } catch {
      // Sound feedback is optional; never let it interrupt devotional counting.
    }
  };
}

type WebkitAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const playBrowserCounterClick = createCounterClickPlayer(() => {
  if (typeof window === "undefined") return null;
  const AudioContextConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : null;
});

export function playCounterClick(): void {
  playBrowserCounterClick();
}

export function useCounterClickFeedback({
  storage = browserStorage(),
  playClick = playCounterClick,
}: {
  storage?: CounterSoundStorage;
  playClick?: () => void;
} = {}) {
  const [soundEnabled, setSoundEnabled] = useState(() => readCounterSoundEnabled(storage));

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current;
      writeCounterSoundEnabled(next, storage);
      return next;
    });
  }, [storage]);

  const playClickFeedback = useCallback(() => {
    if (soundEnabled) playClick();
  }, [playClick, soundEnabled]);

  return { soundEnabled, toggleSound, playClickFeedback };
}

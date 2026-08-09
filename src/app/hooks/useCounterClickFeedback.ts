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
 * Creates the counter's bead click without adding or downloading an audio
 * asset. Two detuned wooden partials (a low body resonance and a bright
 * contact tone) plus a very short band-passed noise transient read as two
 * tasbih beads knocking together rather than as a UI blip — and it is
 * noticeably louder than a plain sine so it survives phone speakers.
 *
 * The injected factory keeps the Web Audio boundary deterministic in tests and
 * lets unsupported browsers fail silently without affecting count.
 */
export function createCounterClickPlayer(createAudioContext: () => AudioContext | null): () => void {
  let context: AudioContext | null = null;
  let noiseBuffer: AudioBuffer | null = null;

  return () => {
    try {
      context ??= createAudioContext();
      if (!context) return;
      const ctx = context;

      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }

      const startAt = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(1, startAt);
      master.connect(ctx.destination);

      // Wooden body: two partials at a slightly inharmonic ratio, each decaying
      // fast. Frequencies sit where small hardwood beads actually resonate.
      for (const [frequency, peak, decay] of [
        [1180, 0.22, 0.07],
        [1870, 0.12, 0.045],
      ] as const) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, startAt + decay);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + decay);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(startAt);
        oscillator.stop(startAt + decay);
      }

      // Contact transient: 30ms of band-passed noise, generated once and reused
      // so repeated taps cost nothing but a buffer-source node.
      if (!noiseBuffer && typeof ctx.createBuffer === "function") {
        const frames = Math.max(1, Math.floor(ctx.sampleRate * 0.03));
        const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < frames; i += 1) {
          channel[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 3;
        }
        noiseBuffer = buffer;
      }

      if (noiseBuffer) {
        const source = ctx.createBufferSource();
        const bandpass = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        source.buffer = noiseBuffer;
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(2400, startAt);
        bandpass.Q.setValueAtTime(1.1, startAt);
        noiseGain.gain.setValueAtTime(0.16, startAt);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.03);
        source.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(master);
        source.start(startAt);
      }
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

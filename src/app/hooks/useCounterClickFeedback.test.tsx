import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  COUNTER_SOUND_STORAGE_KEY,
  createCounterClickPlayer,
  readCounterSoundEnabled,
  useCounterClickFeedback,
  writeCounterSoundEnabled,
} from "./useCounterClickFeedback";

function createMemoryStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(COUNTER_SOUND_STORAGE_KEY, initial);

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
}

describe("counter click feedback", () => {
  it("defaults on, persists the toggle, and suppresses playback while muted", () => {
    const storage = createMemoryStorage();
    const playClick = vi.fn();
    const { result, unmount } = renderHook(() => useCounterClickFeedback({ storage, playClick }));

    expect(result.current.soundEnabled).toBe(true);
    act(() => result.current.playClickFeedback());
    expect(playClick).toHaveBeenCalledOnce();

    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(false);
    expect(storage.setItem).toHaveBeenLastCalledWith(COUNTER_SOUND_STORAGE_KEY, "false");
    act(() => result.current.playClickFeedback());
    expect(playClick).toHaveBeenCalledOnce();

    unmount();
    const restored = renderHook(() => useCounterClickFeedback({ storage, playClick }));
    expect(restored.result.current.soundEnabled).toBe(false);
  });

  it("keeps counting safe when persistence is unavailable", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("full");
      }),
    };

    expect(readCounterSoundEnabled(storage)).toBe(true);
    expect(() => writeCounterSoundEnabled(false, storage)).not.toThrow();
  });

  it("creates one reusable Web Audio context and emits the layered bead cue", () => {
    const frequency = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    const gainParam = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    const oscillator = {
      type: "sine",
      frequency,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = { gain: gainParam, connect: vi.fn() };
    const context = {
      state: "suspended",
      currentTime: 4,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
    } as unknown as AudioContext;
    const createContext = vi.fn(() => context);
    const play = createCounterClickPlayer(createContext);

    play();
    play();

    expect(createContext).toHaveBeenCalledOnce();
    expect(context.resume).toHaveBeenCalledTimes(2);
    expect(oscillator.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(context.destination);
    // Two wooden partials per tap, both starting on the same frame.
    expect(context.createOscillator).toHaveBeenCalledTimes(4);
    expect(oscillator.start).toHaveBeenLastCalledWith(4);
    expect(frequency.setValueAtTime).toHaveBeenCalledWith(1180, 4);
    expect(frequency.setValueAtTime).toHaveBeenCalledWith(1870, 4);
    // Audibly louder than the old 0.035 sine so it carries on a phone speaker.
    expect(gainParam.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.22, 4.002);
    // A context without createBuffer simply skips the noise transient.
    expect(() => play()).not.toThrow();
  });
});

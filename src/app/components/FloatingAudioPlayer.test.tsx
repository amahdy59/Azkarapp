import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AudioController } from "../audio/AudioProvider";
import { createInitialAudioState } from "../audio/audioReducer";
import type { PlaybackEntry, PlaybackPlan, ResolvedAudioSegment } from "../audio/audioTypes";
import { FloatingAudioPlayer } from "./FloatingAudioPlayer";

const segment: ResolvedAudioSegment = {
  id: "segment-1",
  variantId: "variant-1",
  voiceId: "voice-1",
  voiceName: "Test reciter",
  sourceName: "Test source",
  attribution: "Test attribution",
  url: "https://example.com/audio.mp3",
  durationMs: 600_000,
  mimeType: "audio/mpeg",
};

const entry: PlaybackEntry = {
  entryId: "entry-1",
  zikrId: "m-hm-75",
  canonicalKey: "quran-002-255",
  audioAssetId: "asset-1",
  titleArabic: "آية الكرسي",
  titleEnglish: "Ayat al-Kursi",
  contentKind: "quran",
  repetitions: 1,
  prescribedRepetitions: 1,
  repetitionUnit: "zikr",
  supportedModes: ["play-once"],
  defaultVoiceId: "voice-1",
  segmentsByVoice: { "voice-1": [segment] },
  availableVoiceIds: ["voice-1"],
};

const plan: PlaybackPlan = {
  id: "plan-1",
  context: { category: "morning", routineMode: "core", source: "single" },
  entries: [entry],
  createdAt: 1,
};

function createController(): AudioController {
  return {
    state: {
      ...createInitialAudioState(),
      status: "playing",
      plan,
      currentTime: 120,
      duration: 600,
      currentVoiceId: "voice-1",
    },
    preferences: {
      quranReciterId: "voice-1",
      duaVoiceId: "voice-1",
      playbackRate: 1,
      volume: 1,
      muted: false,
      continueOnNavigation: true,
    },
    currentEntry: entry,
    currentSegment: segment,
    startPlan: vi.fn(() => true),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    replay: vi.fn(),
    retry: vi.fn(),
    skip: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    toggleMuted: vi.fn(),
    setPlaybackRate: vi.fn(),
    setVoice: vi.fn(),
    setPreferredDuaVoice: vi.fn(),
    setContinueOnNavigation: vi.fn(),
    setPlaybackMode: vi.fn(),
  };
}

describe("FloatingAudioPlayer", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("shows only the seek timeline after expansion", () => {
    render(<FloatingAudioPlayer controller={createController()} language="en" direction="ltr" />);

    expect(screen.getByRole("progressbar", { name: "Listening progress" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    expect(screen.queryByRole("progressbar", { name: "Listening progress" })).not.toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek audio" })).toBeInTheDocument();
  });

  it("seeks by thirty seconds with Page Up and Page Down", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const timeline = screen.getByRole("slider", { name: "Seek audio" });
    expect(timeline).toHaveAttribute("aria-keyshortcuts", "PageUp PageDown");

    fireEvent.keyDown(timeline, { key: "PageUp" });
    expect(controller.seek).toHaveBeenLastCalledWith(150);

    fireEvent.keyDown(timeline, { key: "PageDown" });
    expect(controller.seek).toHaveBeenLastCalledWith(90);
  });

  it("maintains fluid circular play button styling across compact and expanded states", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);

    // Compact mode: size-12 button
    const compactPlay = screen.getByRole("button", { name: "Pause audio" });
    expect(compactPlay).toHaveClass("size-12", "rounded-full");
    expect(compactPlay).toHaveStyle({ borderRadius: "9999px" });

    // Expand
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    // Expanded mode: size-16 button with circular radius preserved for fluid scaling
    const expandedPlay = screen.getByRole("button", { name: "Pause audio" });
    expect(expandedPlay).toHaveClass("size-16", "rounded-full");
    expect(expandedPlay).toHaveStyle({ borderRadius: "9999px" });
  });
});

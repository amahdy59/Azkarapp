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
    selectEntry: vi.fn(() => true),
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

  it("opens the volume popover on touch tap even when hover media query matches", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(hover: hover) and (pointer: fine)",
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);

    const muteButton = screen.getByRole("button", { name: "Mute audio" });

    // Simulate a touch tap on a hybrid device
    fireEvent.pointerDown(muteButton, { pointerType: "touch" });
    fireEvent.click(muteButton);

    expect(controller.toggleMuted).not.toHaveBeenCalled();
    expect(screen.getByTestId("audio-volume-popover")).toBeInTheDocument();

    // Simulate a mouse click on the same hybrid device
    fireEvent.pointerDown(muteButton, { pointerType: "mouse" });
    fireEvent.click(muteButton);
    expect(controller.toggleMuted).toHaveBeenCalledTimes(1);
  });

  it("turns the reciter name into a dropdown menu for the 4 main reciters while displaying the current or selected reciter", () => {
    const controller = createController();
    controller.state.currentVoiceId = "abdullah-muhammad";
    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const reciterTrigger = screen.getByTestId("audio-reciter-select");
    expect(reciterTrigger).toHaveTextContent("عبد الله محمد");

    fireEvent.click(reciterTrigger);
    expect(screen.getByRole("option", { name: "عبد الله محمد" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "جورج (الترجمة الإنجليزية)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "محمد شرعي" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "محمد معتز" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "محمد شرعي" }));
    expect(controller.setVoice).toHaveBeenCalledWith("muhammad-alshara");
    expect(screen.getByTestId("audio-reciter-select")).toHaveTextContent("محمد شرعي");
  });

  it("keeps the timeline slider continuous (step=any) and aligns the progress fill with the thumb center", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const timeline = screen.getByRole("slider", { name: "Seek audio" });
    expect(timeline).toHaveAttribute("step", "any");
    expect(timeline.getAttribute("style")).toContain("calc(0.5625rem + (100% - 1.125rem) * 0.2000)");
  });

  it("applies floating-audio-player--docked class when dockedInReader is set for both compact and expanded states", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" dockedInReader />);

    const compactRegion = screen.getByRole("region", { name: "Audio player" });
    expect(compactRegion).toHaveClass("floating-audio-player--docked");

    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const expandedRegion = screen.getByRole("region", { name: "Audio player" });
    expect(expandedRegion).toHaveClass("floating-audio-player--docked");
    expect(expandedRegion).toHaveClass("floating-audio-player--expanded");
    // Unified controls: speed button and volume slider are present beside transport controls
    expect(screen.getByRole("button", { name: /Speed: 1×/ })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeInTheDocument();
  });

  it("renders repeat button beside timeline when supported and toggles repeat mode", () => {
    const controller = createController();
    const repeatableEntry: PlaybackEntry = {
      ...entry,
      supportedModes: ["play-once", "repeat-prescribed-count"],
      repetitions: 3,
      prescribedRepetitions: 3,
    };
    controller.currentEntry = repeatableEntry;

    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const repeatBtn = screen.getByRole("button", { name: "Repeat" });
    expect(repeatBtn).toBeInTheDocument();
    expect(repeatBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(repeatBtn);
    expect(controller.setPlaybackMode).toHaveBeenCalledWith("play-once");
  });

  it("renders Quranic verses with ornamental ayah badges in expanded zikr text", () => {
    const controller = createController();
    const quranEntry: PlaybackEntry = {
      ...entry,
      arabicText: "﴿تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ ﴿٢﴾",
    };
    controller.currentEntry = quranEntry;

    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const zikrText = screen.getByTestId("audio-player-zikr-text");
    expect(zikrText).toHaveTextContent("تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ");
    expect(zikrText).toHaveTextContent("١");
    expect(zikrText).toHaveTextContent("الَّذِي خَلَقَ الْمَوْتَ");
    expect(zikrText).toHaveTextContent("٢");
  });

  it("maintains symmetric transport layout with jump controls around the central play button", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const back10 = screen.getByRole("button", { name: "Rewind 10 seconds" });
    const forward10 = screen.getByRole("button", { name: "Forward 10 seconds" });
    const playPause = screen.getByRole("button", { name: "Pause audio" });

    expect(back10).toBeInTheDocument();
    expect(playPause).toBeInTheDocument();
    expect(forward10).toBeInTheDocument();
  });

  it("increases the spacing between the title and the pills below by 4px (mt-2)", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const reciterSelect = screen.getByTestId("audio-reciter-select");
    const pillsRow = reciterSelect.parentElement;
    expect(pillsRow).toHaveClass("mt-2");
  });

  it("maximizes font size for devotional text in expanded mode", () => {
    const controller = createController();
    const shortEntry: PlaybackEntry = {
      ...entry,
      arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    };
    controller.currentEntry = shortEntry;

    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const zikrText = screen.getByTestId("audio-player-zikr-text");
    expect(zikrText).toHaveStyle({ fontFamily: "var(--font-zikr)" });
    expect(zikrText.style.fontSize).toBe("32px");
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AudioController } from "../audio/AudioProvider";
import { createInitialAudioState } from "../audio/audioReducer";
import type { PlaybackEntry, PlaybackPlan, ResolvedAudioSegment } from "../audio/audioTypes";
import { FloatingAudioPlayer } from "./FloatingAudioPlayer";
import { getReadingFontSizeRem } from "../screens/readingTypography";
import verifiedWaveforms from "../audio/audioWaveforms.json";

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
    autoAdvance: true,
    setAutoAdvance: vi.fn(),
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
  it("uses Quran typography for an explicitly reviewed Quran excerpt even when its audio category is dua", () => {
    const controller = createController();
    controller.currentEntry = { ...entry, contentKind: "dua", quranText: true, arabicText: "fixture" };
    render(<FloatingAudioPlayer controller={controller} language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    expect(screen.getByTestId("audio-player-zikr-text")).toHaveStyle({ fontFamily: "var(--font-mushaf)" });
  });
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

  it("starts the next expanded entry at the top without remounting the reading region", () => {
    const controller = createController();
    const { rerender } = render(<FloatingAudioPlayer controller={controller} language="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const region = screen.getByRole("region", { name: "Now playing" });
    region.scrollTop = 240;
    controller.currentEntry = { ...entry, entryId: "second" };
    controller.state.entryIndex = 1;
    rerender(<FloatingAudioPlayer controller={controller} language="en" />);
    expect(screen.getByRole("region", { name: "Now playing" })).toBe(region);
    expect(region.scrollTop).toBe(0);
  });

  it("keeps one compact waveform tied to the current recording rather than queue progress", () => {
    const controller = createController();
    controller.currentSegment = {
      ...segment,
      url: `https://audio.test/file?sha256=${Object.keys(verifiedWaveforms)[0]}`,
    };
    controller.state.plan = { ...plan, entries: [entry, { ...entry, entryId: "second" }] };
    controller.state.entryIndex = 1;
    render(<FloatingAudioPlayer controller={controller} language="en" />);
    const progress = screen.getByRole("progressbar", { name: "Listening progress" });
    expect(progress).toHaveAttribute("aria-valuenow", "20");
    expect(screen.getByTestId("audio-compact-waveform").querySelectorAll(":scope > span")).toHaveLength(48);
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.queryByTestId("audio-compact-waveform")).not.toBeInTheDocument();
    expect(screen.getByTestId("audio-seek-waveform")).toBeInTheDocument();
  });

  it("uses three dedicated compact actions, expands from context, and keeps Play independent", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" />);
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual([
      "Stop audio and close player",
      "Pause audio",
      "Expand player",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Pause audio" }));
    expect(controller.pause).toHaveBeenCalledOnce();
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveAttribute("data-variant", "compact");
    fireEvent.click(screen.getByTestId("audio-compact-title"));
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveAttribute("data-variant", "expanded");
    expect(screen.getByRole("button", { name: "Minimize player" })).toHaveFocus();
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

  it("reveals one vertical volume control by click and restores focus after Escape", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" />);
    expect(screen.queryByRole("button", { name: "Volume" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    const trigger = screen.getByRole("button", { name: "Volume" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
    fireEvent.change(slider, { target: { value: "0.4" } });
    expect(controller.setVolume).toHaveBeenCalledWith(0.4);
    fireEvent.click(screen.getByRole("button", { name: "Mute audio" }));
    expect(controller.toggleMuted).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(slider, { key: "Escape" });
    expect(screen.queryByRole("slider", { name: "Volume" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveAttribute("data-variant", "expanded");
  });

  it("disables unavailable voices and displays a selection only after the controller accepts it", () => {
    const controller = createController();
    controller.state.currentVoiceId = "abdullah-muhammad";
    controller.currentEntry = {
      ...entry,
      availableVoiceIds: ["abdullah-muhammad", "english-george"],
      defaultVoiceId: "abdullah-muhammad",
      segmentsByVoice: { "abdullah-muhammad": [segment], "english-george": [segment] },
    };
    const { rerender } = render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const reciterTrigger = screen.getByTestId("audio-reciter-select");
    expect(reciterTrigger).toHaveTextContent("عبد الله محمد");

    fireEvent.click(reciterTrigger);
    expect(screen.getByRole("option", { name: "عبد الله محمد" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "الترجمة الإنجليزية" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "محمد شرعي" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "محمد معتز" })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "محمد شرعي" })).toHaveAttribute("data-disabled");
    expect(screen.getByRole("option", { name: "محمد معتز" })).toHaveAttribute("data-disabled");
    expect(screen.getByRole("option", { name: "الترجمة الإنجليزية" })).not.toHaveAttribute("data-disabled");

    fireEvent.click(screen.getByRole("option", { name: "الترجمة الإنجليزية" }));
    expect(controller.setVoice).toHaveBeenCalledWith("english-george");
    expect(screen.getByTestId("audio-reciter-select")).toHaveTextContent("عبد الله محمد");
    controller.state.currentVoiceId = "english-george";
    rerender(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    expect(screen.getByTestId("audio-reciter-select")).toHaveTextContent("الترجمة الإنجليزية");
  });

  it("cannot select English narration or an adhkar reciter for an entry without those recordings", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    fireEvent.click(screen.getByTestId("audio-reciter-select"));
    for (const name of ["English Translation", "Abdullah Muhammad"]) {
      const option = screen.getByRole("option", { name });
      expect(option).toHaveAttribute("data-disabled");
      fireEvent.click(option);
    }
    expect(controller.setVoice).not.toHaveBeenCalled();
    expect(screen.getByTestId("audio-reciter-select")).toHaveTextContent("Test reciter");
  });

  it("keeps native seeking continuous with an exact left-to-right progress fill", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const timeline = screen.getByRole("slider", { name: "Seek audio" });
    expect(timeline).toHaveAttribute("step", "any");
    expect(timeline.getAttribute("style")).toContain("linear-gradient(to right, var(--primary) 20%, var(--muted) 20%)");
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
    expect(screen.getByRole("combobox", { name: /Speed: 1×/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Volume" }));
    expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getByRole("button", { name: "Pause audio" })).toBeInTheDocument();
  });

  it("renders one prescribed-repeat option separately from the timeline", () => {
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

    const repeatBtn = screen.getByRole("button", { name: "Repeat 3 times" });
    expect(repeatBtn).toBeInTheDocument();
    expect(repeatBtn).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(repeatBtn);
    expect(controller.setPlaybackMode).toHaveBeenCalledWith("play-once");
  });

  it("shows the repetition count in a high-count queue without track position in the expanded header", () => {
    const controller = createController();
    controller.currentEntry = { ...entry, repetitions: 100, prescribedRepetitions: 100 };
    controller.state.plan = { ...plan, entries: [controller.currentEntry, entry] };
    controller.state.repetitionIndex = 48;
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByTestId("audio-expanded-identity")).not.toHaveTextContent("1 / 2");
    expect(screen.getByTestId("audio-expanded-identity")).not.toHaveTextContent("Track");
    expect(screen.getByTestId("audio-queue-position")).toHaveTextContent("Track 1 / 2");
    expect(screen.getByTestId("audio-queue-position").closest(".audio-expanded-options")).not.toBeNull();
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveTextContent("49 / 100");
    const progress = screen.getByTestId("audio-repetition-progress");
    expect(progress.closest(".audio-expanded-options")).not.toBeNull();
    expect(screen.getByTestId("audio-expanded-identity")).not.toHaveTextContent("49 / 100");
  });

  it("scales repetition display for embedded 3-count recordings so final number reaches the exact prescribed count", () => {
    const controller = createController();
    // SubhanAllah: 33 prescribed, 3 embedded, 11 audio loops
    controller.currentEntry = {
      ...entry,
      repetitions: 11,
      prescribedRepetitions: 33,
      embeddedRepetitions: 3,
    };
    controller.state.plan = { ...plan, entries: [controller.currentEntry] };
    controller.state.repetitionIndex = 0; // First audio loop
    const { unmount } = render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    // First loop plays 3 recitations
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveTextContent("3 / 33");
    unmount();

    // On the 11th (final) loop: repetitionIndex = 10
    controller.state.repetitionIndex = 10;
    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    // Final loop reaches exactly the recommended 33
    expect(screen.getByRole("region", { name: "Audio player" })).toHaveTextContent("33 / 33");
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

  it("uses the expanded header for center-aligned reciter without a duplicate zikr title or track position", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const reciterSelect = screen.getByTestId("audio-reciter-select");
    const identity = screen.getByTestId("audio-expanded-identity");
    expect(identity).toContainElement(reciterSelect);
    expect(identity).toHaveClass("justify-center");
    expect(reciterSelect).toHaveClass("justify-center");
    expect(identity).not.toHaveTextContent(entry.titleArabic);
    expect(identity).not.toHaveTextContent("المقطع");
  });

  it("keeps exact devotional text on the scalable reading type scale", () => {
    const controller = createController();
    const shortEntry: PlaybackEntry = {
      ...entry,
      arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    };
    controller.currentEntry = shortEntry;

    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const zikrText = screen.getByTestId("audio-player-zikr-text");
    expect(zikrText).toHaveClass("zikr-text");
    expect(zikrText.style.fontSize).toBe(
      getReadingFontSizeRem({ textSize: "medium", arabicLength: shortEntry.arabicText!.length, longSurah: false }),
    );
    expect(zikrText.textContent).toBe(shortEntry.arabicText);
  });

  it("shows reciter names without recording attribution in the player", () => {
    render(<FloatingAudioPlayer controller={createController()} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    expect(screen.queryByTestId("audio-attribution-trigger")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("audio-reciter-select"));
    expect(screen.queryByTestId("audio-recording-source")).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Test reciter" })).toBeVisible();
  });

  it("prioritizes English and reveals Arabic without changing playback", async () => {
    const controller = createController();
    controller.currentEntry = { ...entry, arabicText: "سُبْحَانَ اللَّهِ", translation: "Glory be to Allah." };
    const { rerender } = render(<FloatingAudioPlayer controller={controller} language="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByTestId("audio-player-zikr-text")).toHaveTextContent("Glory be to Allah.");
    expect(screen.getByTestId("audio-player-zikr-text")).toHaveAttribute("lang", "en");
    await waitFor(() => expect(screen.getByText("Arabic recitation")).toBeVisible());
    const arabic = screen.getByTestId("audio-player-arabic-text");
    expect(arabic).not.toBeVisible();
    const toggle = screen.getByRole("button", { name: "Show Arabic" });
    expect(toggle).toHaveAttribute("aria-controls", arabic.id);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(arabic).toBeVisible();
    expect(arabic).toHaveAttribute("lang", "ar");
    expect(arabic).toHaveAttribute("dir", "rtl");
    expect(toggle).toHaveAccessibleName("Hide Arabic");
    controller.currentEntry = { ...controller.currentEntry, entryId: "next", translation: "Next translation." };
    rerender(<FloatingAudioPlayer controller={controller} language="en" />);
    await waitFor(() => expect(screen.getByTestId("audio-player-arabic-text")).toBeVisible());
    fireEvent.click(await screen.findByRole("button", { name: "Hide Arabic" }));
    expect(screen.getByTestId("audio-player-arabic-text")).not.toBeVisible();
    expect(controller.setVoice).not.toHaveBeenCalled();
    expect(controller.play).not.toHaveBeenCalled();
    expect(controller.pause).not.toHaveBeenCalled();
  });

  it("keeps Arabic primary in Arabic mode and explains missing English translations", async () => {
    const controller = createController();
    controller.currentEntry = { ...entry, arabicText: "سُبْحَانَ اللَّهِ", translation: "Glory be to Allah." };
    const { rerender } = render(<FloatingAudioPlayer controller={controller} language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    expect(screen.getByTestId("audio-player-zikr-text")).toHaveAttribute("lang", "ar");
    expect(screen.queryByRole("button", { name: "إظهار العربية" })).not.toBeInTheDocument();
    controller.currentEntry = { ...controller.currentEntry, translation: "  " };
    rerender(<FloatingAudioPlayer controller={controller} language="en" />);
    await waitFor(() => expect(screen.getByText(/English translation is not available/)).toBeVisible());
    expect(screen.getByTestId("audio-player-zikr-text")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Show Arabic" })).not.toBeInTheDocument();
  });

  it("selects a playback rate directly instead of cycling through intermediate speeds", () => {
    const controller = createController();
    render(<FloatingAudioPlayer controller={controller} language="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Speed: 1×" }));
    expect(screen.getAllByRole("option")).toHaveLength(5);
    fireEvent.click(screen.getByRole("option", { name: "1.5×" }));
    expect(controller.setPlaybackRate).toHaveBeenCalledExactlyOnceWith(1.5);
  });

  it("updates listening typography when the app text-size setting changes", () => {
    const controller = createController();
    controller.currentEntry = { ...entry, arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ." };
    const { rerender } = render(<FloatingAudioPlayer controller={controller} language="ar" textSize="small" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    const text = screen.getByTestId("audio-player-zikr-text");
    expect(text).toHaveStyle({
      fontSize: getReadingFontSizeRem({
        textSize: "small",
        arabicLength: controller.currentEntry.arabicText!.length,
        longSurah: false,
      }),
    });
    rerender(<FloatingAudioPlayer controller={controller} language="ar" textSize="large" />);
    expect(text).toHaveStyle({
      fontSize: getReadingFontSizeRem({
        textSize: "large",
        arabicLength: controller.currentEntry.arabicText!.length,
        longSurah: false,
      }),
    });
    expect(text.textContent).toBe(controller.currentEntry.arabicText);
  });

  it("replaces only the reader canvas and restores covered controls and focus on collapse", () => {
    render(
      <div>
        <button type="button">Reader header</button>
        <div data-testid="reader-card">
          <div data-testid="reading-content">
            <button type="button">Reading action</button>
          </div>
          <div>
            <FloatingAudioPlayer controller={createController()} language="en" direction="ltr" dockedInReader />
          </div>
        </div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByTestId("reading-content")).toHaveAttribute("inert");
    expect(screen.queryByRole("button", { name: "Reading action" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reader header" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minimize player" })).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByTestId("reading-content")).not.toHaveAttribute("inert");
    expect(screen.getByRole("button", { name: "Reading action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand player" })).toHaveFocus();
  });

  it("shows context and Benefit without duplicate compact navigation or expansion actions", () => {
    const controller = createController();
    const onClose = vi.fn();
    render(
      <FloatingAudioPlayer
        controller={controller}
        language="ar"
        direction="rtl"
        dockSlots={{
          benefit: <button type="button">الفائدة</button>,
        }}
        onClose={onClose}
      />,
    );

    expect(screen.queryByRole("button", { name: "السابق" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "توسيع المشغل" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "الفائدة" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "التالي" })).not.toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "إغلاق الصوت والعودة للعداد" });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(controller.stop).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("expands from compact dock and collapses back when collapse is clicked or Escape is pressed", () => {
    const controller = createController();
    render(
      <FloatingAudioPlayer
        controller={controller}
        language="ar"
        direction="rtl"
        dockSlots={{
          benefit: <button type="button">الفائدة</button>,
        }}
      />,
    );

    const expandBtn = screen.getByRole("button", { name: "توسيع المشغل" });
    fireEvent.click(expandBtn);

    // Expanded state
    const region = screen.getByRole("region", { name: "مشغل الصوت" });
    expect(region).toHaveAttribute("data-variant", "expanded");

    // Press Escape to collapse
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("region", { name: "مشغل الصوت" })).toHaveAttribute("data-variant", "compact");
  });

  it("keeps manual navigation available with auto-advance off and uses logical media keys in Arabic", () => {
    const controller = createController();
    controller.autoAdvance = false;
    controller.state.plan = { ...plan, entries: [entry, { ...entry, entryId: "entry-2" }] };
    render(<FloatingAudioPlayer controller={controller} language="ar" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    const next = screen.getByRole("button", { name: "الذكر التالي" });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(controller.next).toHaveBeenCalledOnce();
    const toggle = screen.getByRole("switch", { name: "تشغيل الذكر التالي تلقائيًا" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(controller.setAutoAdvance).toHaveBeenCalledWith(true);
    const slider = screen.getByRole("slider", { name: "تقديم أو تأخير الصوت" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(controller.seek).toHaveBeenLastCalledWith(115);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(controller.seek).toHaveBeenLastCalledWith(125);
    expect(slider.closest(".audio-seek-row")).toHaveAttribute("dir", "rtl");
  });

  it("hides software volume control on iOS devices", () => {
    const controller = createController();
    const originalUserAgent = navigator.userAgent;
    try {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        configurable: true,
      });
      render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
      fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
      expect(screen.queryByRole("slider", { name: "Volume" })).toBeNull();
    } finally {
      Object.defineProperty(navigator, "userAgent", {
        value: originalUserAgent,
        configurable: true,
      });
    }
  });

  it("keeps an approved Quran reciter enabled even when unavailable for adhkar", () => {
    const controller = createController();
    controller.currentEntry = {
      ...entry,
      availableVoiceIds: ["muhammad-alshara"],
      defaultVoiceId: "muhammad-alshara",
      segmentsByVoice: { "muhammad-alshara": [segment] },
    };
    render(<FloatingAudioPlayer controller={controller} language="en" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    fireEvent.click(screen.getByTestId("audio-reciter-select"));
    expect(screen.getByRole("option", { name: "Muhammad Shari" })).not.toHaveAttribute("data-disabled");
  });

  it("seeks and fills from right to left in Arabic, including verified waveforms", () => {
    const controller = createController();
    controller.currentSegment = {
      ...segment,
      url: `https://audio.test/file?sha256=${Object.keys(verifiedWaveforms)[0]}`,
    };
    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    expect(screen.getByTestId("audio-compact-progress")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("audio-compact-waveform").querySelector(".audio-seek-waveform-played")).toHaveStyle({
      clipPath: "inset(0 0 0 80%)",
    });
    expect(screen.getByTestId("audio-compact-waveform-playhead")).toHaveStyle({
      insetInlineStart: "clamp(1px, 20%, calc(100% - 1px))",
    });
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    const timeline = screen.getByRole("slider", { name: "تقديم أو تأخير الصوت" });
    expect(timeline.closest(".audio-seek-row")).toHaveAttribute("dir", "rtl");
    expect(timeline.getAttribute("style")).toContain("linear-gradient(to left");
    fireEvent.keyDown(timeline, { key: "ArrowLeft" });
    expect(controller.seek).toHaveBeenLastCalledWith(125);
    fireEvent.keyDown(timeline, { key: "ArrowRight" });
    expect(controller.seek).toHaveBeenLastCalledWith(115);
    expect(screen.getByTestId("audio-seek-waveform").querySelector(".audio-seek-waveform-played")).toHaveStyle({
      clipPath: "inset(0 0 0 80%)",
    });
    expect(screen.getByTestId("audio-seek-waveform-playhead")).toHaveStyle({
      insetInlineStart: "clamp(1px, 20%, calc(100% - 1px))",
    });
  });

  it("renders a playhead needle at current progress position within compact and expanded waveforms", () => {
    const controller = createController();
    controller.currentSegment = {
      ...segment,
      url: `https://audio.test/file?sha256=${Object.keys(verifiedWaveforms)[0]}`,
    };
    render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);

    const compactPlayhead = screen.getByTestId("audio-compact-waveform-playhead");
    expect(compactPlayhead).toBeInTheDocument();
    expect(compactPlayhead).toHaveStyle({
      insetInlineStart: "clamp(1px, 20%, calc(100% - 1px))",
    });

    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    const seekPlayhead = screen.getByTestId("audio-seek-waveform-playhead");
    expect(seekPlayhead).toBeInTheDocument();
    expect(seekPlayhead).toHaveStyle({
      insetInlineStart: "clamp(1px, 20%, calc(100% - 1px))",
    });
  });

  it("mirrors transport controls and seeking in RTL mode", () => {
    const controller = createController();
    controller.state.plan = { ...plan, entries: [entry, { ...entry, entryId: "entry-2" }] };
    const { unmount } = render(<FloatingAudioPlayer controller={controller} language="ar" direction="rtl" />);
    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));

    const transportRtl = screen.getByRole("button", { name: "الذكر التالي" }).closest(".audio-expanded-transport");
    expect(transportRtl).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("button", { name: "الذكر التالي" }).querySelector("[data-rtl-flip]")).not.toBeNull();
    expect(screen.getByRole("button", { name: "الذكر السابق" }).querySelector("[data-rtl-flip]")).not.toBeNull();

    unmount();

    render(<FloatingAudioPlayer controller={controller} language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    const transportLtr = screen.getByRole("button", { name: "Next item" }).closest(".audio-expanded-transport");
    expect(transportLtr).toHaveAttribute("dir", "ltr");
  });
});

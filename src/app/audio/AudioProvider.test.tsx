import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FloatingAudioPlayer } from "../components/FloatingAudioPlayer";
import { AudioProvider, useAudioController } from "./AudioProvider";
import type { PlaybackPlan } from "./audioTypes";

class FakeAudio extends EventTarget {
  static latest: FakeAudio | null = null;
  static rejectPlayWith: "NotAllowedError" | "NotSupportedError" | null = null;
  private source = "";
  currentTime = 0;
  duration = 12;
  playbackRate = 1;
  volume = 1;
  muted = false;
  paused = true;
  ended = false;
  error: MediaError | null = null;

  constructor() {
    super();
    FakeAudio.latest = this;
  }

  get src() {
    return this.source;
  }
  set src(value: string) {
    this.source = new URL(value, window.location.href).href;
  }
  load() {
    this.dispatchEvent(new Event("loadstart"));
    this.dispatchEvent(new Event("loadedmetadata"));
    this.dispatchEvent(new Event("canplay"));
  }
  play() {
    if (FakeAudio.rejectPlayWith) return Promise.reject(new DOMException("failed", FakeAudio.rejectPlayWith));
    this.paused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  }
  removeAttribute(name: string) {
    if (name === "src") this.source = "";
  }
}

const plan: PlaybackPlan = {
  id: "plan",
  context: { category: "morning", routineMode: "core", source: "single" },
  entries: [
    {
      entryId: "entry",
      zikrId: "zikr",
      canonicalKey: "zikr",
      audioAssetId: "asset",
      titleArabic: "آية الكرسي",
      titleEnglish: "Ayat al-Kursi",
      contentKind: "quran",
      repetitions: 1,
      prescribedRepetitions: 1,
      repetitionUnit: "zikr",
      supportedModes: ["play-once"],
      defaultVoiceId: "voice",
      segmentsByVoice: {
        voice: [
          {
            id: "segment",
            variantId: "variant",
            voiceId: "voice",
            voiceName: "Voice",
            sourceName: "Source",
            sourceNameArabic: "المصدر",
            attribution: "Attribution",
            attributionArabic: "تلاوة القارئ",
            url: "https://audio.example.test/segment.mp3",
            durationMs: 12_000,
            mimeType: "audio/mpeg",
          },
        ],
      },
      availableVoiceIds: ["voice"],
    },
  ],
  createdAt: 1,
};

/** The same recitation, prescribed three times, so the repeat control exists. */
const repeatPlan: PlaybackPlan = {
  ...plan,
  id: "repeat-plan",
  entries: [
    {
      ...plan.entries[0]!,
      repetitions: 3,
      prescribedRepetitions: 3,
      supportedModes: ["play-once", "repeat-prescribed-count"],
    },
  ],
};

const playOnceRepeatedPlan: PlaybackPlan = {
  ...repeatPlan,
  id: "play-once-repeated-plan",
  entries: [{ ...repeatPlan.entries[0]!, repetitions: 1 }],
};

const englishPlan: PlaybackPlan = {
  ...plan,
  id: "english-plan",
  entries: [
    {
      ...plan.entries[0]!,
      contentKind: "dua",
      defaultVoiceId: "english-george",
      availableVoiceIds: ["english-george"],
      segmentsByVoice: {
        "english-george": [
          {
            ...plan.entries[0]!.segmentsByVoice.voice![0]!,
            id: "english-segment",
            variantId: "english-variant",
            voiceId: "english-george",
            voiceName: "George",
          },
        ],
      },
    },
  ],
};

function Harness({ language = "en" }: { language?: "ar" | "en" }) {
  const controller = useAudioController();
  return (
    <>
      <button type="button" onClick={() => controller.startPlan(plan)}>
        Start
      </button>
      <button type="button" onClick={() => controller.startPlan(repeatPlan)}>
        Start repeat
      </button>
      <button type="button" onClick={() => controller.startPlan(playOnceRepeatedPlan)}>
        Start repeated zikr once
      </button>
      <button type="button" onClick={() => controller.startPlan(englishPlan)}>
        Start English
      </button>
      <button
        type="button"
        onClick={() =>
          controller.startPlan({
            ...repeatPlan,
            entries: [{ ...repeatPlan.entries[0]!, repetitions: 100, prescribedRepetitions: 100 }],
          })
        }
      >
        Start 100 repetitions
      </button>
      <output>{controller.state.status}</output>
      <output data-testid="completed-audio-entry">{controller.state.completedEntryId ?? ""}</output>
      <output data-testid="audio-completion-sequence">{controller.state.completionSequence}</output>
      <output data-testid="audio-repetition-index">{controller.state.repetitionIndex}</output>
      {controller.state.plan && <FloatingAudioPlayer controller={controller} language={language} />}
    </>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  FakeAudio.rejectPlayWith = null;
  vi.unstubAllGlobals();
});

function QueueHarness({ queue }: { queue: PlaybackPlan }) {
  const controller = useAudioController();
  return (
    <>
      <button onClick={() => controller.startPlan(queue)}>Start queue</button>
      <button onClick={() => controller.setAutoAdvance(false)}>Disable automatic continuation</button>
      <button onClick={controller.next}>Manual next</button>
      <button onClick={controller.previous}>Manual previous</button>
      <output data-testid="queue-state">
        {controller.state.status}:{controller.state.entryIndex}:{controller.state.segmentIndex}:
        {controller.state.repetitionIndex}
      </output>
      <output data-testid="queue-completions">{controller.state.completionSequence}</output>
    </>
  );
}

describe("AudioProvider integration", () => {
  it("rejects an unavailable voice without changing playback or saved voice preferences", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    let controller!: ReturnType<typeof useAudioController>;
    function VoiceHarness() {
      controller = useAudioController();
      return null;
    }
    render(
      <AudioProvider>
        <VoiceHarness />
      </AudioProvider>,
    );
    act(() => controller.startPlan(plan));
    await waitFor(() => expect(controller.state.status).toBe("playing"));
    const preferences = { ...controller.preferences };
    const source = FakeAudio.latest!.src;
    act(() => controller.setVoice("english-george"));
    expect(controller.state.currentVoiceId).toBe("voice");
    expect(controller.preferences).toEqual(preferences);
    expect(FakeAudio.latest!.src).toBe(source);
    expect(controller.state.status).toBe("playing");
  });
  it("stops after a complete prescribed run with auto-advance off but permits manual queue navigation without completing skips", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    const queue: PlaybackPlan = {
      ...repeatPlan,
      context: { ...plan.context, source: "full-session" },
      entries: [repeatPlan.entries[0]!, { ...plan.entries[0]!, zikrId: "next", entryId: "next" }],
    };
    render(
      <AudioProvider>
        <QueueHarness queue={queue} />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByText("Start queue"));
    fireEvent.click(screen.getByText("Disable automatic continuation"));
    for (let index = 0; index < 2; index++) {
      act(() => FakeAudio.latest!.dispatchEvent(new Event("ended")));
      expect(screen.getByTestId("queue-completions")).toHaveTextContent("0");
      expect(screen.getByTestId("queue-state")).toHaveTextContent(`playing:0:0:${index + 1}`);
    }
    act(() => FakeAudio.latest!.dispatchEvent(new Event("ended")));
    await waitFor(() => expect(screen.getByTestId("queue-state")).toHaveTextContent("ended:0:0:2"));
    expect(screen.getByTestId("queue-completions")).toHaveTextContent("1");
    fireEvent.click(screen.getByText("Manual next"));
    expect(screen.getByTestId("queue-state")).toHaveTextContent("playing:1:0:0");
    fireEvent.click(screen.getByText("Manual previous"));
    expect(screen.getByTestId("queue-state")).toHaveTextContent("playing:0:0:0");
    expect(screen.getByTestId("queue-completions")).toHaveTextContent("1");
  });

  it("keeps internal segments and ritual rounds running with automatic continuation disabled", () => {
    vi.stubGlobal("Audio", FakeAudio);
    const ritualEntry = {
      ...repeatPlan.entries[0]!,
      repetitionUnit: "ritual-round" as const,
      ritualGroupId: "three_quls" as const,
    };
    const queue: PlaybackPlan = {
      ...repeatPlan,
      entries: [
        ritualEntry,
        { ...ritualEntry, entryId: "qul-2", zikrId: "qul-2" },
        { ...plan.entries[0]!, entryId: "outside" },
      ],
    };
    render(
      <AudioProvider>
        <QueueHarness queue={queue} />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByText("Start queue"));
    fireEvent.click(screen.getByText("Disable automatic continuation"));
    for (let index = 0; index < 6; index++) act(() => FakeAudio.latest!.dispatchEvent(new Event("ended")));
    expect(screen.getByTestId("queue-state")).toHaveTextContent("ended:1:0:2");
    expect(screen.getByTestId("queue-completions")).toHaveTextContent("2");
  });

  it("finishes internal segments before stopping an individual queue entry", () => {
    vi.stubGlobal("Audio", FakeAudio);
    const first = plan.entries[0]!;
    const segment = first.segmentsByVoice.voice![0]!;
    const queue: PlaybackPlan = {
      ...plan,
      entries: [
        { ...first, segmentsByVoice: { voice: [segment, { ...segment, id: "segment-2" }] } },
        { ...first, entryId: "second" },
      ],
    };
    render(
      <AudioProvider>
        <QueueHarness queue={queue} />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByText("Start queue"));
    act(() => FakeAudio.latest!.dispatchEvent(new Event("ended")));
    expect(screen.getByTestId("queue-state")).toHaveTextContent("playing:0:1:0");
    expect(screen.getByTestId("queue-completions")).toHaveTextContent("0");
    act(() => FakeAudio.latest!.dispatchEvent(new Event("ended")));
    expect(screen.getByTestId("queue-state")).toHaveTextContent("ended:0:1:0");
    expect(screen.getByTestId("queue-completions")).toHaveTextContent("1");
  });
  it("reports a zikr complete only after its recording ends naturally", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByTestId("completed-audio-entry")).toBeEmptyDOMElement();

    FakeAudio.latest!.ended = true;
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    await waitFor(() => expect(screen.getByTestId("completed-audio-entry")).toHaveTextContent("zikr"));
  });

  it("completes Play Once after one recitation but waits for the final prescribed repeat", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start repeated zikr once" }));
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    await waitFor(() => expect(screen.getByTestId("completed-audio-entry")).toHaveTextContent("zikr"));

    fireEvent.click(screen.getByRole("button", { name: "Start repeat" }));
    await waitFor(() => expect(screen.getByTestId("audio-completion-sequence")).toHaveTextContent("1"));
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    expect(screen.getByTestId("audio-completion-sequence")).toHaveTextContent("1");
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    await waitFor(() => expect(screen.getByTestId("audio-completion-sequence")).toHaveTextContent("2"));
  });

  it("plays all 100 repetitions and records completion only after the last recording ends", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start 100 repetitions" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    for (let count = 1; count < 100; count++) {
      FakeAudio.latest!.dispatchEvent(new Event("ended"));
    }
    await waitFor(() => expect(screen.getByTestId("audio-repetition-index")).toHaveTextContent("99"));
    expect(screen.getByTestId("completed-audio-entry")).toBeEmptyDOMElement();
    expect(screen.getByTestId("audio-completion-sequence")).toHaveTextContent("0");
    FakeAudio.latest!.dispatchEvent(new Event("ended"));
    await waitFor(() => expect(screen.getByTestId("audio-completion-sequence")).toHaveTextContent("1"));
    expect(screen.getByTestId("completed-audio-entry")).toHaveTextContent("zikr");
  });

  it("starts only after a user action and keeps the player visible while paused", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    expect(screen.queryByRole("region", { name: "Audio player" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(await screen.findByRole("region", { name: "Audio player" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Pause audio" }));
    expect(screen.getByRole("region", { name: "Audio player" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play audio" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop audio and close player" }));
    expect(screen.queryByRole("region", { name: "Audio player" })).not.toBeInTheDocument();
  });

  it("surfaces a rejected play promise and leaves Retry and Skip explicit", async () => {
    FakeAudio.rejectPlayWith = "NotAllowedError";
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Playback was blocked"));
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip this item" })).toBeInTheDocument();
  });

  it("does not mislabel a failed mobile source as an unsupported format and localizes the error", async () => {
    FakeAudio.rejectPlayWith = "NotSupportedError";
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness language="ar" />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("تعذر تحميل التسجيل. تحقق من الاتصال ثم أعد المحاولة."),
    );
    expect(screen.queryByText("This audio format is not supported.")).not.toBeInTheDocument();
  });

  it("toggles between expanded and mini-player modes without stopping audio", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(await screen.findByRole("region", { name: "Audio player" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Expand player" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Listening progress" })).toHaveAttribute("aria-valuenow", "0");

    // Playback starts compact so it does not obscure the screen.
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByRole("button", { name: "Minimize player" })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "Listening progress" })).not.toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek audio" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward 10 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rewind 10 seconds" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Minimize player" }));
    expect(screen.getByRole("button", { name: "Expand player" })).toBeInTheDocument();
  });

  it("puts relevant speed and repeat options on the expanded surface", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start repeat" }));
    expect(await screen.findByRole("region", { name: "Audio player" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    // Where the reader is in a prescribed repetition, said once.
    expect(screen.getByRole("button", { name: "Repeat 3 times" })).toBeInTheDocument();

    // Select a rate directly and verify the real controller updates the displayed value.
    const speed = screen.getByRole("combobox", { name: /Speed/ });
    expect(speed).toHaveTextContent("1×");
    fireEvent.click(speed);
    fireEvent.click(screen.getByRole("option", { name: "1.25×" }));
    expect(screen.getByRole("combobox", { name: /Speed/ })).toHaveTextContent("1.25×");

    const repeat = screen.getByRole("button", { name: "Repeat 3 times" });
    expect(repeat).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(repeat);
    expect(screen.getByRole("button", { name: "Repeat 3 times" })).toHaveAttribute("aria-pressed", "false");

    expect(screen.queryByRole("button", { name: /Replay/ })).not.toBeInTheDocument();
  });

  it("opens an aligned mobile volume control and persists its accessible level", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));

    fireEvent.click(screen.getByRole("button", { name: "Volume" }));
    const volume = screen.getByRole("slider", { name: "Volume" });
    expect(volume).toHaveAttribute("aria-orientation", "vertical");
    fireEvent.change(volume, { target: { value: "0.4" } });

    expect(screen.getByRole("button", { name: "Mute audio" })).toBeInTheDocument();
    expect(window.localStorage.getItem("azkar.audio-preferences.v1")).toContain('"volume":0.4');
  });

  it("fills the Arabic media timeline from the right without changing text direction or media time", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness language="ar" />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    const timeline = await screen.findByRole("slider", { name: "تقديم أو تأخير الصوت" });
    expect(timeline.getAttribute("style")).toContain("to left");
    expect(timeline).toHaveValue("0");

    fireEvent.click(screen.getByTestId("audio-reciter-select"));
    expect(screen.queryByTestId("audio-recording-source")).not.toBeInTheDocument();
    expect(screen.getByTestId("audio-reciter-select")).not.toHaveTextContent("المصدر");
  });

  it("keeps lock-screen metadata and controls synchronized with the actual recording", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    const handlers = new Map<MediaSessionAction, MediaSessionActionHandler | null>();
    const mediaSession = {
      metadata: null as MediaMetadata | null,
      playbackState: "none" as MediaSessionPlaybackState,
      setActionHandler: vi.fn((action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
        handlers.set(action, handler);
      }),
      setPositionState: vi.fn(),
    };
    class FakeMediaMetadata {
      constructor(init: MediaMetadataInit) {
        Object.assign(this, init);
      }
    }
    Object.defineProperty(window.navigator, "mediaSession", { configurable: true, value: mediaSession });
    vi.stubGlobal("MediaMetadata", FakeMediaMetadata);

    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );

    try {
      fireEvent.click(screen.getByRole("button", { name: "Start English" }));
      await waitFor(() => expect(mediaSession.playbackState).toBe("playing"));
      expect(mediaSession.metadata).toMatchObject({
        title: "Ayat al-Kursi",
        artist: "English Translation",
        album: "Azkar English Translation",
      });
      expect(mediaSession.metadata?.artwork).toHaveLength(2);
      expect(handlers.get("stop")).toBeTypeOf("function");

      handlers.get("pause")?.({ action: "pause" });
      await waitFor(() => expect(mediaSession.playbackState).toBe("paused"));
      handlers.get("play")?.({ action: "play" });
      await waitFor(() => expect(mediaSession.playbackState).toBe("playing"));
      handlers.get("stop")?.({ action: "stop" });
      await waitFor(() => {
        expect(mediaSession.playbackState).toBe("none");
        expect(mediaSession.metadata).toBeNull();
      });
    } finally {
      Object.defineProperty(window.navigator, "mediaSession", { configurable: true, value: undefined });
    }
  });

  it("switches directly to a selected entry in a multi-track plan", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    const multiPlan: PlaybackPlan = {
      ...plan,
      id: "multi-plan",
      context: { category: "before_sleep", routineMode: "complete", source: "full-session" },
      entries: [
        plan.entries[0]!,
        {
          ...plan.entries[0]!,
          entryId: "entry-2",
          zikrId: "zikr-2",
          titleArabic: "سورة الإخلاص",
          titleEnglish: "Surah Al-Ikhlas",
        },
      ],
    };

    function MultiHarness() {
      const controller = useAudioController()!;
      return (
        <>
          <button type="button" onClick={() => controller.startPlan(multiPlan)}>
            Start multi
          </button>
          <button type="button" onClick={() => controller.selectEntry(1)}>
            Select second
          </button>
          {controller.state.plan && <FloatingAudioPlayer controller={controller} language="en" />}
        </>
      );
    }

    render(
      <AudioProvider>
        <MultiHarness />
      </AudioProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start multi" }));
    expect(await screen.findByText("Ayat al-Kursi")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select second" }));
    expect(await screen.findByText("Surah Al-Ikhlas")).toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
      <output>{controller.state.status}</output>
      <output data-testid="completed-audio-entry">{controller.state.completedEntryId ?? ""}</output>
      <output data-testid="audio-completion-sequence">{controller.state.completionSequence}</output>
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

describe("AudioProvider integration", () => {
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
    expect(screen.getByRole("progressbar", { name: "Listening progress" })).toBeInTheDocument();
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
    expect(screen.getByText("Repetition 1 / 3")).toBeInTheDocument();

    // The pill shows the rate it is on and steps to the next one; the old
    // control was a five-option select two taps inside a collapsed panel.
    const speed = screen.getByRole("button", { name: /Speed/ });
    expect(speed).toHaveTextContent("1×");
    fireEvent.click(speed);
    expect(screen.getByRole("button", { name: /Speed/ })).toHaveTextContent("1.25×");

    const repeat = screen.getByRole("button", { name: "Repeat" });
    expect(repeat).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(repeat);
    expect(screen.getByRole("button", { name: "Repeat" })).toHaveAttribute("aria-pressed", "false");

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
    fireEvent.click(await screen.findByRole("button", { name: /Mute audio/ }));

    const volume = screen.getByRole("slider", { name: "Volume" });
    expect(volume).not.toHaveAttribute("aria-orientation", "vertical");
    fireEvent.change(volume, { target: { value: "0.4" } });

    expect(screen.getByRole("button", { name: /Volume 40%/ })).toBeInTheDocument();
    expect(window.localStorage.getItem("azkar.audio-preferences.v1")).toContain('"volume":0.4');
  });

  it("fills the Arabic timeline from the right without changing media time", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness language="ar" />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const timeline = await screen.findByRole("slider", { name: "تقديم أو تأخير الصوت" });
    expect(timeline.getAttribute("style")).toContain("to left");
    expect(timeline).toHaveValue("0");

    fireEvent.click(screen.getByRole("button", { name: "توسيع المشغل" }));
    expect(screen.getByText("المصدر · تلاوة القارئ")).toBeInTheDocument();
    expect(screen.queryByText("Source · Attribution")).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "Start English" }));
    await waitFor(() => expect(mediaSession.playbackState).toBe("playing"));
    expect(mediaSession.metadata).toMatchObject({
      title: "Ayat al-Kursi",
      artist: "English Translation (George)",
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

    Object.defineProperty(window.navigator, "mediaSession", { configurable: true, value: undefined });
  });
});

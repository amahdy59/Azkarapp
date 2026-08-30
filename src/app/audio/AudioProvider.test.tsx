import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FloatingAudioPlayer } from "../components/FloatingAudioPlayer";
import { AudioProvider, useAudioController } from "./AudioProvider";
import type { PlaybackPlan } from "./audioTypes";

class FakeAudio extends EventTarget {
  static rejectPlay = false;
  private source = "";
  currentTime = 0;
  duration = 12;
  playbackRate = 1;
  paused = true;
  ended = false;
  error: MediaError | null = null;

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
    if (FakeAudio.rejectPlay) return Promise.reject(new DOMException("blocked", "NotAllowedError"));
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
            attribution: "Attribution",
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

function Harness() {
  const controller = useAudioController();
  return (
    <>
      <button type="button" onClick={() => controller.startPlan(plan)}>
        Start
      </button>
      <output>{controller.state.status}</output>
      {controller.state.plan && <FloatingAudioPlayer controller={controller} language="en" />}
    </>
  );
}

afterEach(() => {
  cleanup();
  FakeAudio.rejectPlay = false;
  vi.unstubAllGlobals();
});

describe("AudioProvider integration", () => {
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
    FakeAudio.rejectPlay = true;
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

  it("toggles between expanded and mini-player modes without stopping audio", async () => {
    vi.stubGlobal("Audio", FakeAudio);
    render(
      <AudioProvider>
        <Harness />
      </AudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(await screen.findByRole("region", { name: "Audio player" })).toBeInTheDocument();

    // Minimize player
    fireEvent.click(screen.getByRole("button", { name: "Minimize player" }));
    expect(screen.getByRole("button", { name: "Expand player" })).toBeInTheDocument();

    // Expand player back
    fireEvent.click(screen.getByRole("button", { name: "Expand player" }));
    expect(screen.getByRole("button", { name: "Minimize player" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward 10 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rewind 10 seconds" })).toBeInTheDocument();
  });
});

import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { COUNTER_SOUND_STORAGE_KEY } from "../hooks/useCounterClickFeedback";
import { CustomCounterScreen } from "./CustomCounterScreen";

describe("CustomCounterScreen Component", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("renders correctly in Arabic with initial state", () => {
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    expect(screen.getByText("المسبحة الإلكترونية")).toBeInTheDocument();
    expect(screen.getByText("الذكر المأثور")).toBeInTheDocument();
    expect(screen.getByText("سُبْحَانَ اللَّهِ وَبِحَمْدِهِ")).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-counter-surface")[0]).toHaveClass("custom-counter-surface");
  });

  it("increments counter on tap and supports undo/reset", () => {
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    const tapButton = screen.getAllByTestId("custom-counter-surface")[0]!;
    fireEvent.click(tapButton);

    expect(screen.getByText("١")).toBeInTheDocument();
    const undoButton = screen.getAllByText("تراجع")[0]?.closest("button");
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton!);
    expect(screen.getAllByText("٠")[0]).toBeInTheDocument();
  });

  it("persists a localized sound toggle with pressed-state semantics", () => {
    const firstRender = render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    const mute = screen.getByRole("button", { name: "Counter sound" });

    expect(mute).toHaveAttribute("aria-pressed", "true");
    expect(mute).toHaveClass("size-11");
    fireEvent.click(mute);
    expect(screen.getByRole("button", { name: "Counter sound" })).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem(COUNTER_SOUND_STORAGE_KEY)).toBe("false");

    firstRender.unmount();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: "صوت العداد" })).toHaveAttribute("aria-pressed", "false");
  });

  it("counts once from the focused counter but never from Space on another control", () => {
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    const counter = screen.getByTestId("custom-counter-surface");
    const soundToggle = screen.getByTestId("counter-sound-toggle");

    soundToggle.focus();
    fireEvent.keyDown(soundToggle, { key: " ", code: "Space" });
    expect(counter).toHaveTextContent("0");

    counter.focus();
    fireEvent.keyDown(counter, { key: " ", code: "Space" });
    expect(counter).toHaveTextContent("1");

    const undo = screen.getByRole("button", { name: "Undo" });
    undo.focus();
    fireEvent.keyDown(undo, { key: " ", code: "Space" });
    expect(counter).toHaveTextContent("1");
  });

  it("plays the Web Audio click when an enabled counter is tapped", () => {
    const oscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const context = {
      state: "running",
      currentTime: 1,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
    };
    vi.stubGlobal(
      "AudioContext",
      vi.fn(function AudioContextMock() {
        return context;
      }),
    );

    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("custom-counter-surface"));

    expect(oscillator.start).toHaveBeenCalledWith(1);
    // The bead cue layers two wooden partials with different decays.
    expect(oscillator.stop).toHaveBeenCalledWith(1.07);
    expect(oscillator.stop).toHaveBeenCalledWith(1.045);
  });
});

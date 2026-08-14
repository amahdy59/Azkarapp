import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { COUNTER_SOUND_STORAGE_KEY } from "../hooks/useCounterClickFeedback";
import { CustomCounterScreen } from "./CustomCounterScreen";

describe("CustomCounterScreen Component", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("renders correctly in Arabic with initial state", () => {
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    expect(screen.getByText("المسبحة")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "التسبيح والتحميد" })).toBeInTheDocument();
    expect(screen.getByText("سُبْحَانَ اللَّهِ وَبِحَمْدِهِ")).toBeInTheDocument();
    expect(screen.getAllByTestId("custom-counter-surface")[0]).toHaveClass("adaptive-counter-surface");
  });

  it("increments on tap, removes undo, and keeps reset as the single secondary action in the menu", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={onBack} />);

    const tapButton = screen.getAllByTestId("custom-counter-surface")[0]!;
    fireEvent.click(tapButton);

    expect(screen.getByTestId("custom-counter-surface")).toHaveTextContent("١");
    expect(screen.queryByRole("button", { name: "تراجع" })).not.toBeInTheDocument();

    // Open More Options and click Reset
    await user.click(screen.getByRole("button", { name: "المزيد من الخيارات" }));
    await user.click(screen.getByRole("menuitem", { name: "إعادة تعيين العداد" }));

    expect(screen.getAllByText("٠")[0]).toBeInTheDocument();
  });

  it("counts from non-interactive canvas space while protecting controls", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);

    const canvas = screen.getByTestId("custom-counter-content");
    const counter = screen.getByTestId("custom-counter-surface");
    fireEvent.click(canvas);
    expect(counter).toHaveTextContent("1");

    // Click the target filter instead of opening the zikr dropdown
    await user.click(screen.getByTestId("counter-target-filter"));
    expect(counter).toHaveTextContent("1");
  });

  it("persists a localized sound toggle with pressed-state semantics inside More Options menu", async () => {
    const user = userEvent.setup();
    const firstRender = render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);

    // Open More Options
    await user.click(screen.getByRole("button", { name: "More options" }));
    const mute = screen.getByRole("menuitem", { name: "Mute counter sound" });

    // Toggle sound
    await user.click(mute);

    // Verify local storage and menu item change
    await user.click(screen.getByRole("button", { name: "More options" }));
    expect(screen.getByRole("menuitem", { name: "Enable counter sound" })).toBeInTheDocument();
    expect(window.localStorage.getItem(COUNTER_SOUND_STORAGE_KEY)).toBe("false");

    firstRender.unmount();
    render(<CustomCounterScreen isArabic={true} direction="rtl" onBack={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "المزيد من الخيارات" }));
    expect(screen.getByRole("menuitem", { name: "تشغيل صوت العداد" })).toBeInTheDocument();
  });

  it("counts once from the focused counter but never from Space on another control", () => {
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    const counter = screen.getByTestId("custom-counter-surface");
    const moreOptions = screen.getByRole("button", { name: "More options" });

    moreOptions.focus();
    fireEvent.keyDown(moreOptions, { key: " ", code: "Space" });
    expect(counter).toHaveTextContent("0");

    counter.focus();
    fireEvent.keyDown(counter, { key: " ", code: "Space" });
    expect(counter).toHaveTextContent("1");
  });

  it("exposes the zikr picker as a labelled dropdown menu", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);

    const picker = screen.getByRole("button", { name: /Tasbeeh & Tahmeed/i });

    await user.click(picker);

    // Verify that the dropdown menu options are visible (checking another category)
    expect(screen.getByRole("menuitemradio", { name: /Tahliel & Tawheed/i })).toBeInTheDocument();
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

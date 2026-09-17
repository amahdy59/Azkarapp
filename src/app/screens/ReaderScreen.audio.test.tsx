import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { getAzkarForMode, registerLazyCollection } from "../content/azkar";
import { FRIDAY_KAHF } from "../content/fridayKahf";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ReaderScreen audio identity", () => {
  it("provides a direct, progress-aware collection navigator on wide screens", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("min-width: 768px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const morning = getAzkarForMode("morning", "core");
    const onSelectZikr = vi.fn();

    render(
      <ReaderScreen
        catId="morning"
        idx={0}
        routineMode="core"
        azkarList={morning}
        isArabic
        direction="rtl"
        themeMode="light"
        isDone
        collectionCompletedCount={1}
        completedZikrIds={new Set([morning[0].id])}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onSelectZikr={onSelectZikr}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    const navigator = screen.getByTestId("reader-collection-navigator");
    expect(navigator).toHaveAccessibleName("عرض جميع الأذكار");
    expect(screen.getByRole("button", { name: /ذكر .*, اكتمل/ })).toHaveAttribute("aria-current", "step");

    fireEvent.click(screen.getByRole("button", { name: /ذكر ٢ من/ }));
    expect(onSelectZikr).toHaveBeenCalledWith(1);

    // Collapsing sidebar using toggle button
    const toggleBtn = screen.getByTestId("reader-sidebar-toggle");
    fireEvent.click(toggleBtn);
    expect(navigator).toHaveClass("w-0");

    // Expanding sidebar using toggle button
    fireEvent.click(toggleBtn);
    expect(navigator).toHaveClass("w-[34%]");
  });

  it("renders a compact horizontal text size segmented control in the more options menu", async () => {
    const onTextSizeChange = vi.fn();
    render(
      <ReaderScreen
        catId="morning"
        idx={0}
        routineMode="core"
        isArabic
        direction="rtl"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={onTextSizeChange}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "خيارات القارئ" }), { button: 0, ctrlKey: false });

    const smallBtn = await screen.findByTestId("reader-text-size-small");
    const mediumBtn = await screen.findByTestId("reader-text-size-medium");
    const largeBtn = await screen.findByTestId("reader-text-size-large");

    expect(smallBtn).toBeInTheDocument();
    expect(mediumBtn).toBeInTheDocument();
    expect(largeBtn).toBeInTheDocument();
    expect(mediumBtn).toHaveAttribute("aria-checked", "true");
    expect(smallBtn).toHaveAttribute("aria-checked", "false");

    fireEvent.click(largeBtn);
    expect(onTextSizeChange).toHaveBeenCalledWith("large");
  });

  it("offers dedicated Arabic and English playback actions", async () => {
    const onPlayAudio = vi.fn();
    const onPlayEnglishAudio = vi.fn();
    render(
      <ReaderScreen
        catId="before_sleep"
        idx={3}
        routineMode="complete"
        isArabic={false}
        direction="ltr"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation
        showTransliteration
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        englishAudioAvailable
        onPlayAudio={onPlayAudio}
        onPlayEnglishAudio={onPlayEnglishAudio}
      />,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Reader options" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Play Arabic recitation" }));
    expect(onPlayAudio).toHaveBeenCalledOnce();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Reader options" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Play English translation" }));
    expect(onPlayEnglishAudio).toHaveBeenCalledOnce();
  });

  it("offers continuous play for the available routine from reader options", async () => {
    const onPlayAllAudio = vi.fn();
    render(
      <ReaderScreen
        catId="morning"
        idx={2}
        routineMode="core"
        isArabic={false}
        direction="ltr"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation
        showTransliteration
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        onPlayAllAudio={onPlayAllAudio}
      />,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Reader options" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Play All Audio" }));
    expect(onPlayAllAudio).toHaveBeenCalledOnce();
  });

  it("indexes the selected Core routine rather than the Complete list", () => {
    render(
      <ReaderScreen
        catId="morning"
        idx={2}
        routineMode="core"
        isArabic={false}
        direction="ltr"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation
        showTransliteration
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    expect(screen.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "m-hm-75");
    // Header chrome is two actions: Benefit and the overflow control. Share,
    // save and the counter-sound toggle all live inside that overflow menu.
    expect(screen.getByRole("button", { name: "Benefit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reader options" })).toBeInTheDocument();
    for (const name of ["Share zikr", "Save zikr", "Counter sound"]) {
      expect(screen.queryByRole("button", { name })).toBeNull();
    }
  });

  it("lets the active audio player own completion instead of showing a second counter", () => {
    render(
      <ReaderScreen
        catId="morning"
        idx={2}
        routineMode="core"
        isArabic={false}
        direction="ltr"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        audioModeActive
      />,
    );

    expect(screen.queryByTestId("reader-counter-stack")).not.toBeInTheDocument();
  });

  it("renders 3 options for long surahs without the surah text", () => {
    registerLazyCollection("friday_kahf", FRIDAY_KAHF);
    const onComplete = vi.fn();

    render(
      <ReaderScreen
        catId="friday_kahf"
        idx={0}
        routineMode="complete"
        isArabic
        direction="rtl"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={onComplete}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    // Now the 3 options should be visible, and NO surah text or difficult words toggle
    expect(screen.queryByTestId("zikr-text")).toBeNull();
    expect(screen.queryByRole("switch", { name: "تظليل الكلمات الغريبة" })).toBeNull();
    expect(screen.queryByTestId("counter-surface")).toBeNull();

    // Check for the 3 buttons
    expect(screen.getByRole("button", { name: "الاستماع للسورة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "الاستماع للسورة" })).toBeDisabled(); // audioAvailable is false

    const readMushafBtn = screen.getByRole("button", { name: "قراءة من المصحف" });
    expect(readMushafBtn).toBeInTheDocument();

    const readExternallyBtn = screen.getByRole("button", { name: "قرأتها بالفعل" });
    expect(readExternallyBtn).toBeInTheDocument();

    // Clicking "قرأتها بالفعل" should complete it
    fireEvent.click(readExternallyBtn);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("allows tapping the empty canvas area between text and counter to count zikr for small surahs", () => {
    const onComplete = vi.fn();

    render(
      <ReaderScreen
        catId="morning"
        idx={5}
        routineMode="complete"
        isArabic
        direction="rtl"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={onComplete}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    const reader = screen.getByTestId("reader-screen");
    const counter = screen.getByTestId("counter-surface");
    expect(reader).toHaveAttribute("data-counting-mode", "canvas");
    expect(counter).toHaveAccessibleName(/٠ \/ ٣/);

    fireEvent.click(reader);
    expect(counter).toHaveAccessibleName(/١ \/ ٣/);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("keeps tap-anywhere counting for non-surah adhkar", () => {
    const onComplete = vi.fn();

    render(
      <ReaderScreen
        catId="morning"
        idx={2}
        routineMode="core"
        isArabic={false}
        direction="ltr"
        themeMode="light"
        isDone={false}
        collectionCompletedCount={0}
        hapticFeedback={false}
        showTranslation={false}
        showTransliteration={false}
        textSize="medium"
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={onComplete}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    expect(screen.getByTestId("reader-screen")).toHaveAttribute("data-counting-mode", "canvas");
    fireEvent.click(screen.getByTestId("reader-screen"));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});

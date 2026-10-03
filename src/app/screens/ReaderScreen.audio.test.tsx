import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  it.each(["morning", "evening", "before_sleep"] as const)(
    "uses the concise Ayah Al-Kursi heading in %s without changing source metadata",
    (catId) => {
      const azkar = getAzkarForMode(catId, "complete");
      const idx = azkar.findIndex((zikr) => zikr.canonicalKey === "quran-002-255");
      expect(idx).toBeGreaterThanOrEqual(0);
      const sourceName = azkar[idx].surahNameArabic;
      render(
        <ReaderScreen
          catId={catId}
          idx={idx}
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
          onComplete={() => undefined}
          onAdvance={() => undefined}
          onNext={() => undefined}
          onPrev={() => undefined}
          onToggleSaved={() => undefined}
          audioAvailable={false}
        />,
      );
      expect(screen.getByRole("heading", { name: "آية الكرسي", level: 2 })).toBeInTheDocument();
      expect(azkar[idx].surahNameArabic).toBe(sourceName);
      const toggle = screen.getByRole("switch", { name: "تظليل الكلمات الغريبة" });
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-checked", "true");
    },
  );

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
    expect(navigator).toHaveAttribute("hidden");
    expect(screen.queryByRole("button", { name: /ذكر ٢ من/ })).not.toBeInTheDocument();

    // Expanding sidebar using toggle button
    fireEvent.click(toggleBtn);
    expect(navigator).toHaveClass("w-[34%]");
    expect(navigator).not.toHaveAttribute("hidden");
    fireEvent.click(within(navigator).getByRole("button", { name: toggleBtn.getAttribute("aria-label")! }));
    expect(navigator).toHaveAttribute("hidden");
    expect(toggleBtn).toHaveFocus();
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

    const decreaseBtn = await screen.findByTestId("reader-text-size-small");
    const increaseBtn = await screen.findByTestId("reader-text-size-large");

    expect(decreaseBtn).toBeInTheDocument();
    expect(increaseBtn).toBeInTheDocument();
    expect(decreaseBtn).not.toBeDisabled();
    expect(increaseBtn).not.toBeDisabled();

    fireEvent.click(increaseBtn);
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
    // On screens with a counter, header chrome is only the overflow control.
    // Benefit is positioned beside the counter in the bottom dock.
    const headerActions = screen.getByTestId("reader-actions");
    expect(within(headerActions).queryByRole("button", { name: "Benefit" })).not.toBeInTheDocument();
    expect(within(headerActions).getByRole("button", { name: "Reader options" })).toBeInTheDocument();
    expect(screen.getByTestId("reader-benefit-dock-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share zikr" })).toBeVisible();
    for (const name of ["Save zikr", "Counter sound"]) {
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
    const readerCard = screen.getByTestId("reader-card");
    const counter = screen.getByTestId("counter-surface");
    expect(reader).toHaveAttribute("data-counting-mode", "canvas");
    expect(counter).toHaveAccessibleName(/٠ \/ ٣/);

    // Clicking outer screen margin does not count
    fireEvent.click(reader);
    expect(counter).toHaveAccessibleName(/٠ \/ ٣/);

    // Clicking reader card counts
    fireEvent.click(readerCard);
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
    fireEvent.click(screen.getByTestId("reader-card"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("renders docked audioPlayer inside reader card on both desktop and mobile", () => {
    // Desktop check
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("min-width: 768px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { rerender } = render(
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
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onSelectZikr={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        audioPlayer={<div data-testid="docked-test-player">Audio Player</div>}
      />,
    );

    expect(screen.getByTestId("docked-test-player")).toBeInTheDocument();
    // Desktop sidebar remains present and interactive
    expect(screen.getByTestId("reader-collection-navigator")).toBeInTheDocument();

    // Mobile check
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    rerender(
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
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        audioPlayer={<div data-testid="docked-test-player">Audio Player</div>}
      />,
    );

    expect(screen.getByTestId("docked-test-player")).toBeInTheDocument();
  });

  it("calls onViewAllAzkar when the view all azkar menu option is clicked", async () => {
    const onViewAllAzkar = vi.fn();
    const onBack = vi.fn();
    render(
      <ReaderScreen
        catId="evening"
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
        onBack={onBack}
        onViewAllAzkar={onViewAllAzkar}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable={false}
      />,
    );

    const menuButton = screen.getAllByRole("button", { name: /خيارات القارئ|Reader options/i })[0]!;
    fireEvent.pointerDown(menuButton, { button: 0, ctrlKey: false });

    const viewAllButton = await screen.findByTestId("reader-view-all-azkar");
    expect(viewAllButton).toBeInTheDocument();
    fireEvent.click(viewAllButton);

    expect(onViewAllAzkar).toHaveBeenCalledOnce();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("presents the 5-slot dock with stable Previous, Audio, Counter, Benefit, and Next controls in reading mode", () => {
    const onPlayAudio = vi.fn();
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
        onTextSizeChange={() => undefined}
        savedZikrIds={new Set()}
        onBack={() => undefined}
        onComplete={() => undefined}
        onAdvance={() => undefined}
        onNext={() => undefined}
        onPrev={() => undefined}
        onToggleSaved={() => undefined}
        audioAvailable
        onPlayAudio={onPlayAudio}
      />,
    );

    const dock = screen.getByTestId("reader-dock");
    expect(dock).toBeInTheDocument();

    const audioDockBtn = screen.getByTestId("reader-audio-dock-button");
    expect(audioDockBtn).toBeInTheDocument();
    expect(audioDockBtn).not.toBeDisabled();
    fireEvent.click(audioDockBtn);
    expect(onPlayAudio).toHaveBeenCalled();

    expect(screen.getByTestId("counter-surface")).toBeInTheDocument();
    expect(screen.getByTestId("reader-benefit-dock-button")).toBeInTheDocument();
    expect(screen.getByTestId("reader-share-dock-button")).toHaveTextContent("مشاركة");
    expect(screen.getByTestId("reader-support-actions").querySelectorAll("button")).toHaveLength(3);
  });

  it("morphs center slot into compact audio player when audioModeActive with stable outer slots", () => {
    const onPlayAudio = vi.fn();
    const MockAudioPlayer = (props: {
      dockSlots?: {
        prev?: React.ReactNode;
        audio?: React.ReactNode;
        benefit?: React.ReactNode;
        next?: React.ReactNode;
      };
    }) => (
      <div data-testid="mock-audio-player">
        <div data-testid="mock-prev">{props.dockSlots?.prev}</div>
        <div data-testid="mock-audio">{props.dockSlots?.audio}</div>
        <button type="button" aria-label="إغلاق الصوت والعودة للعداد">
          Close
        </button>
        <div data-testid="mock-benefit">{props.dockSlots?.benefit}</div>
        <div data-testid="mock-next">{props.dockSlots?.next}</div>
      </div>
    );

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
        audioPlayer={<MockAudioPlayer />}
        onPlayAudio={onPlayAudio}
      />,
    );

    // Counter surface is replaced by compact audio player
    expect(screen.queryByTestId("counter-surface")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reader-counter-stack")).not.toBeInTheDocument();

    // Mock audio player was cloned and rendered with all 5 dock slots
    expect(screen.getByTestId("mock-audio-player")).toBeInTheDocument();
    expect(screen.getByTestId("mock-prev")).toBeInTheDocument();
    expect(screen.getByTestId("mock-audio")).toBeInTheDocument();
    expect(screen.getByTestId("mock-benefit")).toBeInTheDocument();
    expect(screen.getByTestId("mock-next")).toBeInTheDocument();
  });
});

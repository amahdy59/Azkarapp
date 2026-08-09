import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { registerLazyCollection } from "../content/azkar";
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
    // Phone chrome: Benefit, Share and the overflow control share one header
    // row; the counter-sound toggle moved into that overflow menu.
    expect(screen.getByRole("button", { name: "Benefit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share zikr" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reader options" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Counter sound" })).toBeNull();
  });

  it("renders reviewed Mushaf pages and keeps long-surah completion at the end", () => {
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

    expect(screen.getByTestId("reader-screen")).toHaveAttribute("data-counting-mode", "counter-only");
    expect(screen.getByTestId("counter-surface")).toHaveAccessibleName(/اضغط العداد عند الإتمام/);
    expect(screen.getAllByTestId("mushaf-page")).toHaveLength(12);
    expect(screen.getAllByTestId("mushaf-page-separator")).toHaveLength(11);
    const finalPage = screen.getAllByTestId("mushaf-page").at(-1)!;
    const endCounter = screen.getByTestId("long-surah-end-counter");
    expect(endCounter).toContainElement(screen.getByTestId("counter-surface"));
    expect(finalPage.compareDocumentPosition(endCounter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Reading taps and the global Space shortcut cannot complete a long surah.
    fireEvent.click(screen.getAllByTestId("zikr-text")[0]!);
    fireEvent.keyDown(window, { key: " ", code: "Space" });
    expect(onComplete).not.toHaveBeenCalled();

    // Clear mock to test the next interaction
    onComplete.mockClear();

    const difficultWord = screen.getAllByTestId("quran-word-help")[0]!;
    fireEvent.click(difficultWord);
    expect(screen.getByTestId("quran-word-meaning-sheet")).toBeVisible();
    expect(screen.getByRole("link", { name: /الميسر في غريب القرآن/ })).toHaveAttribute(
      "href",
      "https://qurancomplex.gov.sa/en/techquran/dev/",
    );
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("إغلاق معنى الكلمة"));

    fireEvent.click(screen.getByTestId("counter-surface"));
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

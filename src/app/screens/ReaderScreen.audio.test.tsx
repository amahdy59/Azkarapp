import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { registerLazyCollection } from "../content/azkar";
import { FRIDAY_KAHF } from "../content/fridayKahf";

beforeEach(() => {
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
        arabicFont="ibm_plex"
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
  });

  it("only completes a full surah from its counter", () => {
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
        arabicFont="ibm_plex"
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

    fireEvent.click(screen.getByTestId("reader-screen"));
    fireEvent.click(screen.getByTestId("zikr-text"));
    expect(onComplete).not.toHaveBeenCalled();

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
        arabicFont="ibm_plex"
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

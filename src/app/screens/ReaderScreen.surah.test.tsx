import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { registerLazyCollection } from "../content/azkar";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { getAzkarByCategory } from "../content/azkar";

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

function renderReader(catId: Parameters<typeof getAzkarByCategory>[0], idx: number) {
  render(
    <ReaderScreen
      catId={catId}
      idx={idx}
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
      audioAvailable={false}
    />,
  );
}

function indexOf(catId: "before_sleep", zikrId: string) {
  return getAzkarByCategory(catId).findIndex((zikr) => zikr.id === zikrId);
}

describe("the three surah readings", () => {
  it("shows the reading aids the reader asked for, on the surahs too", () => {
    renderReader("before_sleep", indexOf("before_sleep", "s-hm-110a"));
    const zikr = screen.getByTestId("reader-screen");
    expect(zikr).toHaveAttribute("data-zikr-id", "s-hm-110a");

    // Both are enabled, and As-Sajdah carries ~4,000 characters of translation
    // and ~3,100 of transliteration at runtime — complete, not the stub the
    // source draft holds. The reader shows one and hides the other.
    expect({
      translation: Boolean(screen.queryByText("Translation")),
      pronunciation: Boolean(screen.queryByText("Pronunciation in English")),
    }).toEqual({ translation: true, pronunciation: true });
  });

  it("shows Al-Kahf's translation, which it has in full for every verse", () => {
    registerLazyCollection("friday_kahf", FRIDAY_KAHF);
    render(
      <ReaderScreen
        catId="friday_kahf"
        idx={0}
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
        audioAvailable={false}
      />,
    );
    // The translation is built by joining all 110 verses with their numbers and
    // shipped in the bundle. `!z.surahNameArabic` then hides it for anything
    // flagged as a surah, so the one collection with a complete translation is
    // the one that never shows it.
    expect(screen.queryByText("Translation")).not.toBeNull();
  });
});

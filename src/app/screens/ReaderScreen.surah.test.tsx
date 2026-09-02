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

  it("gives a short surah its identity, not just a Basmalah", () => {
    // Al-Ikhlas rendered as a Basmalah line above a paragraph of Arabic:
    // indistinguishable from a dua, when it is Qur'an. QuranSurahHeader was
    // built for exactly this and was imported nowhere.
    renderReader("before_sleep", indexOf("before_sleep", "s-hm-99-ikhlas"));
    expect(screen.getByText(/سُورَةُ/)).toBeInTheDocument();
    expect(document.querySelector(".quran-passage")).not.toBeNull();
  });

  it("does not frame a surah that opens in the Mushaf instead", () => {
    // As-Sajdah is multi-page and has the real page frame there; a second rule
    // around the reader's copy would be two different frames for one surah.
    renderReader("before_sleep", indexOf("before_sleep", "s-hm-110a"));
    expect(document.querySelector(".quran-passage")).toBeNull();
  });

  it("offers a phrase to press when the count can only ever be one", () => {
    renderReader("before_sleep", indexOf("before_sleep", "s-hm-110a"));
    const counter = screen.getByTestId("counter-surface");
    // "٠ / ١" is a completion button drawn as a score, in the tallest control
    // on screen, on exactly the readings that need the room for their text.
    expect(counter).toHaveAttribute("data-counter-variant", "action");
    expect(counter.textContent).not.toMatch(/[٠-٩]\s*\/\s*[٠-٩]/);
  });

  it("keeps the tally where the count is real", () => {
    const list = getAzkarByCategory("before_sleep");
    const repeated = list.findIndex((zikr) => (zikr.repetitionCount ?? 1) > 1);
    expect(repeated).toBeGreaterThanOrEqual(0);
    renderReader("before_sleep", repeated);
    expect(screen.getByTestId("counter-surface")).toHaveAttribute("data-counter-variant", "tally");
  });
});

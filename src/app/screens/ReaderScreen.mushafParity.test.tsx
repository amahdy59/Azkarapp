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
  registerLazyCollection("friday_kahf", FRIDAY_KAHF);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderKahf(overrides: Record<string, unknown> = {}) {
  render(
    <ReaderScreen
      catId="friday_kahf"
      idx={0}
      routineMode="complete"
      isArabic
      direction="rtl"
      themeMode="midnight"
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
      mushafBookmarks={[]}
      onToggleMushafBookmark={() => undefined}
      mushafSettings={{
        theme: "follow-app",
        appTheme: "midnight",
        onSelectTheme: () => undefined,
        layout: "auto",
        onSelectLayout: () => undefined,
        onSelectTextScale: () => undefined,
        toolbarSide: "right",
        onSelectToolbarSide: () => undefined,
      }}
      {...overrides}
    />,
  );
}

describe("the surah view is the Mushaf", () => {
  it("opens a multi-page surah as Mushaf pages without being asked", () => {
    // It used to sit behind a menu item, so most readers never saw the view
    // these surahs are laid out for.
    renderKahf();
    expect(screen.getByTestId("mushaf-immersive-track")).toBeInTheDocument();
  });

  it("carries the Mushaf's own toolbar, in the Mushaf's own order", () => {
    renderKahf();
    // The rail's own test ids, so this asserts the Mushaf's controls rather
    // than labels that could drift.
    for (const id of [
      "mushaf-rail-back",
      "mushaf-rail-previous",
      "mushaf-rail-next",
      "mushaf-rail-page-bookmark",
      "mushaf-difficult-words-switch",
      "mushaf-focus-enter",
      "mushaf-fullscreen-toggle",
      "mushaf-settings-trigger",
    ]) {
      expect(screen.getByTestId(id), id).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "فهرس المصحف الشريف" })).toBeInTheDocument();
  });

  it("opens the reading settings, rather than showing a button that does nothing", () => {
    // These two were stubbed when the rail first went in. A visible control
    // that does nothing is worse than one that is absent.
    renderKahf();
    const settingsShowing = () => (document.body.textContent ?? "").includes("إعدادات القراءة");

    // Absent first, so this cannot pass on a sheet that was always rendered.
    expect(settingsShowing()).toBe(false);
    fireEvent.click(screen.getByTestId("mushaf-settings-trigger"));
    expect(settingsShowing()).toBe(true);
    expect(document.body.textContent).toContain("حجم النص");
  });

  it("scopes the index to the surah, so it cannot navigate out of it", () => {
    renderKahf();
    fireEvent.click(screen.getByRole("button", { name: "فهرس المصحف الشريف" }));
    // Al-Kahf runs 293-304. The surah and juz tabs would carry the reader out
    // of the surah they opened, so a scoped index does not offer them.
    const input = screen.getByLabelText(/أدخل رقم الصفحة/) as HTMLInputElement;
    expect(input.getAttribute("min")).toBe("293");
    expect(input.getAttribute("max")).toBe("304");
    expect(screen.queryByRole("tab", { name: /السور/ })).toBeNull();
    // The label states the span too — it read "(١-٦٠٤)" while the field refused
    // anything outside the surah, inviting a number it would ignore.
    expect(input.labels?.[0]?.textContent).toContain("٢٩٣");
  });
});

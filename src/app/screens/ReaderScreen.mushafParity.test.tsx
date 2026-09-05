import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderScreen } from "./ReaderScreen";
import { registerLazyCollection } from "../content/azkar";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { MUSHAF_SHORTCUTS } from "../components/MushafKeyboardShortcuts";
import { t } from "../i18n";

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

  it("lets the reader out of focus mode", () => {
    renderKahf();
    // Focus mode hides the rail that turned it on. Without a way back the only
    // exit was leaving the surah altogether — and on a phone, with no keyboard,
    // there was no exit at all.
    expect(screen.queryByTestId("mushaf-focus-exit")).toBeNull();
    fireEvent.click(screen.getByTestId("mushaf-focus-enter"));
    expect(screen.getByTestId("mushaf-focus-exit")).toBeInTheDocument();
    expect(screen.queryByTestId("mushaf-rail-back")).toBeNull();

    fireEvent.click(screen.getByTestId("mushaf-focus-exit"));
    expect(screen.getByTestId("mushaf-rail-back")).toBeInTheDocument();
  });

  it("gives the tools back before it gives up the surah", () => {
    renderKahf();
    fireEvent.click(screen.getByTestId("mushaf-focus-enter"));
    // Escape leaves focus mode first, as it does in the Mushaf: one keypress
    // meant to undo the last thing should not cost the reader their place.
    // Fired on an element, as a real keypress is: the handler inspects the
    // target, and window has no element to inspect.
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.getByTestId("mushaf-rail-back")).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-immersive")).toBeInTheDocument();
  });

  it("offers no way to finish until the surah has been read", () => {
    renderKahf();
    // The completion belongs to the end of the surah, not to the start of it.
    expect(screen.queryByTestId("mushaf-immersive-return")).toBeNull();
  });

  it("finishes the surah once, and moves on", () => {
    const onComplete = vi.fn();
    const onAdvance = vi.fn();
    renderKahf({ onComplete, onAdvance });

    // Al-Kahf spans twelve pages; reach the last one.
    for (let turn = 0; turn < 12; turn += 1) {
      const next = screen.queryByTestId("mushaf-rail-next");
      if (!next || (next as HTMLButtonElement).disabled) break;
      fireEvent.click(next);
    }

    const finish = screen.getByTestId("mushaf-immersive-return");
    fireEvent.click(finish);

    // Recorded and moved on in one act. This used to record the reading and
    // then hand the reader back a counter for the surah they had just read —
    // and on a desktop, where the rail replaced the bars, the completion was
    // not reachable from the Mushaf at all.
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("keeps one set of tools through a page turn", () => {
    renderKahf();
    // The viewer sat inside AnimatePresence, so a turn mounted a second copy of
    // the whole thing — two rails on screen, sliding with the page. The Mushaf
    // animates its paper instead and leaves the tools standing still.
    fireEvent.click(screen.getByTestId("mushaf-rail-next"));
    expect(screen.getAllByTestId("mushaf-rail-next")).toHaveLength(1);
    expect(screen.getAllByTestId("mushaf-rail-back")).toHaveLength(1);
  });

  it("places the completion action on the rail when at the end of the surah", () => {
    renderKahf();

    for (let turn = 0; turn < 12; turn += 1) {
      const next = screen.queryByTestId("mushaf-rail-next");
      if (!next || (next as HTMLButtonElement).disabled) break;
      fireEvent.click(next);
    }

    const finish = screen.getByTestId("mushaf-immersive-return");
    expect(finish.closest("[data-testid='mushaf-tool-rail']")).not.toBeNull();
  });
});

/**
 * Listening to the surah, from the surface the surah is read on.
 *
 * The reader holds no playback state: it reports what the app's one audio
 * controller is doing and offers one way to interrupt it. These cover the
 * seam between the two rather than the player itself, which has its own.
 */
describe("the Mushaf offers the surah's recitation", () => {
  const audio = (overrides: Partial<{ available: boolean; status: string; onToggle: () => void }> = {}) => ({
    available: true,
    status: "idle" as const,
    onToggle: () => undefined,
    ...overrides,
  });

  it("puts the listen control on the rail, beside the surah it plays", () => {
    renderKahf({ surahAudio: audio() });
    const listen = screen.getByTestId("mushaf-rail-listen");
    expect(listen.closest("[data-testid='mushaf-tool-rail']")).not.toBeNull();
    expect(listen).toHaveAccessibleName("الاستماع إلى السورة");
    expect(listen).toBeEnabled();
  });

  it("hands the press to the one controller rather than starting playback itself", () => {
    const onToggle = vi.fn();
    renderKahf({ surahAudio: audio({ onToggle }) });
    fireEvent.click(screen.getByTestId("mushaf-rail-listen"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("says what the recitation is doing, so the rail and the player cannot disagree", () => {
    renderKahf({ surahAudio: audio({ status: "playing" }) });
    expect(screen.getByTestId("mushaf-rail-listen")).toHaveAccessibleName("إيقاف التلاوة مؤقتاً");
  });

  it("offers nothing to press on a surah with no reviewed recitation", () => {
    // As-Sajdah and Al-Mulk carry no approved audio asset. A control that
    // looked live and then did nothing would be worse than a plain absence.
    renderKahf({ surahAudio: audio({ available: false }) });
    const listen = screen.getByTestId("mushaf-rail-listen");
    expect(listen).toBeDisabled();
    expect(listen).toHaveAccessibleName("الصوت غير متاح");
  });

  it("takes Space for the recitation, which the counting reader never could", () => {
    // The spread does not scroll, so Space has no default here to displace.
    const onToggle = vi.fn();
    renderKahf({ surahAudio: audio({ onToggle }) });
    fireEvent.keyDown(document.body, { key: " ", code: "Space" });
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("leaves Space alone when there is no recitation to start", () => {
    const onToggle = vi.fn();
    renderKahf({ surahAudio: audio({ available: false, onToggle }) });
    fireEvent.keyDown(document.body, { key: " ", code: "Space" });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("lets a focused control answer Space itself, rather than toggling twice", () => {
    const onToggle = vi.fn();
    renderKahf({ surahAudio: audio({ onToggle }) });
    fireEvent.keyDown(screen.getByTestId("mushaf-rail-listen"), { key: " ", code: "Space" });
    expect(onToggle).not.toHaveBeenCalled();
  });
});

/**
 * The phone carries no rail — `fitsToolRail` keeps the horizontal bars there,
 * because width is what is short on a portrait screen. Every control the rail
 * holds has to have a home in those bars, or it does not exist on a phone.
 */
/**
 * The bars a phone reads a surah through.
 *
 * Everything used to be at the top: the surah, the Mushaf page number, the
 * position in the surah, listen, word meanings and close — six things beside a
 * title on a 375px screen, two of them already printed on the page itself. The
 * header is now the name and the way out; the footer turns pages and carries
 * the tools.
 */
describe("the surah bars divide the work between them", () => {
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
    Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: height });
  };

  afterEach(() => setViewport(1024, 768));

  function phoneChrome() {
    setViewport(390, 844);
    renderKahf({ surahAudio: { available: true, status: "idle" as const, onToggle: () => undefined } });
    const header = document.querySelector('[data-mushaf-chrome="header"]');
    const footer = document.querySelector('[data-mushaf-chrome="footer"]');
    if (!header || !footer) throw new Error("the phone layout renders both bars");
    return { header: header as HTMLElement, footer: footer as HTMLElement };
  }

  it("keeps the header to the surah and the way out", () => {
    const { header } = phoneChrome();

    expect(within(header).getByRole("heading", { level: 2 })).toHaveTextContent("الكَهْف");
    // One action beside the title, not four.
    expect(within(header).getAllByRole("button")).toHaveLength(1);
    expect(within(header).getByTestId("mushaf-immersive-close")).toBeInTheDocument();
  });

  it("names the surah being read, not the one the page happens to open with", () => {
    // Page 293 opens with the tail of Al-Isra, so a header derived from the
    // page named Al-Isra on a screen opened to read Al-Kahf.
    const { header } = phoneChrome();
    expect(header.textContent).not.toMatch(/الإسراء/);
  });

  it("does not repeat what the page already prints", () => {
    const { header } = phoneChrome();
    // The Mushaf page number and the juz are page furniture; the page prints
    // both on itself, as a bound Mushaf does.
    expect(header.textContent).not.toMatch(/٢٩٣/);
    expect(header.textContent).not.toMatch(/الجزء/);
  });

  it("gives the footer the turning and the tools", () => {
    const { footer } = phoneChrome();

    expect(within(footer).getByTestId("mushaf-immersive-previous")).toBeInTheDocument();
    expect(within(footer).getByTestId("mushaf-immersive-next")).toBeInTheDocument();
    expect(within(footer).getByTestId("mushaf-immersive-word-meanings")).toBeInTheDocument();
    expect(within(footer).getByTestId("mushaf-immersive-listen")).toBeInTheDocument();
    expect(within(footer).getByTestId("mushaf-immersive-jump")).toBeInTheDocument();
  });

  it("makes the place in the surah the way to move within it", () => {
    const { footer } = phoneChrome();
    const jump = within(footer).getByTestId("mushaf-immersive-jump");

    // The label a reader hears has to contain what they can see on it.
    expect(jump).toHaveAccessibleName(expect.stringContaining("١ / ١٢"));
    fireEvent.click(jump);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("runs the page to the edges of the screen", () => {
    // The reader kept its own 8px top inset in Mushaf mode, which left a strip
    // of shell above a surface that is supposed to be the page.
    setViewport(390, 844);
    renderKahf();
    const surface = screen.getByTestId("reader-screen");
    expect(surface.className).not.toMatch(/pt-\[max\(0\.5rem/);
  });
});

describe("the recitation is reachable without a rail", () => {
  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
    Object.defineProperty(window, "innerHeight", { configurable: true, writable: true, value: height });
  };

  afterEach(() => setViewport(1024, 768));

  it("puts the listen control in the bars when the rail is not shown", () => {
    setViewport(390, 844);
    renderKahf({ surahAudio: { available: true, status: "idle" as const, onToggle: () => undefined } });

    // The premise: no rail on this screen, so the rail's copy cannot be what
    // this assertion is finding.
    expect(screen.queryByTestId("mushaf-tool-rail")).toBeNull();
    expect(screen.getByTestId("mushaf-immersive-listen")).toHaveAccessibleName("الاستماع إلى السورة");
  });

  it("drives the same controller from the phone's control", () => {
    setViewport(390, 844);
    const onToggle = vi.fn();
    renderKahf({ surahAudio: { available: true, status: "idle" as const, onToggle } });
    fireEvent.click(screen.getByTestId("mushaf-immersive-listen"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("reports playing state on the phone too", () => {
    setViewport(390, 844);
    renderKahf({ surahAudio: { available: true, status: "playing" as const, onToggle: () => undefined } });
    expect(screen.getByTestId("mushaf-immersive-listen")).toHaveAccessibleName("إيقاف التلاوة مؤقتاً");
  });

  it("disables it on a surah with no reviewed recitation", () => {
    setViewport(390, 844);
    renderKahf({ surahAudio: { available: false, status: "idle" as const, onToggle: () => undefined } });
    expect(screen.getByTestId("mushaf-immersive-listen")).toBeDisabled();
  });
});

/**
 * The keys were reachable only by opening the reading settings and scrolling
 * past everything else in them, which is not where a reader looks for "what
 * can I press". They now have a control of their own on the rail.
 */
describe("the Mushaf says which keys it answers", () => {
  it("offers the shortcuts from the rail, not only from the settings panel", () => {
    renderKahf();
    expect(screen.getByTestId("mushaf-rail-shortcuts")).toBeInTheDocument();
  });

  it("opens a dismissible list naming the keys, Space among them", () => {
    renderKahf();
    // Absent first, so this cannot pass on a sheet that was always rendered.
    expect(screen.queryByTestId("mushaf-shortcuts-sheet")).toBeNull();

    fireEvent.click(screen.getByTestId("mushaf-rail-shortcuts"));
    const sheet = screen.getByTestId("mushaf-shortcuts-sheet");
    expect(sheet).toBeInTheDocument();
    // The keys themselves, not just the heading.
    expect(sheet.textContent).toContain("Space");
    expect(sheet.textContent).toContain("Esc");
    expect(sheet.textContent).toContain("Home");
  });

  it("names the list for a screen reader rather than leaving a bare dialog", () => {
    renderKahf();
    fireEvent.click(screen.getByTestId("mushaf-rail-shortcuts"));
    expect(screen.getByRole("dialog")).toHaveAccessibleName(t("ar", "mushaf.keyboardTitle"));
  });

  it("keeps one definition of the keys behind both places that show them", () => {
    // Two copies drift, and a printed shortcut that is wrong is worse than
    // none. Both surfaces render MUSHAF_SHORTCUTS.
    const listed = MUSHAF_SHORTCUTS.map(([key]) => key);
    renderKahf();
    fireEvent.click(screen.getByTestId("mushaf-rail-shortcuts"));
    const sheetText = screen.getByTestId("mushaf-shortcuts-sheet").textContent ?? "";
    for (const key of listed) expect(sheetText, key).toContain(key);
  });
});

/**
 * Ten controls in one undifferentiated column is a list to read, not a rail to
 * scan. These assert the bands exist and that nothing was hidden to make them.
 */
describe("the rail is banded rather than flat", () => {
  const groupNames = () =>
    within(screen.getByTestId("mushaf-tool-rail"))
      .getAllByRole("group")
      .map((g) => g.getAttribute("aria-label"));

  it("bands the tools by the question they answer", () => {
    renderKahf({ surahAudio: { available: true, status: "idle" as const, onToggle: () => undefined } });
    expect(groupNames()).toEqual(["التلاوة", "أدوات القراءة", "العرض", "الإعدادات والمساعدة"]);
  });

  it("drops a band rather than printing an empty one", () => {
    // No recitation control at all on a surface that passes no surahAudio —
    // the Khatmah reader is exactly that case.
    renderKahf();
    expect(screen.queryByTestId("mushaf-rail-listen")).toBeNull();
    expect(groupNames()).not.toContain("التلاوة");
  });

  it("groups without hiding: every control is still one press away", () => {
    // Banding is presentational. Folding half the rail behind an overflow
    // press would cost a click to save height the rail is not short of.
    renderKahf({ surahAudio: { available: true, status: "idle" as const, onToggle: () => undefined } });
    for (const id of [
      "mushaf-rail-listen",
      "mushaf-rail-page-bookmark",
      "mushaf-difficult-words-switch",
      "mushaf-focus-enter",
      "mushaf-fullscreen-toggle",
      "mushaf-settings-trigger",
      "mushaf-rail-shortcuts",
    ]) {
      expect(screen.getByTestId(id), id).toBeVisible();
    }
  });
});

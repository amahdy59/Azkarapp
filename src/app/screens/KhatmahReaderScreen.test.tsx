import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KhatmahReaderScreen } from "./KhatmahReaderScreen";
import { getProgressDayKey } from "../progress";

/** Two consecutive pages of the reference layout, with one reviewed difficult
 *  word (2:255 "ٱلۡقَيُّومُ") so the meanings switch has something to reveal. */
function pageFixture(page: number) {
  return [
    {
      k: "2:255",
      w: [
        [1, 1, 0, "ٱلۡقَيُّومُ"],
        [2, 1, 0, `صفحة${page}`],
        [3, 1, 1, "٢٥٥"],
      ],
    },
  ];
}

/**
 * jsdom opens at 1024x768 — landscape, so the reader stands its tools in the
 * rail. A test that means to exercise the horizontal bars has to say which
 * shape of screen it is talking about.
 */
function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function renderReader(overrides: Partial<Parameters<typeof KhatmahReaderScreen>[0]> = {}) {
  const setKhatmahPage = vi.fn();
  render(
    <KhatmahReaderScreen
      progressDayStartHour={4}
      language="ar"
      direction="rtl"
      onBack={vi.fn()}
      khatmahPage={42}
      setKhatmahPage={setKhatmahPage}
      {...overrides}
    />,
  );
  return { setKhatmahPage };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const page = Number(String(input).match(/(\d+)\.json(?:\?.*)?$/)?.[1] ?? 1);
      return { ok: true, json: async () => pageFixture(page) };
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
});

describe("KhatmahReaderScreen navigation", () => {
  it("keeps semantic next and previous controls aligned with physical direction", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader();

    await screen.findByRole("article", { name: "صفحة ٤٢" });

    await user.click(screen.getByRole("button", { name: "التالي" }));
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);

    await user.click(screen.getByRole("button", { name: "السابق" }));
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("maps the arrow keys the same way, so the key and the button agree", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);

    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("keeps the physical page-turn contract invariant in an English UI", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });

    expect(article).toHaveAttribute("dir", "rtl");
    // The page-turn group stays a named navigation landmark in either chrome,
    // and Previous always precedes Next in the document.
    screen.getByRole("navigation", { name: "Mushaf page navigation" });
    const next = screen.getByRole("button", { name: "Next" });
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);
    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("supports Page Down, Home, End, and Escape without leaking through controls", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const { setKhatmahPage } = renderReader({ language: "en", direction: "ltr", onBack });
    await screen.findByRole("article", { name: "Page 42" });

    await user.keyboard("{PageDown}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);
    await user.keyboard("{Home}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(1);
    await user.keyboard("{End}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(604);
    await user.keyboard("{Escape}");
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("stops at both ends of the Mushaf", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader({ khatmahPage: 1 });
    await screen.findByRole("article", { name: "صفحة ١" });

    expect(screen.getByRole("button", { name: "السابق" })).toBeDisabled();
    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).not.toHaveBeenCalled();
  });
});

describe("KhatmahReaderScreen wird progress", () => {
  it("records the complete forward page event against the supplied devotional day", async () => {
    const user = userEvent.setup();
    const onRecordPages = vi.fn();
    renderReader({
      language: "en",
      direction: "ltr",
      quranWirdPlan: { kind: "daily", dailyPages: 4 },
      onRecordPages,
    });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onRecordPages).toHaveBeenCalledWith(getProgressDayKey(new Date(), 4), [42], 4);
  });

  it("saves navigation without recording progress in free reading", async () => {
    const user = userEvent.setup();
    const onRecordPages = vi.fn();
    const { setKhatmahPage } = renderReader({
      language: "en",
      direction: "ltr",
      quranWirdPlan: { kind: "free", dailyPages: 0 },
      onRecordPages,
    });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);
    expect(onRecordPages).not.toHaveBeenCalled();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows progress against the goal chosen on the overview", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 7, 10, 12));
    const today = getProgressDayKey();
    renderReader({ quranWirdPlan: { kind: "daily", dailyPages: 4 }, wirdHistory: { [today]: [41, 42] } });
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    const progress = screen.getByRole("progressbar", { name: /أكملت ٢ من ٤/ });
    expect(progress).toHaveAttribute("aria-valuenow", "2");
    expect(progress).toHaveAttribute("aria-valuemax", "4");
  });

  it("uses an opaque completion notice and dismisses it automatically", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 12));
    const today = getProgressDayKey();
    renderReader({
      quranWirdPlan: { kind: "daily", dailyPages: 2 },
      wirdHistory: { [today]: [41, 42] },
    });
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByRole("article", { name: "صفحة ٤٢" })).toBeInTheDocument();

    const notice = screen.getByTestId("mushaf-wird-complete");
    expect(notice.firstElementChild).toHaveClass("bg-popover");
    expect(notice.firstElementChild).not.toHaveClass("backdrop-blur");

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByTestId("mushaf-wird-complete")).not.toBeInTheDocument();
  });

  it("uses semantic dark Mushaf clean chrome with corner controls", async () => {
    setViewport(820, 1180);
    renderReader({ mushafTheme: "dark" });
    const article = await screen.findByRole("article", { name: "صفحة ٤٢" });
    expect(article).toHaveAttribute("data-theme", "dark");
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "clean");
    // Corner controls placed cleanly over the page
    expect(screen.getByTestId("mushaf-more-actions")).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-top-left-back")).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-page-bookmark")).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-difficult-words-switch")).toBeInTheDocument();
    expect(screen.queryByTestId("mushaf-settings-trigger")).not.toBeInTheDocument();
  });

  it("follows the app theme by default", async () => {
    renderReader({ mushafTheme: "follow-app", appTheme: "light" });
    expect(await screen.findByRole("article", { name: "صفحة ٤٢" })).toHaveAttribute("data-theme", "light");
  });

  it("says nothing about a wird when no plan has been chosen", async () => {
    renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});

describe("KhatmahReaderScreen difficult words", () => {
  it("waits for the visible chapter meanings before turning study mode on", async () => {
    let finishMeanings!: (value: { ok: true; json: () => Promise<Record<string, unknown>> }) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (String(input).includes("word-meanings")) {
          return new Promise((resolve) => {
            finishMeanings = resolve;
          });
        }
        const page = Number(String(input).match(/(\d+)\.json(?:\?.*)?$/)?.[1] ?? 1);
        return { ok: true, json: async () => pageFixture(page) };
      }),
    );
    const user = userEvent.setup();
    renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    const toggle = screen.getByRole("switch", { name: "معاني الكلمات" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    finishMeanings({ ok: true, json: async () => ({}) });
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
    expect(toggle).toHaveAttribute("aria-busy", "false");
  });

  it("exposes a switch that reveals the reviewed meanings", async () => {
    const user = userEvent.setup();
    renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    const toggle = screen.getByRole("switch", { name: "معاني الكلمات" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("button", { name: /معنى كلمة/ })).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    const word = await screen.findByRole("button", { name: /معنى كلمة/ });
    await user.click(word);
    const popover = await screen.findByRole("tooltip");
    expect(popover).toHaveTextContent("المعنى");
    expect(popover).toHaveTextContent("آية ٢٥٥");
    expect(popover).toHaveTextContent("مجمع الملك فهد");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("button", { name: /معنى كلمة/ })).not.toBeInTheDocument();
  });
});

describe("KhatmahReaderScreen responsive chrome contract", () => {
  afterEach(() => setViewport(1024, 768));

  it.each([
    [390, 844, false],
    [834, 1112, false],
    [1440, 900, true],
  ] as const)("keeps one full-screen page with appropriate chrome at %i×%i", async (width, height, hasRail) => {
    setViewport(width, height);
    renderReader({ khatmahPage: 50, mushafLayout: "spread" });
    const article = await screen.findByRole("article", { name: "صفحة ٥٠" });
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", hasRail ? "rail" : "clean");
    expect(article.querySelectorAll("[data-mushaf-rendering]")).toHaveLength(1);
    if (hasRail) {
      expect(screen.getByTestId("mushaf-tool-rail")).toHaveAttribute("data-rail-side", "right");
      expect(screen.getByTestId("mushaf-rail-back")).toBeInTheDocument();
      expect(screen.getByTestId("mushaf-rail-page-bookmark")).toBeInTheDocument();
      expect(screen.getByTestId("mushaf-difficult-words-switch")).toBeInTheDocument();
      expect(screen.queryByTestId("mushaf-focus-enter")).not.toBeInTheDocument();
    } else {
      expect(screen.queryByTestId("mushaf-tool-rail")).not.toBeInTheDocument();
      expect(screen.getByTestId("mushaf-top-left-back")).toBeInTheDocument();
      expect(screen.getByTestId("mushaf-more-actions")).toBeInTheDocument();
      expect(screen.getByTestId("mushaf-page-bookmark")).toBeInTheDocument();
      expect(screen.getByTestId("mushaf-difficult-words-switch")).toBeInTheDocument();
    }
  });
});

describe("KhatmahReaderScreen settings menu", () => {
  const resize = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
    window.dispatchEvent(new Event("resize"));
  };

  afterEach(() => resize(1024, 768));

  it("keeps mobile settings contextual and free of the alternate reader", async () => {
    const user = userEvent.setup();
    resize(390, 844);

    renderReader({ language: "en" });

    await screen.findByRole("article", { name: "Page 42" });
    expect(screen.getByRole("switch", { name: "Add to page bookmarks" })).toBeInTheDocument();
    await user.click(screen.getByTestId("mushaf-more-actions"));
    await user.click(await screen.findByTestId("mushaf-quick-settings"));
    // Scoped to the sheet: the quick menu that opened it names some of the same
    // actions, and Vaul keeps its drawer mounted through the close animation.
    const sheet = within(await screen.findByTestId("mushaf-settings-sheet"));

    expect(sheet.queryByText("Page Layout")).not.toBeInTheDocument();
    expect(sheet.queryByText("Comfort reading")).not.toBeInTheDocument();
    expect(sheet.queryByText("Keep controls visible")).not.toBeInTheDocument();
    // Reading settings only. Bookmarking a page is an action and lives in the
    // quick menu that opened this sheet — exercised by the quick-menu test.
    expect(sheet.queryByTestId("mushaf-bookmark-toggle")).not.toBeInTheDocument();
    expect(sheet.queryByTestId("mushaf-focus-mode-action")).not.toBeInTheDocument();
  });
});

describe("KhatmahReaderScreen quick menu", () => {
  afterEach(() => setViewport(1024, 768));

  it("uses the Surah name and printed folio as direct navigation buttons", async () => {
    const user = userEvent.setup();
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr" });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-top-center-index"));
    expect(await screen.findByRole("tab", { name: /Surahs/, selected: true })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(screen.getByTestId("mushaf-furniture-page-btn"));
    expect(await screen.findByRole("tab", { name: "Page", selected: true })).toBeInTheDocument();
  });

  it("keeps duplicated page tools out of the reading-options menu", async () => {
    const user = userEvent.setup();
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr" });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await screen.findByTestId("mushaf-quick-menu");
    expect(screen.queryByTestId("mushaf-quick-index")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mushaf-quick-page-bookmark")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mushaf-quick-word-meanings")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mushaf-quick-focus")).not.toBeInTheDocument();
    expect(screen.getByTestId("mushaf-quick-bookmarks")).toBeInTheDocument();
    expect(screen.getByTestId("mushaf-quick-settings")).toBeInTheDocument();
  });

  it("opens the index straight onto bookmarks when that is what was asked for", async () => {
    const user = userEvent.setup();
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr", mushafBookmarks: [42] });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await user.click(await screen.findByTestId("mushaf-quick-bookmarks"));
    expect(await screen.findByRole("tab", { name: /Bookmarks/, selected: true })).toBeInTheDocument();
  });
});

describe("KhatmahReaderScreen landscape phone", () => {
  afterEach(() => setViewport(1024, 768));

  it("uses clean mode on a phone held sideways, which cannot hold the rail without scrolling it", async () => {
    setViewport(844, 390);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "clean");
  });

  it("uses the rail when a landscape tablet is tall enough to hold it", async () => {
    setViewport(900, 600);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "rail");
    expect(article.querySelectorAll("[data-mushaf-rendering]")).toHaveLength(1);
    expect(screen.getByTestId("mushaf-tool-rail")).toHaveAttribute("data-rail-side", "right");
    expect(screen.getByTestId("mushaf-rail-index")).toHaveTextContent("Al-Baqarah");
  });
});

describe("KhatmahReaderScreen settings presentation", () => {
  afterEach(() => setViewport(1024, 768));

  it("keeps the reading settings in the same sheet on wide screens", async () => {
    const user = userEvent.setup();
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr" });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-settings-trigger"));
    const sheet = await screen.findByTestId("mushaf-settings-sheet");
    expect(sheet).toHaveAttribute("data-side", "right");
  });

  it("keeps the centred sheet where there is no width to dock into", async () => {
    const user = userEvent.setup();
    setViewport(820, 1180);
    renderReader({ language: "en", direction: "ltr" });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await user.click(await screen.findByTestId("mushaf-quick-settings"));
    const sheet = await screen.findByTestId("mushaf-settings-sheet");
    expect(sheet).not.toHaveAttribute("data-side");
  });
});

describe("KhatmahReaderScreen reading type size", () => {
  afterEach(() => setViewport(1024, 768));

  it("says the size cannot change where the line already fills the page width", async () => {
    const user = userEvent.setup();
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr", setMushafTextScale: vi.fn() });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await user.click(await screen.findByTestId("mushaf-quick-settings"));
    const sheet = within(await screen.findByTestId("mushaf-settings-sheet"));

    // A phone page is width-bound: all three steps rendered the identical
    // measure and the identical type, so the control said nothing while doing
    // nothing. It is disabled and explains itself instead.
    expect(sheet.getByTestId("mushaf-text-size-option-large")).toBeDisabled();
    expect(sheet.getByTestId("mushaf-text-size-option-small")).toBeDisabled();
    expect(sheet.getByText(/already as large as this page allows/i)).toBeInTheDocument();
  });

  it("offers the size where the page is fitted to its height instead", async () => {
    const user = userEvent.setup();
    setViewport(834, 1112);
    renderReader({ language: "en", direction: "ltr", setMushafTextScale: vi.fn() });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await user.click(await screen.findByTestId("mushaf-quick-settings"));
    const sheet = within(await screen.findByTestId("mushaf-settings-sheet"));

    expect(sheet.getByTestId("mushaf-text-size-option-large")).toBeEnabled();
    expect(sheet.getByText(/without changing its fifteen lines/i)).toBeInTheDocument();
  });
});

describe("KhatmahReaderScreen wird completion notice", () => {
  const day = getProgressDayKey(new Date(), 4);

  function completedReader(overrides: Partial<Parameters<typeof KhatmahReaderScreen>[0]> = {}) {
    return renderReader({
      language: "en",
      direction: "ltr",
      quranWirdPlan: { kind: "daily", dailyPages: 2 },
      wirdHistory: { [day]: [40, 41] },
      ...overrides,
    });
  }

  it("congratulates the reader once, and records the day so a later visit does not repeat it", async () => {
    const onWirdCompletionAnnounced = vi.fn();
    completedReader({ onWirdCompletionAnnounced });

    expect(await screen.findByTestId("mushaf-wird-complete")).toBeInTheDocument();
    expect(onWirdCompletionAnnounced).toHaveBeenCalledWith(day);
    expect(onWirdCompletionAnnounced).toHaveBeenCalledTimes(1);
  });

  it("stays quiet on a later visit in the same day", async () => {
    // The notice used to live only in component state, so every return to the
    // Mushaf was a fresh mount that congratulated the reader all over again.
    completedReader({ wirdCompletionAnnouncedDayKey: day });
    await screen.findByRole("article", { name: /Page 42/ });
    expect(screen.queryByTestId("mushaf-wird-complete")).not.toBeInTheDocument();
  });
});

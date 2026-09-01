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

  it("uses semantic dark Mushaf chrome and one overflow entry beside the page turn", async () => {
    setViewport(820, 1180);
    renderReader({ mushafTheme: "dark" });
    const article = await screen.findByRole("article", { name: "صفحة ٤٢" });
    expect(article).toHaveAttribute("data-theme", "dark");
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "bars");
    expect(article.querySelector('[data-mushaf-chrome="header"]')).toHaveClass("bg-card", "text-card-foreground");
    // The page number reads the way the rail's does: numeral, then unit, with
    // the total in the accessible name rather than crowding the bar.
    const readout = screen.getByTestId("mushaf-page-readout");
    expect(readout).toHaveTextContent("٤٢");
    expect(readout).toHaveTextContent("صفحة");
    expect(readout).toHaveTextContent("٤٢ من ٦٠٤");
    // One way into the settings, not two pointing at the same sheet.
    expect(screen.getByTestId("mushaf-more-actions")).toBeInTheDocument();
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

describe("KhatmahReaderScreen facing pages", () => {
  const resize = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
  };

  afterEach(() => resize(1024, 768));

  it.each([
    [1, "صفحتا ١ و٢", ["1", "2"]],
    [2, "صفحتا ١ و٢", ["1", "2"]],
    [603, "صفحتا ٦٠٣ و٦٠٤", ["603", "604"]],
    [604, "صفحتا ٦٠٣ و٦٠٤", ["603", "604"]],
  ] as const)("keeps endpoint page %i in its authoritative spread", async (page, label, expectedPages) => {
    resize(1440, 900);
    renderReader({ khatmahPage: page });

    const spread = await screen.findByRole("article", { name: label });
    const canvases = spread.querySelectorAll("[data-mushaf-rendering]");
    expect([...canvases].map((canvas) => canvas.getAttribute("data-mushaf-page"))).toEqual([...expectedPages]);
  });

  it("pairs the odd page on the right whichever half you arrive on", async () => {
    resize(1440, 900);
    renderReader({ khatmahPage: 50 });

    // The Mushaf opens with page 1 on the right, so pairs run (1,2), (3,4)...
    // Arriving on the even half must still show the same spread, not page 50
    // twice — which is what assuming the current page was the right-hand one did.
    const spread = await screen.findByRole("article", { name: "صفحتا ٤٩ و٥٠" });
    const canvases = spread.querySelectorAll("[data-mushaf-rendering]");
    expect([...canvases].map((c) => c.getAttribute("data-mushaf-page"))).toEqual(["49", "50"]);
    expect(spread.querySelector(".mushaf-spread")).toBeInTheDocument();
    expect([...canvases].every((canvas) => canvas.classList.contains("mushaf-spread__page"))).toBe(true);
  });

  it("starts both facing-page loads together instead of waiting on one half", async () => {
    resize(1440, 900);
    const requested: number[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        const page = Number(String(input).match(/(\d+)\.json(?:\?.*)?$/)?.[1] ?? 1);
        requested.push(page);
        await gate;
        return { ok: true, json: async () => pageFixture(page) };
      }),
    );

    renderReader({ khatmahPage: 101 });
    await waitFor(() => expect([...requested].sort((a, b) => a - b)).toEqual([101, 102]));
    release();
    await screen.findByRole("article", { name: "صفحتا ١٠١ و١٠٢" });
  });

  it("shows a single page when the screen has no room for two", async () => {
    resize(820, 1180);
    renderReader({ khatmahPage: 50 });
    await screen.findByRole("article", { name: "صفحة ٥٠" });
  });

  it("never lets a stored spread preference force two pages onto mobile", async () => {
    resize(390, 844);
    renderReader({ khatmahPage: 50, mushafLayout: "spread" });
    const article = await screen.findByRole("article", { name: "صفحة ٥٠" });
    expect(article.querySelectorAll("[data-mushaf-rendering]")).toHaveLength(1);
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

  it("offers facing-page layout only when the desktop can fit it", async () => {
    const user = userEvent.setup();
    const setMushafLayout = vi.fn();
    resize(1440, 900);
    renderReader({ language: "en", direction: "ltr", setMushafLayout });
    await screen.findByRole("article", { name: "Pages 41 and 42" });

    await user.click(screen.getByRole("button", { name: "Settings" }));
    const spreadOption = await screen.findByTestId("mushaf-layout-option-spread");
    await user.click(spreadOption);
    expect(setMushafLayout).toHaveBeenCalledWith("spread");
  });
});

describe("KhatmahReaderScreen tool rail", () => {
  afterEach(() => setViewport(1024, 768));

  it("stands the tools beside the paper on a landscape screen instead of across it", async () => {
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Pages 41 and 42" });

    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "rail");
    expect(screen.getByTestId("mushaf-tool-rail")).toBeInTheDocument();
    // The two horizontal bars are the whole point: they are gone, and the
    // 112px of height they cost goes back to the page.
    expect(article.querySelector('[data-mushaf-chrome="header"]')).toBeNull();
    expect(article.querySelector('[data-mushaf-chrome="footer"]')).toBeNull();
    // Every control the bars carried is still reachable, by the same name.
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Word meanings" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Add to page bookmarks" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("keeps the horizontal bars on a portrait tablet, where width is what is short", async () => {
    setViewport(820, 1180);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });

    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "bars");
    expect(screen.queryByTestId("mushaf-tool-rail")).not.toBeInTheDocument();
    expect(article.querySelector('[data-mushaf-chrome="footer"]')).not.toBeNull();
  });

  it("pins the rail to the stored edge", async () => {
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr", mushafToolbarSide: "left" });
    await screen.findByRole("article", { name: "Pages 41 and 42" });
    expect(screen.getByTestId("mushaf-tool-rail")).toHaveAttribute("data-rail-side", "left");
  });

  it("gives the whole screen to the page in focus mode, and gives the tools back on Escape", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr", onBack });
    await screen.findByRole("article", { name: "Pages 41 and 42" });

    await user.click(screen.getByTestId("mushaf-focus-enter"));
    expect(screen.queryByTestId("mushaf-tool-rail")).not.toBeInTheDocument();
    const handle = screen.getByTestId("mushaf-focus-exit");
    expect(handle).toHaveAccessibleName("Show tools");

    // Escape hands back the tools before it hands back the screen: leaving the
    // Mushaf outright would lose the reader's place to a keypress meant to undo.
    await user.keyboard("{Escape}");
    expect(onBack).not.toHaveBeenCalled();
    expect(screen.getByTestId("mushaf-tool-rail")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("lets each half of a spread name itself, and does not repeat the chrome on a phone", async () => {
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr" });
    const spread = await screen.findByRole("article", { name: "Pages 41 and 42" });
    // The chrome can only ever name one of the two; the paper names both.
    expect(spread.querySelectorAll(".mushaf-page-furniture__folio")).toHaveLength(2);
  });

  it("does not print a second copy of the surah the chrome already carries", async () => {
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });
    expect(article.querySelector(".mushaf-page-furniture__cartouche")).toBeNull();
    expect(article.querySelector(".mushaf-page-frame")).not.toBeNull();
  });
});

describe("KhatmahReaderScreen quick menu", () => {
  afterEach(() => setViewport(1024, 768));

  it("puts the phone's secondary actions one tap behind the header", async () => {
    const user = userEvent.setup();
    const setMushafBookmarks = vi.fn();
    setViewport(390, 844);
    renderReader({ language: "en", direction: "ltr", setMushafBookmarks });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByTestId("mushaf-more-actions"));
    await screen.findByTestId("mushaf-quick-menu");
    await user.click(screen.getByTestId("mushaf-quick-page-bookmark"));
    expect(setMushafBookmarks).toHaveBeenCalledWith([42]);
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

  it("keeps the bars on a phone held sideways, which cannot hold the rail without scrolling it", async () => {
    setViewport(844, 390);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "bars");
  });

  it("takes the rail as soon as a landscape screen is tall enough to show all of it", async () => {
    setViewport(900, 600);
    renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });
    expect(article).toHaveAttribute("data-mushaf-chrome-mode", "rail");
    // Still one page: the spread gate is separate and this screen fails its
    // 1024px width floor.
    expect(article.querySelectorAll("[data-mushaf-rendering]")).toHaveLength(1);
  });
});

describe("KhatmahReaderScreen settings presentation", () => {
  afterEach(() => setViewport(1024, 768));

  it("docks the reading settings beside the paper where the rail is showing", async () => {
    const user = userEvent.setup();
    setViewport(1440, 900);
    renderReader({ language: "en", direction: "ltr" });
    await screen.findByRole("article", { name: "Pages 41 and 42" });

    await user.click(screen.getByTestId("mushaf-settings-trigger"));
    const panel = await screen.findByTestId("mushaf-settings-sheet");
    // Docked to the rail's own edge, held back far enough to leave it visible.
    expect(panel).toHaveAttribute("data-side", "right");
    expect(panel.style.right).toBe("72px");
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

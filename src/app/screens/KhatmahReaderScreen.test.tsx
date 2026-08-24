import { act, render, screen } from "@testing-library/react";
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
      const page = Number(String(input).match(/(\d+)\.json$/)?.[1] ?? 1);
      return { ok: true, json: async () => pageFixture(page) };
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("KhatmahReaderScreen navigation", () => {
  it("turns the way the pages are bound: forward on the left, back on the right", async () => {
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

    // Moving right moves back through a right-to-left book (DEC-094).
    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);

    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);
  });

  it("keeps the physical page-turn contract invariant in an English UI", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });

    expect(article).toHaveAttribute("dir", "rtl");
    const navigation = screen.getByRole("navigation", { name: "Mushaf page navigation" });
    const next = screen.getByRole("button", { name: "Next" });
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(next.compareDocumentPosition(previous) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(navigation.querySelector('[dir="ltr"]')).toBeInTheDocument();

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

  it("shows progress against the goal chosen on the overview", async () => {
    const today = getProgressDayKey();
    renderReader({ quranWirdPlan: { kind: "daily", dailyPages: 4 }, wirdHistory: { [today]: [41, 42] } });
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    const progress = screen.getByRole("progressbar", { name: /أكملت ٢ من ٤/ });
    expect(progress).toHaveAttribute("aria-valuenow", "2");
    expect(progress).toHaveAttribute("aria-valuemax", "4");
  });

  it("uses an opaque completion notice and dismisses it automatically", async () => {
    vi.useFakeTimers();
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

  it("uses semantic dark Mushaf chrome and exposes the desktop key hint", async () => {
    renderReader({ mushafTheme: "dark" });
    const article = await screen.findByRole("article", { name: "صفحة ٤٢" });
    expect(article).toHaveAttribute("data-theme", "dark");
    expect(article.querySelector('[data-mushaf-chrome="header"]')).toHaveClass("bg-card", "text-card-foreground");
    expect(screen.getByText("← / → للتنقل بين الصفحات")).toBeInTheDocument();
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

  it("shows a single page when the screen has no room for two", async () => {
    resize(820, 1180);
    renderReader({ khatmahPage: 50 });
    await screen.findByRole("article", { name: "صفحة ٥٠" });
  });
});

describe("KhatmahReaderScreen settings menu", () => {
  it("exposes controls for layout and visibility", async () => {
    const user = userEvent.setup();
    const setMushafLayout = vi.fn();
    const setMushafKeepControlsVisible = vi.fn();
    const setMushafBookmarks = vi.fn();

    renderReader({
      language: "en",
      setMushafLayout,
      setMushafKeepControlsVisible,
      setMushafBookmarks,
    });

    await screen.findByRole("article", { name: "Page 42" });
    const settingsBtn = screen.getByRole("button", { name: "Settings" });
    await user.click(settingsBtn);

    const layoutRadio = screen.getByRole("menuitemradio", { name: "Two Pages" });
    await user.click(layoutRadio);
    expect(setMushafLayout).toHaveBeenCalledWith("spread");

    await user.click(settingsBtn);
    const pageBookmark = screen.getByRole("menuitemcheckbox", { name: "Bookmark this page" });
    await user.click(pageBookmark);
    expect(setMushafBookmarks).toHaveBeenCalledWith([42]);

    await user.click(settingsBtn);
    const keepVisibleCb = screen.getByRole("menuitemcheckbox", { name: "Keep controls visible" });
    await user.click(keepVisibleCb);
    expect(setMushafKeepControlsVisible).toHaveBeenCalledWith(true);
  });

  it("offers Comfort mode without changing canonical page mode geometry", async () => {
    const user = userEvent.setup();
    const setMushafReadingMode = vi.fn();
    renderReader({ language: "en", direction: "ltr", setMushafReadingMode });
    await screen.findByRole("article", { name: "Page 42" });

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Comfort reading" }));
    expect(setMushafReadingMode).toHaveBeenCalledWith("comfort");
  });
});

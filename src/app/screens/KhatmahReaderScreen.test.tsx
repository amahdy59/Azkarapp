import { act, render, screen, waitFor } from "@testing-library/react";
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
      const page = Number(String(input).match(/(\d+)\.json(?:\?.*)?$/)?.[1] ?? 1);
      return { ok: true, json: async () => pageFixture(page) };
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
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

    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);

    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("keeps the physical page-turn contract invariant in an English UI", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader({ language: "en", direction: "ltr" });
    const article = await screen.findByRole("article", { name: "Page 42" });

    expect(article).toHaveAttribute("dir", "rtl");
    const navigation = screen.getByRole("navigation", { name: "Mushaf page navigation" });
    const next = screen.getByRole("button", { name: "Next" });
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(navigation.querySelector('[dir="rtl"]')).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);
    await user.keyboard("{ArrowLeft}");
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
    await user.keyboard("{ArrowLeft}");
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
    const setMushafBookmarks = vi.fn();
    resize(390, 844);

    renderReader({
      language: "en",
      setMushafBookmarks,
    });

    await screen.findByRole("article", { name: "Page 42" });
    expect(screen.getByRole("button", { name: "Set as reading place" })).toBeInTheDocument();
    const settingsBtn = screen.getByRole("button", { name: "Settings" });
    await user.click(settingsBtn);

    expect(screen.queryByText("Page Layout")).not.toBeInTheDocument();
    expect(screen.queryByText("Comfort reading")).not.toBeInTheDocument();
    expect(screen.queryByText("Keep controls visible")).not.toBeInTheDocument();
    expect(screen.getByText("Add to page bookmarks")).toBeInTheDocument();
    const pageBookmark = screen.getByTestId("mushaf-bookmark-toggle");
    await user.click(pageBookmark);
    expect(setMushafBookmarks).toHaveBeenCalledWith([42]);
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

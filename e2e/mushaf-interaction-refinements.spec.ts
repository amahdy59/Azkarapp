import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";
import { getAzkarForMode } from "../src/app/content/azkar";

test("Mushaf controls stay clear of the paper with safe areas and short windows @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/quran/4");
  const paper = page.locator(".mushaf-paper");
  const header = page.locator(".mushaf-control-band--top");
  const footer = page.locator(".mushaf-control-band--bottom");
  await expect(paper).toBeVisible();
  await page.locator("html").evaluate((node) => {
    node.style.setProperty("--mushaf-safe-top", "48px");
    node.style.setProperty("--mushaf-safe-bottom", "24px");
  });
  await expect(header).toHaveCSS("padding-block-start", "48px");
  await expect(footer).toHaveCSS("padding-block-end", "24px");
  const expectPaperSeparation = async () => {
    const reading = (await paper.boundingBox())!;
    const end = (await footer.boundingBox())!;
    expect(reading.y + reading.height).toBeLessThanOrEqual(end.y + 1);
    if (await header.count()) {
      const start = (await header.boundingBox())!;
      expect(start.y + start.height).toBeLessThanOrEqual(reading.y + 1);
    }
  };
  await expectPaperSeparation();
  await expect(paper.locator("[data-mushaf-column] > div")).toHaveCount(15);
  await page.screenshot({ path: info.outputPath("mushaf-safe-area.png") });
  await page.goto("/#/quran/42");
  await expect(paper.locator('[data-mushaf-page="42"][data-mushaf-rendering="qcf-v2"]')).toBeVisible();
  await expectPaperSeparation();
  await page.setViewportSize({ width: 320, height: 540 });
  await page.locator("html").evaluate((node) => {
    node.style.fontSize = "200%";
  });
  await expectPaperSeparation();
  await paper.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  expect(await paper.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await expectPaperSeparation();
  await paper.click({ position: { x: 150, y: 100 } });
  await expect(page.getByTestId("mushaf-focus-exit")).toBeVisible();
  await expectPaperSeparation();
});

test("short zikr surah fits with basmalah and no decorative title @cross-browser", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", routineModes: { before_sleep: "complete" }, reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  const position = getAzkarForMode("before_sleep", "complete").findIndex(({ id }) => id === "s-hm-99-ikhlas") + 1;
  expect(position).toBeGreaterThan(0);
  await page.goto(`/#/azkar/before-sleep/${position}`);
  const passage = page.getByTestId("canonical-surah-passage");
  await expect(passage).toHaveAccessibleName(/سورة/);
  await expect(passage.getByTestId("quran-basmalah")).toBeVisible();
  await expect(page.getByTestId("quran-surah-header")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  const scroll = page.locator(".reader-text-scroll");
  await expect.poll(() => scroll.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: info.outputPath("short-zikr-surah.png") });
});

async function expectOutwardBack(control: Locator, rightEdge: boolean) {
  await expect(control).toBeVisible();
  const shape = await control.evaluate((node) => {
    const path = node.querySelector("path")!;
    const start = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
    const tip = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!);
    const bounds = node.getBoundingClientRect();
    return { pointsRight: tip.x > start.x, onRight: bounds.left + bounds.width / 2 > innerWidth / 2 };
  });
  expect(shape.pointsRight).toBe(rightEdge);
  expect(shape.onRight).toBe(rightEdge);
  await expect(control.locator("svg")).toHaveCSS("transform", "none");
}

test("Mushaf starts the critical font before page data and never blocks a turn on meanings @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  let releasePage!: () => void;
  let releaseMeanings!: () => void;
  let releaseTurn!: () => void;
  const turnGate = new Promise<void>((resolve) => {
    releaseTurn = resolve;
  });
  const pageGate = new Promise<void>((resolve) => {
    releasePage = resolve;
  });
  const meaningGate = new Promise<void>((resolve) => {
    releaseMeanings = resolve;
  });
  let pageRequested = false;
  let fontRequested = false;
  let meaningsRequested = false;
  let turnRequested = false;
  await page.route("**/data/mushaf/604.json", async (route) => {
    turnRequested = true;
    await turnGate;
    await route.continue();
  });
  await page.route("**/data/mushaf/42.json", async (route) => {
    pageRequested = true;
    await pageGate;
    await route.continue();
  });
  await page.route("**/fonts/qcf-v2/**/p42.woff2", async (route) => {
    fontRequested = true;
    await route.continue();
  });
  await page.route("**/data/word-meanings/114.json", async (route) => {
    meaningsRequested = true;
    await meaningGate;
    await route.continue();
  });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
  });
  try {
    await page.goto("/#/quran/42");
    await expect.poll(() => pageRequested).toBe(true);
    await expect.poll(() => fontRequested).toBe(true);
    releasePage();
    await expect(page.getByRole("article", { name: "Page 42", exact: true })).toBeVisible();
    await page.getByTestId("mushaf-difficult-words-switch").click();
    await expect(page.getByTestId("mushaf-difficult-words-switch")).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("End");
    await expect.poll(() => turnRequested).toBe(true);
    await expect(page.getByRole("article", { name: "Page 42", exact: true })).toBeVisible();
    const releasedAt = Date.now();
    releaseTurn();
    await expect(page.getByRole("article", { name: "Page 604", exact: true })).toBeVisible();
    const turnAfterReleaseMs = Date.now() - releasedAt;
    await expect.poll(() => meaningsRequested).toBe(true);
    await expect(page.getByRole("button", { name: /Meaning of/ })).toHaveCount(0);
    await page.screenshot({ path: info.outputPath("mushaf-page-before-meanings.png"), scale: "css" });
    releaseMeanings();
    await expect(page.getByRole("button", { name: /Meaning of/ }).first()).toBeVisible();
    await info.attach("loading-sequence", {
      body: JSON.stringify({
        fontRequestedWhilePageHeld: fontRequested,
        pageVisibleWhileMeaningsHeld: meaningsRequested,
        page: 604,
        retainedPageDuringTurn: 42,
        controlledBrowserTurnAfterReleaseMs: turnAfterReleaseMs,
      }),
      contentType: "application/json",
    });
  } finally {
    releasePage();
    releaseMeanings();
    releaseTurn();
  }
});

for (const language of ["ar", "en"] as const) {
  test(`Mushaf tools, word dismissal and reversible page colours stay independent in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.route("**/fonts/qcf-v2/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (localStorage.getItem("azkarapp.state.v1")) return;
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", appMaterial: "solid", reduceMotion: true },
          mushafTheme: "light",
          profile: { isGuest: true },
          khatmahPage: 4,
          quranReadingPosition: { page: 4, surahNumber: 2, ayahNumber: 17, juzNumber: 1 },
        }),
      );
    }, language);
    await page.goto("/#/quran-wird");
    await page.getByRole("button", { name: t(language, "mushaf.continueReading") }).click();
    const paper = page.locator(".mushaf-paper");
    const back = page.getByTestId("mushaf-top-left-back");
    await expectOutwardBack(back, language === "ar");
    const initialPage = page.locator("[data-mushaf-page]").first();
    const initialNumber = await initialPage.getAttribute("data-mushaf-page");
    for (let index = 0; index < 3; index++) {
      const box = (await paper.boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(back).toBeHidden();
      await expect(page.getByTestId("mushaf-focus-exit")).toBeVisible();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(back).toBeVisible();
    }
    await page.evaluate(() => {
      const events: unknown[] = [];
      (window as unknown as { mushafGestureEvidence: unknown[] }).mushafGestureEvidence = events;
      for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel", "dragstart"]) {
        document.addEventListener(
          type,
          (event) => {
            const pointer = event as PointerEvent;
            const target = event.target as Element;
            events.push({
              type,
              x: pointer.clientX,
              y: pointer.clientY,
              id: pointer.pointerId,
              button: pointer.button,
              target: target.tagName,
              control: target.closest("button, [role=button]")?.getAttribute("aria-label"),
            });
          },
          true,
        );
      }
    });
    const swipe = async (from: number, to: number) => {
      const box = (await paper.boundingBox())!;
      // Font/engine fitting moves ayah-marker buttons. Start on ordinary
      // paper, since those buttons intentionally own their own gestures.
      const origin = await paper.evaluate((node, ratio) => {
        const bounds = node.getBoundingClientRect();
        for (const offset of [12, bounds.width - 12, bounds.width * 0.4, bounds.width * 0.6]) {
          const x = bounds.x + offset;
          const y = bounds.y + bounds.height * ratio;
          const target = document.elementFromPoint(x, y);
          if (
            target &&
            node.contains(target) &&
            !target.closest("button, a, input, label, select, textarea, [role=switch]")
          )
            return { x, y };
        }
        throw new Error("No ordinary paper target for the colour gesture");
      }, from);
      await page.mouse.move(origin.x, origin.y);
      await page.mouse.down();
      await page.mouse.move(origin.x, origin.y + box.height * (to - from), { steps: 8 });
      await page.mouse.up();
    };
    await swipe(0.65, 0.4);
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", "midnight");
    await expect(back).toBeVisible();
    await swipe(0.4, 0.65);
    await info.attach("colour-gesture-events", {
      body: JSON.stringify(
        await page.evaluate(() => (window as unknown as { mushafGestureEvidence: unknown[] }).mushafGestureEvidence),
      ),
      contentType: "application/json",
    });
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", "light");
    await expect(back).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.themeMode)).toBe(
      "light",
    );
    await page.getByTestId("mushaf-difficult-words-switch").click();
    const word = page.getByRole("button", {
      name: t(language, "mushaf.wordMeaning", { word: "كَصَيِّبٍۢ" }),
      exact: true,
    });
    await word.click();
    const gloss = page.getByTestId("quran-word-popover");
    await expect(gloss).toBeVisible();
    await word.click();
    await expect(gloss).toBeHidden();
    await word.click();
    await page.getByTestId("quran-word-popover-dismiss").click();
    await expect(gloss).toBeHidden();
    await word.click();
    const paperBounds = (await paper.boundingBox())!;
    await page.mouse.click(paperBounds.x + 12, paperBounds.y + paperBounds.height / 2);
    await expect(gloss).toBeHidden();
    await expect(back).toBeVisible();
    await expect(initialPage).toHaveAttribute("data-mushaf-page", initialNumber!);
    await page.getByTestId("mushaf-more-actions").click();
    const quick = page.getByTestId("mushaf-quick-menu");
    const quickBounds = (await quick.boundingBox())!;
    expect(Math.abs(quickBounds.y + quickBounds.height - 844)).toBeLessThan(2);
    await expect(quick.getByTestId("modal-close-button")).toBeVisible();
    await page.getByTestId("quick-theme-follow-app").click();
    await expect(page.getByTestId("quick-theme-follow-app")).toHaveAttribute("aria-checked", "true");
    await page.getByTestId("mushaf-quick-settings").click();
    const settings = page.getByTestId("mushaf-settings-sheet");
    await expect(settings).toBeVisible();
    const bounds = (await settings.boundingBox())!;
    expect(Math.abs(bounds.y + bounds.height - 844)).toBeLessThan(2);
    await expect(settings.getByTestId("modal-close-button")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-testid="mushaf-settings-sheet"]')
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`mushaf-${language}-settings.png`), scale: "css" });
    const colourGestures = settings.getByRole("switch", { name: t(language, "mushaf.colorGestures") });
    await expect(colourGestures).toHaveAttribute("aria-checked", "true");
    await colourGestures.click();
    await expect(colourGestures).toHaveAttribute("aria-checked", "false");
    const guide = settings.locator("summary", { hasText: t(language, "mushaf.gestureGuide") });
    await guide.click();
    await expect(settings.getByText(t(language, "mushaf.gestureGuideBody"))).toBeVisible();
    await page.screenshot({ path: info.outputPath(`mushaf-${language}-optional-gestures.png`), scale: "css" });
    await guide.click();
    await settings.getByTestId("modal-close-button").click();
    await expect(settings).toBeHidden();
    await expect(back).toBeVisible();
    await swipe(0.65, 0.4);
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", "light");
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).mushafColorGestures))
      .toBe(false);
    await page.reload();
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", "light");
    await swipe(0.65, 0.4);
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", "light");
  });

  test(`surah Mushaf back arrow points out of its physical edge in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/azkar/friday-kahf/1");
    await page.getByTestId("reader-mushaf-button").click();
    await expectOutwardBack(page.getByTestId("mushaf-immersive-close"), language === "ar");
    await page.screenshot({ path: info.outputPath(`surah-${language}-outward-back.png`), scale: "css" });
    await page.getByTestId("mushaf-immersive-more").click();
    await page.getByTestId("mushaf-quick-settings").click();
    const settings = page.getByTestId("mushaf-settings-sheet");
    const colourGestures = settings.getByRole("switch", { name: t(language, "mushaf.colorGestures") });
    await colourGestures.click();
    await expect(colourGestures).toHaveAttribute("aria-checked", "false");
    await settings.getByTestId("modal-close-button").click();
    await expect(settings).not.toBeVisible();
    await expect
      .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).mushafColorGestures))
      .toBe(false);
    const paper = page.locator(".mushaf-paper");
    const theme = await page.getByRole("article").first().getAttribute("data-theme");
    const sampleOrigin = () =>
      paper.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        for (const offset of [12, bounds.width - 12, bounds.width * 0.4]) {
          const x = bounds.x + offset,
            y = bounds.y + bounds.height * 0.65;
          const target = document.elementFromPoint(x, y);
          if (target && node.contains(target) && !target.closest("button, [role=button]"))
            return { x, y, height: bounds.height };
        }
        return null;
      });
    // WebKit can keep the exiting modal backdrop above its now-hidden content.
    // Sample actual hit testing after that protected surface releases the paper.
    await expect.poll(sampleOrigin).not.toBeNull();
    const origin = (await sampleOrigin())!;
    await page.mouse.move(origin.x, origin.y);
    await page.mouse.down();
    await page.mouse.move(origin.x, origin.y - origin.height * 0.25, { steps: 8 });
    await page.mouse.up();
    await expect(page.getByRole("article").first()).toHaveAttribute("data-theme", theme!);
  });
}

for (const side of ["left", "right"] as const) {
  test(`Mushaf Back points outward beside the ${side} tool rail @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript((side) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: side === "left" ? "ar" : "en", reduceMotion: true },
          mushafToolbarSide: side,
          profile: { isGuest: true },
        }),
      );
    }, side);
    await page.goto("/#/quran/42");
    const back = page.getByTestId("mushaf-rail-back");
    await expectOutwardBack(back, side === "right");
    const fullscreen = await page.getByTestId("mushaf-fullscreen-toggle").boundingBox();
    expect((await back.boundingBox())!.x > fullscreen!.x).toBe(side === "right");
    await page.screenshot({ path: info.outputPath(`outward-back-${side}.png`), scale: "css" });
  });
}

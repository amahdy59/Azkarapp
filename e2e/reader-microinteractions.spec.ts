import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";

for (const language of ["ar", "en"] as const) {
  test(`only reading text slides between zikr in ${language}, with stable controls and reduced-motion recovery`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: false }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/azkar/morning/2");
    const reader = page.getByTestId("reader-screen");
    const text = page.getByTestId("reading-text-transition");
    const next = page.getByRole("button", { name: language === "ar" ? "التالي" : "Next", exact: true });
    const previous = page.getByRole("button", { name: language === "ar" ? "السابق" : "Prev", exact: true });
    await expect(reader).toHaveAttribute("data-zikr-index", "1");
    const counterBefore = (await page.getByTestId("counter-surface").boundingBox())!;
    const nextBounds = (await next.boundingBox())!;
    const previousBounds = (await previous.boundingBox())!;
    expect(Math.sign(previousBounds.x - nextBounds.x)).toBe(language === "ar" ? 1 : -1);
    // Start sampling before input: under suite load the click and assertion
    // round trips can outlast the short slide we need to observe.
    await text.evaluate((el) => {
      const probe = el as HTMLElement & { slideProbe?: { positions: number[]; frame: number } };
      const sample = { positions: [] as number[], frame: 0 };
      probe.slideProbe = sample;
      const record = () => {
        const child = el.firstElementChild;
        if (child) sample.positions.push(new DOMMatrixReadOnly(getComputedStyle(child).transform).m41);
        sample.frame = requestAnimationFrame(record);
      };
      sample.frame = requestAnimationFrame(record);
    });
    await next.click();
    await expect(reader).toHaveAttribute("data-zikr-index", "2");
    await expect(text).toHaveAttribute("data-direction", language === "ar" ? "-1" : "1");
    await expect
      .poll(() =>
        text.evaluate((el) => {
          const probe = el as HTMLElement & { slideProbe?: { positions: number[]; frame: number } };
          return probe.slideProbe!.positions.some((x) => Math.abs(x) > 1);
        }),
      )
      .toBe(true);
    await expect.poll(() => text.locator(":scope > div").evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await text.evaluate((el) => {
      const probe = el as HTMLElement & { slideProbe?: { positions: number[]; frame: number } };
      const sample = probe.slideProbe!;
      cancelAnimationFrame(sample.frame);
      delete probe.slideProbe;
    });
    const counterAfter = (await page.getByTestId("counter-surface").boundingBox())!;
    expect(Math.abs(counterBefore.y - counterAfter.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(counterBefore.x - counterAfter.x)).toBeLessThanOrEqual(1);
    await expect(next).toBeFocused();
    await previous.click();
    await expect(reader).toHaveAttribute("data-zikr-index", "1");
    await expect(text).toHaveAttribute("data-direction", language === "ar" ? "1" : "-1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await next.click();
    await expect(reader).toHaveAttribute("data-zikr-index", "2");
    await expect.poll(() => text.locator(":scope > div").evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await expect(text.locator("article")).toHaveCount(1);
    await page.screenshot({ path: `output/playwright/review-text-slide-${language}.png` });
  });
}

test("thirty tasbeeh counts survive leaving the collection and reloading", async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true, routineModes: { morning: "complete" } },
        profile: { displayName: "Guest", isGuest: true },
      }),
    );
  });
  const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-91");
  expect(index).toBeGreaterThanOrEqual(0);
  const route = `/#/azkar/morning/${index + 1}`;
  await page.goto(route);
  const counter = page.getByTestId("counter-surface");
  await expect(counter).toHaveAttribute("aria-label", /0 \/ 100$/);
  for (let count = 0; count < 30; count++) await counter.click();
  await expect(counter).toHaveAttribute("aria-label", /30 \/ 100$/);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  // A direct Reader URL can return either to its collection or Home depending
  // on whether the app has established an in-app history entry. The persistent
  // bottom navigation is the stable contract for leaving either destination.
  await page.getByTestId("nav-home").click();
  await expect(page).toHaveURL(/#\/home$/);
  await page.evaluate((hash) => {
    window.location.hash = hash;
  }, route.slice(1));
  await expect(counter).toHaveAttribute("aria-label", /30 \/ 100$/);
  await page.reload();
  await expect(counter).toHaveAttribute("aria-label", /30 \/ 100$/);
  await counter.click();
  await expect(counter).toHaveAttribute("aria-label", /31 \/ 100$/);
});

type ReadingDirection = "ltr" | "rtl";

for (const language of ["ar", "en"] as const) {
  test(`Ayah Al-Kursi title and word toggle share a row in ${language}`, async ({ page }) => {
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", reduceMotion: true, routineModes: { morning: "complete" } },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
    }, language);
    const index = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-75");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/#/azkar/morning/${index + 1}`);
      const heading = page.getByTestId("reader-zikr-title");
      const toggle = page.getByRole("switch", {
        name: language === "ar" ? "كلمات غريبة" : "Rare words",
      });
      await expect(heading).toHaveText(language === "ar" ? "آية الكرسي" : "Ayah Al-Kursi");
      await expect(toggle).toBeVisible();
      const titleBounds = (await heading.boundingBox())!;
      const toggleBounds = (await toggle.boundingBox())!;

      expect(Math.abs(titleBounds.y + titleBounds.height / 2 - toggleBounds.y - toggleBounds.height / 2)).toBeLessThan(
        2,
      );
      expect(toggleBounds.height).toBeGreaterThanOrEqual(44);
      expect(
        titleBounds.x + titleBounds.width <= toggleBounds.x ||
          toggleBounds.x + toggleBounds.width <= titleBounds.x ||
          titleBounds.y + titleBounds.height <= toggleBounds.y,
      ).toBe(true);
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-checked", "true");
      await toggle.press("Space");
      await expect(toggle).toHaveAttribute("aria-checked", "false");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: `output/playwright/reader-title/${language}-${width}.png` });
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const enlargedTitle = page.getByTestId("reader-zikr-title");
    await expect(enlargedTitle).toBeVisible();
    const enlargedToggle = page.getByRole("switch", {
      name: language === "ar" ? "كلمات غريبة" : "Rare words",
    });
    await expect(enlargedToggle).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    // Read both boxes in one browser task so a font/layout update cannot
    // combine the title's old frame with the toggle's new frame.
    const { bounds, titleBounds } = await page.evaluate(() => {
      const title = document.querySelector('[data-testid="reader-zikr-title"]')!;
      const toggle = title.parentElement!.querySelector('[role="switch"]')!;
      return { bounds: toggle.getBoundingClientRect().toJSON(), titleBounds: title.getBoundingClientRect().toJSON() };
    });
    expect(titleBounds.width).toBeGreaterThan(0);
    expect(titleBounds.x).toBeGreaterThanOrEqual(0);
    expect(titleBounds.x + titleBounds.width).toBeLessThanOrEqual(320);
    expect(
      titleBounds.x + titleBounds.width <= bounds.x ||
        bounds.x + bounds.width <= titleBounds.x ||
        titleBounds.y + titleBounds.height <= bounds.y ||
        bounds.y + bounds.height <= titleBounds.y,
    ).toBe(true);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    await page.screenshot({ path: `output/playwright/reader-title/${language}-320-enlarged-title.png` });
    const reading = page.getByRole("region", { name: language === "ar" ? "نص الذكر" : "Zikr reading text" });
    await expect(reading).toBeVisible();
    expect((await reading.boundingBox())!.height).toBeGreaterThanOrEqual(128);
    await reading.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `output/playwright/reader-title/${language}-320-enlarged-reading.png` });
    await reading.focus();
    await reading.press("End");
    await expect
      .poll(() => reading.evaluate((element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 2))
      .toBe(true);
    const count = page.getByTestId("counter-surface");
    await count.scrollIntoViewIfNeeded();
    await expect(count).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `output/playwright/reader-title/${language}-320-enlarged.png` });
  });
}

async function openReturningGuestHome(page: Page, language: "en" | "ar") {
  await page.addInitScript((selectedLanguage) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: selectedLanguage,
          themeMode: "midnight",
          forceRtl: false,
          reduceMotion: true,
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: ["m-hm-77m"], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, language);

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByTestId("nav-azkar").click();
  await expect(page.getByTestId("category-card-morning")).toBeVisible();
}

async function expectFillToStartAt(progress: ReturnType<Page["getByRole"]>, direction: ReadingDirection) {
  await expect(progress).toHaveAttribute("dir", direction);
  // The fill animates in from zero on first paint, so a single sample can
  // catch it mid-transition. Poll until it settles rather than racing it.
  await expect(async () => {
    const trackBox = await progress.boundingBox();
    const fillBox = await progress.locator('[data-slot="progress-fill"]').boundingBox();
    expect(trackBox).not.toBeNull();
    expect(fillBox).not.toBeNull();
    if (!trackBox || !fillBox) return;

    const visibleStart = Math.max(fillBox.x, trackBox.x);
    const visibleEnd = Math.min(fillBox.x + fillBox.width, trackBox.x + trackBox.width);
    const visibleWidth = visibleEnd - visibleStart;
    expect(visibleWidth).toBeGreaterThan(0);
    expect(visibleWidth).toBeLessThan(trackBox.width);
    if (direction === "rtl") {
      expect(Math.abs(visibleEnd - (trackBox.x + trackBox.width))).toBeLessThanOrEqual(1);
    } else {
      expect(Math.abs(visibleStart - trackBox.x)).toBeLessThanOrEqual(1);
    }
  }).toPass();
}

async function openFirstMorningZikr(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });

  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-waking_up").click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

/**
 * Al-Kahf now opens in the Mushaf view, which covers the reader.
 *
 * This covers the reader's own counter and word help, so it steps back to it.
 * The control differs by width: the rail carries it on a landscape screen and
 * the header bar on a narrow one.
 */

test("the Reader counter keeps one rectangular shape across phone, tablet, and desktop", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openFirstMorningZikr(page);

  const counter = page.getByTestId("counter-surface");
  await expect(counter).toHaveAttribute("data-counter-shape", "rectangle");

  for (const viewport of [
    { width: 320, height: 844 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(counter).toBeVisible();
    await expect(async () => {
      const box = await counter.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(Math.round(box.height)).toBe(48);
        expect(box.width).toBeLessThanOrEqual(220);
        expect(box.width).toBeGreaterThanOrEqual(160);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
    }).toPass();
    for (const control of await page.getByTestId("counter-panel").getByRole("button").all()) {
      if (!(await control.isVisible())) continue;
      const bounds = await control.boundingBox();
      expect(bounds?.x).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    }
    await page.screenshot({ path: testInfo.outputPath(`reader-en-${viewport.width}.png`) });
  }
});

test("wide Reader keeps a one-third RTL collection navigator and supports direct jumps", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openReturningGuestHome(page, "ar");
  await page.getByTestId("category-card-morning").click();
  await page.getByTestId("start-session-button").click();

  const navigator = page.getByTestId("reader-collection-navigator");
  const readerCard = page.getByTestId("reader-card");
  await expect(navigator).toBeVisible();
  await expect(navigator).toHaveAccessibleName("عرض جميع الأذكار");

  const [navigatorBox, readerBox] = await Promise.all([navigator.boundingBox(), readerCard.boundingBox()]);
  expect(navigatorBox).not.toBeNull();
  expect(readerBox).not.toBeNull();
  if (navigatorBox && readerBox) {
    const occupiedWidth = navigatorBox.width + readerBox.width;
    expect(navigatorBox.width / occupiedWidth).toBeGreaterThanOrEqual(0.32);
    expect(navigatorBox.width / occupiedWidth).toBeLessThanOrEqual(0.36);
    expect(navigatorBox.x + navigatorBox.width).toBeLessThanOrEqual(readerBox.x);
  }

  const items = navigator.locator("[data-zikr-select]");
  expect(await items.count()).toBeGreaterThan(1);
  await items.nth(1).click();
  await expect(items.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(page).toHaveURL(/\/morning\/2$/);
  await page.screenshot({ path: testInfo.outputPath("reader-ar-desktop.png") });

  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(navigator).toBeHidden();
});

test("Space counts without outlining the full Reader text region", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFirstMorningZikr(page);

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const readingRegion = page.getByRole("region", { name: "Reading text" });
    await expect(readingRegion).toBeVisible();
    await expect(readingRegion).toHaveClass(/reader-text-scroll/);
    await readingRegion.focus();
    await expect(readingRegion).toBeFocused();
    await page.keyboard.press("Space");
    await expect(readingRegion).toBeFocused();
    await expect
      .poll(() => readingRegion.evaluate((element) => window.getComputedStyle(element).outlineStyle))
      .toBe("none");
  }
});

test("desktop and tablet place navigation at the card sides and shortcuts below the counter", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFirstMorningZikr(page);

  const shortcutGuide = page.getByTestId("reader-keyboard-shortcuts");
  const desktopHero = page.getByTestId("reader-desktop-hero");
  await expect(desktopHero.getByTestId("reader-keyboard-shortcuts")).toHaveCount(0);
  await expect(page.getByText("Zikr 1 of 25", { exact: true })).toHaveCount(0);
  // The hero + card treatment now starts at the tablet breakpoint, so 1024px
  // gets the same reader chrome as 1440px rather than the phone layout.
  await expect(desktopHero).toBeVisible();

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    const card = page.getByTestId("reader-card");
    const sideNavigation = card.getByTestId("reader-side-navigation");
    const counter = card.getByTestId("counter-surface");

    await expect(sideNavigation).toBeVisible();
    await expect(sideNavigation.getByRole("button", { name: "Prev", exact: true })).toBeVisible();
    await expect(sideNavigation.getByRole("button", { name: "Next", exact: true })).toBeVisible();
    await expect(card.getByTestId("reader-counter-stack").getByTestId("reader-keyboard-shortcuts")).toBeVisible();
    await expect(shortcutGuide).toHaveAccessibleName("Keyboard shortcuts");
    await expect(counter).toHaveAccessibleName(/Click the dhikr, counter, or press Space to count/);

    const zikrText = card.getByTestId("zikr-text").first();
    const [textBox, navigationBox, counterBox, guideBox] = await Promise.all([
      zikrText.boundingBox(),
      sideNavigation.boundingBox(),
      counter.boundingBox(),
      shortcutGuide.boundingBox(),
    ]);
    expect(textBox).not.toBeNull();
    expect(navigationBox).not.toBeNull();
    expect(counterBox).not.toBeNull();
    expect(guideBox).not.toBeNull();
    if (textBox && navigationBox) {
      expect(
        Math.abs(navigationBox.y + navigationBox.height / 2 - (textBox.y + textBox.height / 2)),
      ).toBeLessThanOrEqual(2);
    }
    if (counterBox && guideBox) expect(guideBox.y - (counterBox.y + counterBox.height)).toBeGreaterThanOrEqual(20);
  }

  await expect(desktopHero).toBeVisible();
  await expect(page.getByTestId("reader-session-chrome")).toHaveCount(0);
  // Page-level actions live in the hero toolbar on this tier, not in a second
  // row under the counter.
  await expect(page.getByTestId("reader-actions")).toHaveCount(0);
  // On counter screens Benefit lives in the bottom dock beside the counter,
  // so the hero toolbar is reduced to the overflow menu only.
  const heroActions = page.getByTestId("reader-hero-actions");
  await expect(heroActions.getByRole("button", { name: "Benefit", exact: true })).toHaveCount(0);
  await expect(heroActions.getByRole("button", { name: "Reader options", exact: true })).toBeVisible();
  await expect(heroActions.getByRole("button")).toHaveCount(1);
  // Benefit is accessible via the dock button.
  await expect(page.getByTestId("reader-benefit-dock-button")).toBeVisible();
  await expect(desktopHero.getByRole("button", { name: "Share zikr", exact: true })).toHaveCount(0);
});

type CompletionCueRecord = {
  seenAt: number | null;
  goneAt: number | null;
  hadCheckIcon: boolean;
  text: string;
  sawLegacyCompleteCopy: boolean;
};

type CueWindow = Window & {
  __completionCue?: CompletionCueRecord;
  __completionCueObserver?: MutationObserver;
};

/**
 * The completion cue is deliberately transient: `useZikrCounter` holds
 * `justCompleted` for COUNTER_ADVANCE_DELAY_MS (500 ms), then swaps the
 * element's test id and advances the zikr, so the cue never comes back.
 * Asserting on it *after* an action therefore races that window — if the
 * machine stalls between the action returning and the locator query, the cue
 * has already gone and a healthy app fails a five-second wait. That is the
 * exact shape of the mobile-chromium failure this helper replaces.
 *
 * So arm a recorder before the action and assert on what it caught. It reads
 * the MutationRecords rather than querying live DOM, because under a hard
 * stall the appearance and the disappearance batch into a single callback and
 * a live query would see only the final, absent state.
 */
async function armCompletionCueRecorder(page: Page) {
  await page.evaluate(() => {
    const cueWindow = window as CueWindow;
    const CUE = '[data-testid="counter-completion-cue"]';
    cueWindow.__completionCueObserver?.disconnect();

    const record: CompletionCueRecord = {
      seenAt: null,
      goneAt: null,
      hadCheckIcon: false,
      text: "",
      sawLegacyCompleteCopy: false,
    };
    cueWindow.__completionCue = record;

    const latchSeen = (element: Element) => {
      if (record.seenAt !== null) return;
      record.seenAt = performance.now();
      record.hadCheckIcon = element.querySelector("svg") !== null;
      record.text = (element.textContent ?? "").trim();
      record.sawLegacyCompleteCopy = (document.body.textContent ?? "").includes("Complete!");
    };
    const latchGone = () => {
      if (record.seenAt !== null && record.goneAt === null) record.goneAt = performance.now();
    };

    const existing = document.querySelector(CUE);
    if (existing) latchSeen(existing);

    const observer = new MutationObserver((records) => {
      for (const entry of records) {
        if (entry.type === "childList") {
          for (const node of entry.addedNodes) {
            if (!(node instanceof Element)) continue;
            const found = node.matches(CUE) ? node : node.querySelector(CUE);
            if (found) latchSeen(found);
          }
        } else if (entry.type === "attributes" && entry.target instanceof Element) {
          if (entry.target.getAttribute("data-testid") === "counter-completion-cue") latchSeen(entry.target);
        }
      }
      // Disappearance is a second pass so an appear-then-vanish batch records
      // both, in order, rather than only whichever mutation came last.
      for (const entry of records) {
        if (entry.type === "attributes" && entry.oldValue === "counter-completion-cue") latchGone();
        if (entry.type !== "childList") continue;
        for (const node of entry.removedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(CUE) || node.querySelector(CUE)) latchGone();
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["data-testid"],
    });
    cueWindow.__completionCueObserver = observer;
  });
}

async function readCompletionCue(page: Page): Promise<CompletionCueRecord | null> {
  return page.evaluate(() => (window as CueWindow).__completionCue ?? null);
}

/** Waits until the recorder has caught the cue, then returns what it caught. */
async function expectCompletionCueSeen(page: Page): Promise<CompletionCueRecord> {
  await expect
    .poll(async () => (await readCompletionCue(page))?.seenAt ?? null, {
      message: "the counter completion cue never appeared",
      timeout: 5000,
    })
    .not.toBeNull();
  return (await readCompletionCue(page))!;
}

test("counter shows a checkmark-only completion for 500 ms and a clear tap-anywhere instruction", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const counterSurface = page.getByTestId("counter-surface");
  const firstZikr = await zikr.textContent();
  expect(firstZikr).toBeTruthy();
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toHaveCount(0);

  await armCompletionCueRecorder(page);
  await counterSurface.click();

  const cue = await expectCompletionCueSeen(page);
  // The check now carries a short text label beside it for non-visual clarity.
  expect(cue.hadCheckIcon).toBe(true);
  expect(cue.text).toBe("Done");
  expect(cue.sawLegacyCompleteCopy).toBe(false);

  await expect(zikr).not.toHaveText(firstZikr!, { timeout: 5000 });

  // Measured in-page between the two mutations rather than as wall clock around
  // the click, so it survives a slow harness and carries no Node/browser clock
  // skew. Only the lower bound is a real contract: the cue must not flash past
  // too quickly to read. A stall can stretch the observed window but never
  // shorten it, so there is deliberately no tight upper bound.
  await expect
    .poll(async () => (await readCompletionCue(page))?.goneAt ?? null, {
      message: "the completion cue never gave way to the next zikr",
      timeout: 5000,
    })
    .not.toBeNull();
  const settled = (await readCompletionCue(page))!;
  expect(settled.goneAt! - settled.seenAt!).toBeGreaterThanOrEqual(300);
});

test("the full reader canvas counts taps while controls and the reference sheet never do", async ({ page }) => {
  await openFirstMorningZikr(page);

  const counterSurface = page.getByTestId("counter-surface");
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Save lives in the overflow menu on every tier now — the header carries
  // only the overflow menu on counter screens (Benefit moved to the dock).
  await expect(page.getByRole("button", { name: "Save zikr", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Save zikr", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.getByTestId("reader-benefit-dock-button").click();
  const sheet = page.getByTestId("reference-sheet");
  await sheet.click();
  await sheet.getByRole("button", { name: "Close benefit", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Chrome outside the reading card does not count: tap the screen's own margin.
  await page.getByTestId("reader-screen").click({ position: { x: 2, y: 2 } });
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Tapping within the reading card counts.
  await armCompletionCueRecorder(page);
  await page.getByTestId("reader-card").click();
  await expectCompletionCueSeen(page);
});

async function openAyatAlKursi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [], friday_kahf: [] },
        sessions: [],
      }),
    );
  });

  await page.goto("/#/azkar/morning/4");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("reader-screen")).toBeVisible();
}

test("short surahs expose sourced difficult-word help", async ({ page }) => {
  await openAyatAlKursi(page);

  await page.getByRole("switch", { name: "Rare words", exact: true }).click();

  const counter = page.getByTestId("counter-surface");

  await expect(counter).toBeVisible();
  await expect(counter).toHaveAccessibleName(/0 \/ 1/);

  const difficultWords = page.getByTestId("quran-word-help");
  expect(await difficultWords.count()).toBeGreaterThan(0);
  await difficultWords.first().click();

  // A tap answers in place, anchored under the word; the full sheet is the
  // deliberate next step behind "All meanings".
  await expect(page.getByTestId("quran-word-popover")).toBeVisible();
  await page.getByTestId("quran-word-popover-all").click();

  const meaningSheet = page.getByTestId("quran-word-meaning-sheet");
  await expect(meaningSheet).toBeVisible();
  const closeMeaning = meaningSheet.getByRole("button", { name: "Close word meaning", exact: true });
  const closeBounds = await closeMeaning.boundingBox();
  expect(closeBounds?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(closeBounds?.height ?? 0).toBeGreaterThanOrEqual(44);
  await expect(meaningSheet.getByRole("link", { name: /Muyassar of Ghareeb Al-Qur'an/ })).toHaveAttribute(
    "href",
    "https://qurancomplex.gov.sa/en/techquran/dev/",
  );
  const accessibility = await new AxeBuilder({ page })
    .include('[data-testid="quran-word-meaning-sheet"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await expect(counter).toHaveAttribute("aria-label", /0 \/ 1/);

  await closeMeaning.click();
  await expect(meaningSheet).toBeHidden();
});

test("reader actions stay inside a 320 px app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openFirstMorningZikr(page);

  // Phone chrome: Benefit moved to the bottom counter dock, so the header
  // row has only the overflow menu. The counter dock hosts Benefit beside
  // the tap target, keeping the reading surface clear.
  await expect(page.getByTestId("reader-actions")).toBeVisible();
  await expect(page.getByTestId("reader-actions").getByRole("button")).toHaveCount(1);
  await expect(page.getByTestId("reader-benefit-dock-button")).toBeVisible();
  await expect(page.getByTestId("nav-azkar")).toHaveCount(0);

  const readerBox = await page.getByTestId("reader-screen").boundingBox();
  const actionBoxes = await Promise.all(
    ["Reader options"].map((name) => page.getByRole("button", { name, exact: true }).boundingBox()),
  );
  // Also check the dock benefit button fits within the reader canvas.
  const dockBenefitBox = await page.getByTestId("reader-benefit-dock-button").boundingBox();
  expect(readerBox).not.toBeNull();
  if (!readerBox) return;

  for (const actionBox of [...actionBoxes, dockBenefitBox]) {
    expect(actionBox).not.toBeNull();
    if (!actionBox) continue;
    expect(actionBox.x).toBeGreaterThanOrEqual(readerBox.x);
    expect(actionBox.x + actionBox.width).toBeLessThanOrEqual(readerBox.x + readerBox.width);
    expect(actionBox.height).toBeGreaterThanOrEqual(44);
  }
});

test("Benefit is reachable via the counter dock on counter screens", async ({ page }) => {
  // On standard counter-based azkar (waking_up), Benefit lives in the
  // counter dock as a round icon button. Its accessible name still reads
  // "Benefit" so keyboard and assistive-technology users are unaffected.
  await page.setViewportSize({ width: 320, height: 700 });
  await openFirstMorningZikr(page);

  const dockButton = page.getByTestId("reader-benefit-dock-button");
  await expect(dockButton).toBeVisible();
  await expect(dockButton).toHaveAttribute("aria-label", "Benefit");
  // Confirm it is NOT also present in the header.
  await expect(page.getByTestId("reader-actions").getByRole("button", { name: "Benefit", exact: true })).toHaveCount(0);

  // Tablet viewport: dock button still present and accessible.
  await page.setViewportSize({ width: 600, height: 800 });
  await expect(dockButton).toBeVisible();
  await expect(dockButton).toHaveAttribute("aria-label", "Benefit");

  // Desktop viewport: dock button visible; hero toolbar has only overflow menu.
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(dockButton).toBeVisible();
  await expect(
    page.getByTestId("reader-hero-actions").getByRole("button", { name: "Benefit", exact: true }),
  ).toHaveCount(0);
});

test("reference sheet matches the approved hierarchy and stays usable on short screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 560 });
  await openFirstMorningZikr(page);

  // Benefit is in the counter dock on counter screens; use its test id.
  const trigger = page.getByTestId("reader-benefit-dock-button");
  await trigger.click();

  const sheet = page.getByTestId("reference-sheet");

  await expect(sheet).toBeVisible();
  // Only the narration and its citation remain.
  await expect(sheet.getByRole("heading", { level: 3 })).toHaveText(["Benefit", "Hadith text", "Source"]);
  await expect(sheet.getByRole("heading", { name: "Translation", exact: true })).toHaveCount(0);
  await expect(sheet.getByRole("heading", { name: "Pronunciation in English", exact: true })).toHaveCount(0);
  await expect(sheet.getByTestId("reference-zikr-label")).toHaveCount(0);
  await expect(sheet.getByTestId("reference-timing")).toHaveCount(0);
  await expect(sheet.getByTestId("reference-hadith-attribution")).toHaveCount(0);
  // Exactly one copy affordance, on the hadith, plus the close control.
  await expect(sheet.getByRole("button", { name: "Copy hadith text", exact: true })).toBeVisible();
  await expect(sheet.getByRole("button")).toHaveCount(2);
  await expect(sheet.getByText("Recommended timing", { exact: true })).toHaveCount(0);
  await expect(sheet.getByText("Authenticity", { exact: true })).toHaveCount(0);
  await expect
    .poll(() => sheet.evaluate((element) => Math.abs(window.innerHeight - element.getBoundingClientRect().bottom)))
    .toBeLessThan(1);

  const dimensions = await sheet.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = element.querySelector<HTMLElement>(".reference-scroll, [data-slot='scroll-area-viewport']");
    return {
      height: bounds.height,
      bottom: bounds.bottom,
      scrollHeight: viewport?.scrollHeight ?? 0,
      clientHeight: viewport?.clientHeight ?? 0,
    };
  });
  expect(dimensions.height).toBeLessThanOrEqual(548.5);
  expect(dimensions.bottom).toBeLessThanOrEqual(561);
  /* This asserted that the narration fits without scrolling, which held only
     while an English reader was shown the Arabic: the reviewed English
     renderings are longer, and on a 560px screen they overflow. What "usable on
     a short screen" means is that the sheet stays inside the viewport — checked
     above — and that everything in it can still be reached, which is the scroll
     area's job. Reachability is asserted instead, and holds whether or not the
     content happens to fit. */
  const scroll = await sheet.evaluate((element) => {
    const viewport = element.querySelector<HTMLElement>(".reference-scroll, [data-slot='scroll-area-viewport']");
    if (!viewport) return null;
    viewport.scrollTop = viewport.scrollHeight;
    return { scrollTop: viewport.scrollTop, end: viewport.scrollHeight - viewport.clientHeight };
  });
  expect(scroll).not.toBeNull();
  expect(scroll?.scrollTop).toBeCloseTo(scroll?.end ?? -1, 0);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("reference sheet rises from the bottom edge of the centered app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openFirstMorningZikr(page);

  // Benefit lives in the counter dock on this screen.
  await page.getByTestId("reader-benefit-dock-button").click();

  const reader = page.getByTestId("reader-screen");
  const sheet = page.getByTestId("reference-sheet");
  await expect(sheet).toBeVisible();
  await expect(async () => {
    const [readerBox, sheetBox] = await Promise.all([reader.boundingBox(), sheet.boundingBox()]);
    expect(readerBox).not.toBeNull();
    expect(sheetBox).not.toBeNull();
    const viewportHeight = page.viewportSize()?.height ?? 1000;
    expect(Math.abs(sheetBox!.y + sheetBox!.height - viewportHeight)).toBeLessThanOrEqual(15);
    expect(Math.abs(sheetBox!.x - readerBox!.x)).toBeLessThanOrEqual(1);
  }).toPass();
});

for (const locale of [
  { language: "en", reference: "Benefit", source: "Source" },
  {
    language: "ar",
    reference: "\u0627\u0644\u0641\u0627\u0626\u062f\u0629",
    source: "\u0627\u0644\u0645\u0635\u062f\u0631",
  },
] as const) {
  test(`${locale.language.toUpperCase()} reference sheet only shows content for its selected language`, async ({
    page,
  }) => {
    await openReturningGuestHome(page, locale.language);
    await page.getByTestId("category-card-morning").click();
    await page.getByTestId("start-session-button").click();
    await page.getByRole("button", { name: locale.reference, exact: true }).click();

    const sheet = page.getByTestId("reference-sheet");
    await expect(sheet.getByRole("heading", { name: locale.source, exact: true })).toBeVisible();

    if (locale.language === "ar") {
      await expect(sheet.locator("[lang='en']")).toHaveCount(0);
      await expect(sheet.locator("[lang='ar']").first()).toBeVisible();
      for (const text of await sheet.locator("[lang='ar']").allTextContents()) {
        expect(text).not.toMatch(/[A-Za-z]/);
      }
    } else {
      /* The hadith used to be the one legitimately Arabic element here: it is
         the narration itself, and no English rendering existed. The morning
         collection is now reviewed in English, so nothing in this sheet is
         Arabic and the narration carries lang="en" — a screen reader must not
         read English prose with an Arabic voice. The fallback still marks an
         untranslated narration lang="ar"; this collection has none left. */
      await expect(sheet.locator("[lang='ar']")).toHaveCount(0);
      await expect(sheet.getByTestId("reference-hadith")).toHaveAttribute("lang", "en");
      await expect(sheet.getByRole("heading", { level: 3 })).toHaveText(["Benefit", "Hadith text", "Source"]);
    }
  });
}

for (const locale of [
  {
    language: "en",
    direction: "ltr",
    backLabel: "Back",
    menuLabel: "Reader options",
  },
  {
    language: "ar",
    direction: "rtl",
    backLabel: "\u0631\u062c\u0648\u0639",
    menuLabel: "\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0642\u0627\u0631\u0626",
  },
] as const) {
  test(`${locale.language.toUpperCase()} category and reader progress begin at the logical start edge`, async ({
    page,
  }) => {
    await openReturningGuestHome(page, locale.language);
    await page.getByTestId("category-card-morning").click();

    const categoryProgress = page.getByRole("progressbar");
    await expect(page.getByTestId("category-overview")).toBeVisible();
    await expectFillToStartAt(categoryProgress, locale.direction);

    await page.getByTestId("start-session-button").click();
    await expect(page.getByTestId("zikr-text")).toBeVisible();

    const readerProgress = page.getByRole("progressbar");
    await expectFillToStartAt(readerProgress, locale.direction);

    const back = page.getByRole("button", { name: locale.backLabel, exact: true });
    const menu = page.getByRole("button", { name: locale.menuLabel, exact: true });
    const backBox = await back.boundingBox();
    const menuBox = await menu.boundingBox();
    expect(backBox).not.toBeNull();
    expect(menuBox).not.toBeNull();
    if (!backBox || !menuBox) return;

    if (locale.direction === "rtl") {
      expect(backBox.x).toBeGreaterThan(menuBox.x);
    } else {
      expect(backBox.x).toBeLessThan(menuBox.x);
    }
  });
}

test("reference dialog traps focus, restores it on close, and closes on Escape", async ({ page }) => {
  // Desktop width so the reference surface renders as a centered dialog.
  await page.setViewportSize({ width: 1110, height: 835 });
  await openFirstMorningZikr(page);

  // Benefit is in the counter dock on this screen; the testid is stable across
  // all viewports and does not depend on the header/hero split.
  const trigger = page.getByTestId("reader-benefit-dock-button");
  await trigger.click();

  const sheet = page.getByTestId("reference-sheet");
  await expect(sheet).toBeVisible();

  // Focus containment: tabbing repeatedly must never escape the dialog. The
  // hand-rolled overlays this replaced had no focus trap at all.
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press("Tab");
    const insideDialog = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="reference-sheet"]');
      return Boolean(dialog && document.activeElement && dialog.contains(document.activeElement));
    });
    expect(insideDialog).toBe(true);
  }

  // Escape dismisses, and focus returns to the control that opened it.
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the counter completes from the keyboard, not only by pointer", async ({ page }) => {
  await openFirstMorningZikr(page);

  const counterSurface = page.getByTestId("counter-surface");
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // The counter is a real button, so it must be reachable and operable without
  // a pointer — tap-anywhere counting is a convenience, not the only path.
  await counterSurface.focus();
  await expect(counterSurface).toBeFocused();
  await armCompletionCueRecorder(page);
  await page.keyboard.press("Enter");

  await expectCompletionCueSeen(page);
});

test("reader progress is announced politely rather than interrupting", async ({ page }) => {
  await openFirstMorningZikr(page);

  // This region carries counting progress and completion. Assertive would cut
  // off whatever the screen reader is currently saying — in a reader, usually
  // the zikr itself.
  const announcer = page.locator('[aria-live][aria-atomic="true"]').first();
  await expect(announcer).toHaveAttribute("aria-live", "polite");
  await expect(page.locator('[aria-live="assertive"]')).toHaveCount(0);
});

test("resetting the counter clears an accidental completion from stored progress", async ({ page }) => {
  await openFirstMorningZikr(page);

  const counterSurface = page.getByTestId("counter-surface");
  const stored = () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem("azkarapp.state.v1");
      return raw ? (JSON.parse(raw).completed?.waking_up ?? []) : [];
    });

  await counterSurface.click();
  await expect.poll(stored).toHaveLength(1);

  // Completing auto-advances, so recovery means stepping back to the zikr that
  // was wrongly marked done and resetting it there.
  await page.waitForTimeout(1200);
  await page.keyboard.press("ArrowLeft");
  await expect(counterSurface).toHaveAttribute("aria-label", /Completed/);

  await page.keyboard.press("r");
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Without clearing the record, isDone would restore the completion on remount.
  await expect.poll(stored).toHaveLength(0);
});

/** The header carries the overflow menu only on counter screens; Benefit moves to the dock. */
function readerHeaderActions(page: Page) {
  // The phone header row and the wide-desktop hero toolbar are the same
  // contract under different test ids; exactly one of them is mounted.
  return page.getByTestId("reader-actions").or(page.getByTestId("reader-hero-actions"));
}

test("the reader header carries exactly one action on counter screens", async ({ page }) => {
  await openFirstMorningZikr(page);

  const actions = readerHeaderActions(page);
  await expect(actions).toBeVisible();
  // Benefit moved to the counter dock, so only the overflow menu remains.
  await expect(actions.getByRole("button")).toHaveCount(1);
  await expect(actions.getByRole("button", { name: "Benefit", exact: true })).toHaveCount(0);
  await expect(actions.getByRole("button", { name: "Reader options", exact: true })).toBeVisible();
  // Benefit is accessible in the dock.
  await expect(page.getByTestId("reader-benefit-dock-button")).toBeVisible();

  // Sharing is visible in the support row, while the header remains compact.
  await expect(page.getByTestId("reader-share-dock-button")).toBeVisible();
  await expect(actions.getByRole("button", { name: "Share zikr", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Save zikr", exact: true })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Share zikr", exact: true })).toHaveCount(0);
});

test("a short zikr gets no heading, because the heading used to repeat it", async ({ page }) => {
  await openFirstMorningZikr(page);

  // The heading is derived from a real surah name only. The first waking-up
  // zikr has none, so nothing should sit between the bar and the canvas.
  await expect(page.getByTestId("reader-zikr-title")).toHaveCount(0);

  const zikr = page.getByTestId("zikr-text");
  await expect(zikr).toBeVisible();
  const body = ((await zikr.textContent()) ?? "").trim();
  expect(body.length).toBeGreaterThan(0);
  // Whatever else is on screen, no element may restate the zikr as a label.
  const restated = await page
    .locator("h1, h2")
    .filter({ hasText: body.slice(0, 24) })
    .count();
  expect(restated, "no heading may repeat the zikr text").toBe(0);
});

test("the reader's text-size control resizes the zikr and never goes below the floor", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const sizePx = async () => Number.parseFloat(await zikr.evaluate((node) => window.getComputedStyle(node).fontSize));

  const measured: Record<string, number> = {};
  for (const step of ["small", "medium", "large"] as const) {
    const sizeButton = page.getByTestId(`reader-text-size-${step}`);
    if (!(await sizeButton.isVisible())) {
      await page.getByRole("button", { name: "Reader options", exact: true }).click();
    }
    await sizeButton.click();
    // The menu writes the one app-wide setting, so the root token moves too.
    await expect
      .poll(async () =>
        page.evaluate(() => window.getComputedStyle(document.documentElement).getPropertyValue("--font-size").trim()),
      )
      .toBe({ small: "14px", medium: "16px", large: "18px" }[step]);
    measured[step] = await sizePx();
  }

  expect(measured.small, "smallest step must stay legible").toBeGreaterThanOrEqual(21.3);
  expect(measured.medium).toBeGreaterThan(measured.small);
  expect(measured.large).toBeGreaterThan(measured.medium);
  const large = page.getByTestId("reader-text-size-large");
  if (!(await large.isVisible())) await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await large.focus();
  // Radix defers roving focus; hold the key through the selection event.
  await page.keyboard.down("ArrowLeft");
  await expect(page.getByTestId("reader-text-size-medium")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--font-size").trim()))
    .toBe("16px");
  await page.keyboard.up("ArrowLeft");
});

test("a highlighted Qur'an word is the same size as the ayah around it", async ({ page }) => {
  await openAyatAlKursi(page);

  await page.getByRole("switch", { name: "Rare words", exact: true }).click();

  const paragraph = page.getByTestId("zikr-text").first();
  await expect(paragraph).toBeVisible();

  const metrics = await paragraph.evaluate((element) => {
    const paragraphStyle = window.getComputedStyle(element);
    // A button does not inherit font-size from its paragraph: the UA sheet
    // gives it a fixed default, so a highlighted word used to render several
    // pixels smaller than the verse it sits in, and the gap widened with the
    // reading-size setting.
    const word = element.querySelector('[data-testid="quran-word-help"]');
    if (!word) return null;
    const wordStyle = window.getComputedStyle(word);
    return {
      paragraphSize: paragraphStyle.fontSize,
      wordSize: wordStyle.fontSize,
      paragraphLeading: paragraphStyle.lineHeight,
      wordLeading: wordStyle.lineHeight,
      wordWeight: wordStyle.fontWeight,
      paragraphWeight: paragraphStyle.fontWeight,
      wordDecoration: wordStyle.textDecorationStyle,
    };
  });

  expect(metrics).not.toBeNull();
  if (!metrics) throw new Error("Expected an annotated Quran word");
  expect(metrics.wordSize).toBe(metrics.paragraphSize);
  expect(metrics.wordLeading).toBe(metrics.paragraphLeading);
  // The current contract uses tint and dotted underline, preserving the
  // surrounding verse weight as well as its size and line spacing.
  expect(metrics.wordWeight).toBe(metrics.paragraphWeight);
  expect(metrics.wordDecoration).toBe("dotted");
});

test("the show all zikr button in reader menu navigates to the category collection view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openReturningGuestHome(page, "ar");

  // On nav-azkar tab, click evening azkar
  await page.getByTestId("category-card-evening").click();
  await page.getByTestId("start-session-button").click();
  await expect(page).toHaveURL(/#\/azkar\/evening\/1$/);

  // Open the 3-dots menu in reader
  await page.getByRole("button", { name: "خيارات القارئ" }).click();

  // Click "عرض جميع الأذكار"
  const viewAllButton = page.getByTestId("reader-view-all-azkar");
  await expect(viewAllButton).toBeVisible();
  await viewAllButton.click();

  // Ensure it navigates to the list of zikr pages (CategoryScreen)
  await expect(page).toHaveURL(/#\/azkar\/evening$/);
  await expect(page.getByTestId("category-overview")).toBeVisible();
  await expect(page.getByTestId("start-session-button")).toBeVisible();
});

test("the show all zikr button navigates to category when reader opened directly without history", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/azkar/evening/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  // Open the 3-dots menu in reader
  await page.getByRole("button", { name: /خيارات القارئ|Reader options/i }).click();

  // Click "عرض جميع الأذكار" / "View All Azkar"
  const viewAllButton = page.getByTestId("reader-view-all-azkar");
  await expect(viewAllButton).toBeVisible();
  await viewAllButton.click();

  // Ensure it navigates to CategoryScreen
  await expect(page).toHaveURL(/#\/azkar\/evening$/);
  await expect(page.getByTestId("category-overview")).toBeVisible();
});

test("mobile reader does not show a dividing border under the header when scrolling reading text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFirstMorningZikr(page);

  const header = page.getByTestId("shared-screen-header");
  await expect(header).toBeVisible();
  await expect(header).not.toHaveAttribute("data-scrolled");
  await expect(header).toHaveClass(/border-transparent/);

  const readingRegion = page.getByRole("region", { name: "Reading text" });
  await expect(readingRegion).toBeVisible();

  await readingRegion.evaluate((element) => {
    element.scrollTop = 80;
    element.dispatchEvent(new Event("scroll"));
  });

  await expect(header).not.toHaveAttribute("data-scrolled");
  await expect(header).toHaveClass(/border-transparent/);
  await expect(header).not.toHaveClass(/border-border/);
});

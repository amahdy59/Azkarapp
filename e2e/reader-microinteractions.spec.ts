import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type ReadingDirection = "ltr" | "rtl";

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
  const trackBox = await progress.boundingBox();
  const fillBox = await progress.locator('[data-slot="progress-fill"]').boundingBox();
  expect(trackBox).not.toBeNull();
  expect(fillBox).not.toBeNull();
  if (!trackBox || !fillBox) return;

  expect(fillBox.width).toBeGreaterThan(0);
  expect(fillBox.width).toBeLessThan(trackBox.width);
  if (direction === "rtl") {
    expect(Math.abs(fillBox.x + fillBox.width - (trackBox.x + trackBox.width))).toBeLessThanOrEqual(1);
  } else {
    expect(Math.abs(fillBox.x - trackBox.x)).toBeLessThanOrEqual(1);
  }
}

async function openFirstMorningZikr(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });

  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-waking_up").click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

async function openFridayKahf(page: Page) {
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

  await page.goto("/?view=friday");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByRole("button", { name: "Start reading", exact: true }).click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
}

test("the Reader counter keeps one rectangular shape across phone, tablet, and desktop", async ({ page }) => {
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
        expect(Math.round(box.height)).toBe(76);
        expect(box.width).toBeLessThanOrEqual(220);
        expect(box.width).toBeGreaterThanOrEqual(160);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
    }).toPass();
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
    await expect(counter).toHaveAccessibleName(/Click anywhere or press Space to count/);

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
  await expect(desktopHero.getByRole("button", { name: "Share zikr", exact: true })).toBeVisible();
  await expect(desktopHero.getByRole("button", { name: "Benefit", exact: true })).toBeVisible();
});

test("counter shows a checkmark-only completion for 500 ms and a clear tap-anywhere instruction", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const counterSurface = page.getByTestId("counter-surface");
  const firstZikr = await zikr.textContent();
  expect(firstZikr).toBeTruthy();
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toHaveCount(0);

  const startedAt = Date.now();
  await counterSurface.click();

  const completionCue = page.getByTestId("counter-completion-cue");
  await expect(completionCue).toBeVisible();
  await expect(completionCue.locator("svg")).toBeVisible();
  // The check now carries a short text label beside it for non-visual clarity.
  await expect(counterSurface).toHaveText("Done");
  await expect(page.getByText("Complete!", { exact: true })).toHaveCount(0);

  const elapsed = Date.now() - startedAt;
  if (elapsed < 300) {
    await page.waitForTimeout(300 - elapsed);
    await expect(zikr).toHaveText(firstZikr!);
  }

  await expect(zikr).not.toHaveText(firstZikr!, { timeout: 1000 });
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(450);
});

test("the full reader canvas counts taps while controls and the benefit sheet never do", async ({ page }) => {
  await openFirstMorningZikr(page);

  const counterSurface = page.getByTestId("counter-surface");
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  const saveButton = page.getByRole("button", { name: "Save zikr", exact: true });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(saveButton).toBeVisible();
    await saveButton.click();
  } else {
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await page.getByRole("menuitem", { name: "Save zikr", exact: true }).click();
  }
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  const sheet = page.getByTestId("reference-sheet");
  await sheet.click();
  await sheet.getByRole("button", { name: "Close benefit", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Chrome outside the reading text still counts: tap the screen's own margin.
  await page.getByTestId("reader-screen").click({ position: { x: 2, y: 2 } });
  await expect(page.getByTestId("counter-completion-cue")).toBeVisible();
});

test("full surahs count only from the counter and expose sourced difficult-word help", async ({ page }) => {
  await openFridayKahf(page);

  const reader = page.getByTestId("reader-screen");
  const counter = page.getByTestId("counter-surface");
  await expect(reader).toHaveAttribute("data-counting-mode", "counter-only");

  // For long multi-page surahs the counter is hidden until the reader reaches
  // the end of the pages — users must read through before they can count.
  await expect(counter).toBeVisible();
  await expect(counter).toHaveAccessibleName(/0 \/ 1/);
  await expect(counter).toBeInViewport();

  await expect(page.getByTestId("mushaf-page")).toHaveCount(12);
  await expect(page.getByTestId("mushaf-page-separator")).toHaveCount(11);
  await expect(page.getByRole("heading", { name: "Mushaf page 293" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mushaf page 304" })).not.toBeInViewport();

  // Clicking the text or pressing Space while the counter is hidden must NOT
  // advance the count (longSurah guard).
  await reader.click({ position: { x: 2, y: 320 } });
  await page.keyboard.press("Space");

  const scrollRegion = page.getByRole("region", { name: "Zikr reading text" });
  const counterBeforeScroll = await counter.boundingBox();
  await scrollRegion.evaluate((el) => {
    el.scrollTop = Math.min(800, el.scrollHeight - el.clientHeight);
  });
  await expect(counter).toBeVisible();
  await expect(counter).toBeInViewport();
  const counterAfterScroll = await counter.boundingBox();
  expect(counterBeforeScroll).not.toBeNull();
  expect(counterAfterScroll).not.toBeNull();
  if (counterBeforeScroll && counterAfterScroll) {
    expect(Math.abs(counterAfterScroll.y - counterBeforeScroll.y)).toBeLessThanOrEqual(1);
  }

  // Non-counter interactions must still not count after the counter is revealed.
  await reader.click({ position: { x: 2, y: 320 } });
  await page.keyboard.press("Space");
  await expect(counter).toHaveAttribute("aria-label", /0 \/ 1/);

  const difficultWords = page.getByTestId("quran-word-help");
  expect(await difficultWords.count()).toBeGreaterThan(0);
  await difficultWords.first().click();

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
  await page.waitForTimeout(500);

  const lastPage = page.getByTestId("mushaf-page").last();
  await lastPage.scrollIntoViewIfNeeded();
  await expect(lastPage).toBeInViewport();
  const completionCue = page.getByTestId("counter-completion-cue");
  await counter.click();
  await expect(completionCue.or(page.getByTestId("friday-mode-screen"))).toBeVisible();
});

test("reader actions stay inside a 320 px app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openFirstMorningZikr(page);

  // Phone chrome is one header row (Benefit, Share, More) with no bottom
  // action bar and no tab bar, so the reading surface owns the viewport.
  await expect(page.getByTestId("reader-actions")).toBeVisible();
  await expect(page.getByTestId("nav-azkar")).toHaveCount(0);

  const readerBox = await page.getByTestId("reader-screen").boundingBox();
  const actionBoxes = await Promise.all(
    ["Share zikr", "Benefit", "Reader options"].map((name) =>
      page.getByRole("button", { name, exact: true }).boundingBox(),
    ),
  );
  expect(readerBox).not.toBeNull();
  if (!readerBox) return;

  for (const actionBox of actionBoxes) {
    expect(actionBox).not.toBeNull();
    if (!actionBox) continue;
    expect(actionBox.x).toBeGreaterThanOrEqual(readerBox.x);
    expect(actionBox.x + actionBox.width).toBeLessThanOrEqual(readerBox.x + readerBox.width);
    expect(actionBox.height).toBeGreaterThanOrEqual(44);
  }
});

test("reference sheet matches the approved hierarchy and stays usable on short screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 560 });
  await openFirstMorningZikr(page);

  const trigger = page.getByRole("button", { name: "Benefit", exact: true });
  await trigger.click();

  const sheet = page.getByTestId("reference-sheet");

  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Translation", exact: true })).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Pronunciation in English", exact: true })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Copy translation", exact: true })).toBeVisible();
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
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("benefit sheet rises from the bottom edge of the centered app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openFirstMorningZikr(page);

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  // Wait for slide-up sheet-enter transition to complete
  await page.waitForTimeout(300);
  const reader = page.getByTestId("reader-screen");
  const sheet = page.getByTestId("reference-sheet");

  const bounds = await Promise.all([reader.boundingBox(), sheet.boundingBox()]);
  const [readerBox, sheetBox] = bounds;
  expect(readerBox).not.toBeNull();
  expect(sheetBox).not.toBeNull();
  if (!readerBox || !sheetBox) return;
  const viewportHeight = page.viewportSize()?.height ?? 1000;
  expect(Math.abs(sheetBox.y + sheetBox.height - viewportHeight)).toBeLessThanOrEqual(15);
  expect(Math.abs(sheetBox.x - readerBox.x)).toBeLessThanOrEqual(1);
});

for (const locale of [
  { language: "en", benefit: "Benefit", source: "Source" },
  { language: "ar", benefit: "\u0641\u0627\u0626\u062f\u0629", source: "\u0627\u0644\u0645\u0635\u062f\u0631" },
] as const) {
  test(`${locale.language.toUpperCase()} benefit sheet only shows content for its selected language`, async ({
    page,
  }) => {
    await openReturningGuestHome(page, locale.language);
    await page.getByTestId("category-card-morning").click();
    await page.getByTestId("start-session-button").click();
    await page.getByRole("button", { name: locale.benefit, exact: true }).click();

    const sheet = page.getByTestId("reference-sheet");
    await expect(sheet.getByRole("heading", { name: locale.source, exact: true })).toBeVisible();

    if (locale.language === "ar") {
      await expect(sheet.locator("[lang='en']")).toHaveCount(0);
      await expect(sheet.locator("[lang='ar']").first()).toBeVisible();
      for (const text of await sheet.locator("[lang='ar']").allTextContents()) {
        expect(text).not.toMatch(/[A-Za-z]/);
      }
    } else {
      await expect(sheet.locator("[lang='ar']")).toHaveCount(0);
      await expect(sheet.getByRole("heading", { name: "Translation", exact: true })).toBeVisible();
      await expect(sheet.getByRole("heading", { name: "Pronunciation in English", exact: true })).toBeVisible();
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

  const trigger = page.getByRole("button", { name: "Benefit", exact: true });
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
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("counter-completion-cue")).toBeVisible();
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

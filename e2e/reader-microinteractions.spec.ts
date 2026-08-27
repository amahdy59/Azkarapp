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
  // The fill animates in from zero on first paint, so a single sample can
  // catch it mid-transition. Poll until it settles rather than racing it.
  await expect(async () => {
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
  }).toPass();
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
  // Two actions, the same pair as on phones: Reference and the overflow menu.
  // Save, share and sound used to sit out here as three more icons.
  const heroActions = page.getByTestId("reader-hero-actions");
  await expect(heroActions.getByRole("button", { name: "Reference", exact: true })).toBeVisible();
  await expect(heroActions.getByRole("button", { name: "Reader options", exact: true })).toBeVisible();
  await expect(heroActions.getByRole("button")).toHaveCount(2);
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

  // Save lives in the overflow menu on every tier now — the header carries at
  // most two actions, Reference and the menu, so there is no width branch.
  await expect(page.getByRole("button", { name: "Save zikr", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await page.getByRole("menuitem", { name: "Save zikr", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.getByRole("button", { name: "Reference", exact: true }).click();
  const sheet = page.getByTestId("reference-sheet");
  await sheet.click();
  await sheet.getByRole("button", { name: "Close reference", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  // Chrome outside the reading text still counts: tap the screen's own margin.
  await armCompletionCueRecorder(page);
  await page.getByTestId("reader-screen").click({ position: { x: 2, y: 2 } });
  await expectCompletionCueSeen(page);
});

test("full surahs count only from the counter and expose sourced difficult-word help", async ({ page }) => {
  await openFridayKahf(page);

  const reader = page.getByTestId("reader-screen");
  const counter = page.getByTestId("counter-surface");
  await expect(reader).toHaveAttribute("data-counting-mode", "counter-only");

  await expect(counter).toBeVisible();
  await expect(counter).toHaveAccessibleName(/0 \/ 1/);
  await expect(counter).toBeInViewport();
  await expect(page.getByTestId("reader-mushaf-button")).toBeVisible();

  // Clicking the text or pressing Space while in counter-only mode must NOT
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

  // Non-counter interactions must still not count.
  await reader.click({ position: { x: 2, y: 320 } });
  await page.keyboard.press("Space");
  await expect(counter).toHaveAttribute("aria-label", /0 \/ 1/);

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
  await page.waitForTimeout(500);

  await armCompletionCueRecorder(page);
  await counter.click();
  // A full surah either completes in place or hands straight back to Friday
  // mode. Both remain acceptable; the recorder just removes the race on the
  // first, which the previous `.or()` masked rather than fixed.
  await expect
    .poll(
      async () =>
        ((await readCompletionCue(page))?.seenAt ?? null) !== null ||
        (await page.getByTestId("friday-mode-screen").isVisible()),
      {
        message: "neither the completion cue nor the Friday mode screen appeared",
        timeout: 5000,
      },
    )
    .toBe(true);
});

test("reader actions stay inside a 320 px app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openFirstMorningZikr(page);

  // Phone chrome is one header row (Reference, More) with no bottom action bar
  // and no tab bar, so the reading surface owns the viewport. Share moved into
  // the menu: at 320px a third 44px target was the difference between the
  // collection name fitting and being truncated.
  await expect(page.getByTestId("reader-actions")).toBeVisible();
  await expect(page.getByTestId("reader-actions").getByRole("button")).toHaveCount(2);
  await expect(page.getByTestId("nav-azkar")).toHaveCount(0);

  const readerBox = await page.getByTestId("reader-screen").boundingBox();
  const actionBoxes = await Promise.all(
    ["Reference", "Reader options"].map((name) => page.getByRole("button", { name, exact: true }).boundingBox()),
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

  const trigger = page.getByRole("button", { name: "Reference", exact: true });
  await trigger.click();

  const sheet = page.getByTestId("reference-sheet");

  await expect(sheet).toBeVisible();
  // Only the narration and its citation remain.
  await expect(sheet.getByRole("heading", { level: 3 })).toHaveText(["Hadith text", "Source"]);
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
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 1);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

test("reference sheet rises from the bottom edge of the centered app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openFirstMorningZikr(page);

  await page.getByRole("button", { name: "Reference", exact: true }).click();
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
  { language: "en", reference: "Reference", source: "Source" },
  { language: "ar", reference: "\u0627\u0644\u062f\u0644\u064a\u0644", source: "\u0627\u0644\u0645\u0635\u062f\u0631" },
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
      // The hadith is the one legitimately Arabic element in English mode — it
      // is the narration itself, so it keeps lang="ar" for screen readers.
      // Everything else must stay English.
      const arabic = sheet.locator("[lang='ar']");
      await expect(arabic).toHaveCount(1);
      await expect(arabic).toHaveAttribute("data-testid", "reference-hadith");
      await expect(sheet.getByRole("heading", { level: 3 })).toHaveText(["Hadith text", "Source"]);
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

  const trigger = page.getByRole("button", { name: "Reference", exact: true });
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

/** The header carries the Reference button and the overflow menu, nothing else. */
function readerHeaderActions(page: Page) {
  // The phone header row and the wide-desktop hero toolbar are the same
  // contract under different test ids; exactly one of them is mounted.
  return page.getByTestId("reader-actions").or(page.getByTestId("reader-hero-actions"));
}

test("the reader header carries exactly two actions on every tier", async ({ page }) => {
  await openFirstMorningZikr(page);

  const actions = readerHeaderActions(page);
  await expect(actions).toBeVisible();
  await expect(actions.getByRole("button")).toHaveCount(2);
  await expect(actions.getByRole("button", { name: "Reference", exact: true })).toBeVisible();
  await expect(actions.getByRole("button", { name: "Reader options", exact: true })).toBeVisible();

  // The three that moved are reachable, just not as header chrome.
  await expect(page.getByRole("button", { name: "Share zikr", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  for (const name of ["Save zikr", "Share zikr"]) {
    await expect(page.getByRole("menuitem", { name, exact: true })).toBeVisible();
  }
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
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await page.getByTestId(`reader-text-size-${step}`).click();
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
});

test("a highlighted Qur'an word is the same size as the ayah around it", async ({ page }) => {
  await openFridayKahf(page);

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
    };
  });

  if (!metrics) return;
  expect(metrics.wordSize).toBe(metrics.paragraphSize);
  expect(metrics.wordLeading).toBe(metrics.paragraphLeading);
  // The highlight is still carried by weight and colour, not by size.
  expect(Number(metrics.wordWeight)).toBeGreaterThan(500);
});

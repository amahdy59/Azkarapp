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
        completed: { morning: [0], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, language);

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
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
  await page.getByRole("button", { name: /Morning Azkar, \d+ of \d+/ }).click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

test("counter shows a checkmark-only completion for 500 ms and a clear tap-anywhere instruction", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const counterSurface = page.getByTestId("counter-surface");
  const firstZikr = await zikr.textContent();
  expect(firstZikr).toBeTruthy();
  await expect(counterSurface.getByText("Tap anywhere to count", { exact: true })).toBeVisible();
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toHaveCount(0);

  const startedAt = Date.now();
  await counterSurface.click();

  const completionCue = page.getByTestId("counter-completion-cue");
  await expect(completionCue).toBeVisible();
  await expect(completionCue.locator("svg")).toBeVisible();
  await expect(counterSurface).toHaveText("");
  await expect(page.getByText("Complete!", { exact: true })).toHaveCount(0);

  const elapsed = Date.now() - startedAt;
  if (elapsed < 300) {
    await page.waitForTimeout(300 - elapsed);
    await expect(zikr).toHaveText(firstZikr!);
  }

  await expect(zikr).not.toHaveText(firstZikr!, { timeout: 1000 });
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(450);
  await expect(counterSurface.getByText("Tap anywhere to count", { exact: true })).toBeVisible();
});

test("the full reader canvas counts taps while controls and the benefit sheet never do", async ({ page }) => {
  await openFirstMorningZikr(page);

  const counterSurface = page.getByTestId("counter-surface");
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.getByRole("button", { name: "Save zikr", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  const sheet = page.getByTestId("reference-sheet");
  await sheet.getByText("Included as the opening item of the morning/evening chapter.", { exact: true }).click();
  await sheet.getByRole("button", { name: "Close benefit", exact: true }).click();
  await expect(counterSurface).toHaveAttribute("aria-label", /0 \/ 1$/);

  await page.locator("footer").click({ position: { x: 2, y: 2 } });
  await expect(page.getByTestId("counter-completion-cue")).toBeVisible();
});

test("reader actions stay inside a 320 px app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await openFirstMorningZikr(page);

  const readerBox = await page.getByTestId("reader-screen").boundingBox();
  const actionBoxes = await Promise.all(
    ["Share zikr", "Benefit", "Save zikr"].map((name) => page.getByRole("button", { name, exact: true }).boundingBox()),
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
  const close = sheet.getByRole("button", { name: "Close benefit", exact: true });
  await expect(sheet).toBeVisible();
  await expect(close).toBeFocused();
  await expect(sheet.getByRole("heading", { name: "Translation", exact: true })).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Pronunciation in English", exact: true })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Copy translation", exact: true })).toBeVisible();
  await expect(sheet.getByText("Recommended timing", { exact: true })).toHaveCount(0);
  await expect(sheet.getByText("Authenticity", { exact: true })).toHaveCount(0);
  await expect
    .poll(() => sheet.evaluate((element) => Math.abs(window.innerHeight - element.getBoundingClientRect().bottom)))
    .toBeLessThan(0.5);

  const dimensions = await sheet.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = element.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    return {
      height: bounds.height,
      bottom: bounds.bottom,
      scrollHeight: viewport?.scrollHeight ?? 0,
      clientHeight: viewport?.clientHeight ?? 0,
    };
  });
  expect(dimensions.height).toBeLessThanOrEqual(548.5);
  expect(dimensions.bottom).toBeLessThanOrEqual(560.5);
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("benefit sheet rises from the bottom edge of the centered app canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 1000 });
  await openFirstMorningZikr(page);

  await page.getByRole("button", { name: "Benefit", exact: true }).click();
  const layer = page.getByTestId("reference-sheet-layer");
  const reader = page.getByTestId("reader-screen");
  const sheet = page.getByTestId("reference-sheet");

  const bounds = await Promise.all([layer.boundingBox(), reader.boundingBox(), sheet.boundingBox()]);
  const [layerBox, readerBox, sheetBox] = bounds;
  expect(layerBox).not.toBeNull();
  expect(readerBox).not.toBeNull();
  expect(sheetBox).not.toBeNull();
  if (!layerBox || !readerBox || !sheetBox) return;

  expect(Math.abs(layerBox.x - readerBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(layerBox.y - readerBox.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(layerBox.width - readerBox.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layerBox.height - readerBox.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(sheetBox.y + sheetBox.height - (readerBox.y + readerBox.height))).toBeLessThanOrEqual(1);
  expect(sheetBox.y + sheetBox.height).toBeLessThan(1000);
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
    await page.locator(`button:has([lang='${locale.language}'])`).first().click();
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

    await page.locator(`button:has([lang='${locale.language}'])`).first().click();
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

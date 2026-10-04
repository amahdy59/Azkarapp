import { getAzkarForMode } from "../src/app/content/azkar";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openSharing(page: Page, language = "ar", route = "morning", recoverFit = false) {
  await page.addInitScript(
    ({ language }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            reduceMotion: true,
            routineModes: { morning: "complete", evening: "complete", before_sleep: "complete" },
          },
          profile: { displayName: "Guest", isGuest: true },
        }),
      );
      const original = CanvasRenderingContext2D.prototype.fillText;
      const originalRect = CanvasRenderingContext2D.prototype.roundRect;
      const artwork = new WeakMap<
        CanvasRenderingContext2D,
        { brandBottom?: number; wordmarkBottom?: number; panelBottom: number }
      >();
      const artworkChecks: { kind: string; clearance: number }[] = [];
      (window as unknown as { artworkChecks: unknown[] }).artworkChecks = artworkChecks;
      const pills = new WeakMap<
        CanvasRenderingContext2D,
        { top: number; height: number; centered?: number; gap?: number }
      >();
      const pillEvidence: { top: number; height: number; centered?: number; gap?: number }[] = [];
      (window as unknown as { pillEvidence: unknown[] }).pillEvidence = pillEvidence;
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radii) {
        if (this.canvas.width === 1080 && width === 952) {
          const bounds = artwork.get(this) ?? { panelBottom: 0 };
          bounds.panelBottom = Math.max(bounds.panelBottom, y + height);
          artwork.set(this, bounds);
        }
        if (this.canvas.width === 1080 && height === 50) {
          const pill = { top: y, height };
          pills.set(this, pill);
          pillEvidence.push(pill);
        }
        return originalRect.call(this, x, y, width, height, radii);
      };
      (window as unknown as { shareMeasurements: unknown[] }).shareMeasurements = [];
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
        if (this.canvas.width === 1080) {
          const bounds = this.measureText(text);
          const state = artwork.get(this) ?? { panelBottom: 0 };
          if (text === "وَذَكِّرْ") state.wordmarkBottom = y + bounds.actualBoundingBoxDescent;
          if (text === "WA ZAKER") {
            artworkChecks.push({
              kind: "wordmark",
              clearance: y - bounds.actualBoundingBoxAscent - state.wordmarkBottom!,
            });
            state.brandBottom = y + bounds.actualBoundingBoxDescent;
          } else if (state.brandBottom !== undefined && state.panelBottom === 0 && /(?:52|60)px/u.test(this.font)) {
            artworkChecks.push({ kind: "header", clearance: y - bounds.actualBoundingBoxAscent - state.brandBottom });
            state.brandBottom = undefined;
          }
          if (text === "wa-zaker.com" || /^(?:Card |بطاقة )/u.test(text))
            artworkChecks.push({ kind: "footer", clearance: y - bounds.actualBoundingBoxAscent - state.panelBottom });
          artwork.set(this, state);
        }
        const pill = pills.get(this);
        if (pill) {
          const bounds = this.measureText(text);
          if (/30px/u.test(this.font) && /^(?:التكرار|Repeat)/u.test(text)) {
            pill.centered = y + (bounds.actualBoundingBoxDescent - bounds.actualBoundingBoxAscent) / 2;
          } else if (pill.centered !== undefined && pill.gap === undefined && /(?:28|52|64)px/u.test(this.font)) {
            pill.gap = y - bounds.actualBoundingBoxAscent - (pill.top + pill.height);
          }
        }
        if (this.canvas.width === 1080 && /(?:52|64)px/u.test(this.font)) {
          const bounds = this.measureText(text);
          (window as unknown as { shareMeasurements: unknown[] }).shareMeasurements.push({
            text,
            x,
            y,
            width: bounds.width,
            descent: bounds.actualBoundingBoxDescent,
            direction: this.direction,
            alignment: this.textAlign,
            canvasHeight: this.canvas.height,
          });
        }
        if (maxWidth === undefined) original.call(this, text, x, y);
        else original.call(this, text, x, y, maxWidth);
      };
    },
    { language },
  );
  await page.goto(`./#/azkar/${route}`);
  await page.getByTestId("share-collection-button").click();
  const modal = page.getByTestId("collection-share-modal");
  if (recoverFit) {
    await expect(modal.getByRole("img").first().or(modal.getByRole("alert")).first()).toBeVisible();
    if (await modal.getByRole("alert").isVisible())
      await modal
        .getByRole("button", {
          name: language === "ar" ? "استخدام صورة قراءة طويلة" : "Use Tall reading image",
          exact: true,
        })
        .click();
  }
  await expect(modal.getByRole("img").first()).toBeVisible();
  return modal;
}

async function revealImageSettings(modal: ReturnType<Page["getByTestId"]>, language = "en") {
  const details = modal
    .getByText(language === "ar" ? "إعدادات الصورة" : "Image settings", { exact: true })
    .locator("xpath=ancestor::details[1]");
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await details.locator("summary").click();
  }
}

for (const language of ["ar", "en"] as const) {
  test(`sharing choice marks stay right-aligned and labels remain stable in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    // A smaller multi-card collection keeps this geometry regression focused;
    // the corpus/export tests below retain the complete morning collection.
    const modal = await openSharing(page, language, "before-sleep", true);
    await expect(
      modal.getByText(language === "ar" ? "جارٍ تجهيز بقية البطاقات…" : "Preparing the remaining cards…"),
    ).toHaveCount(0);
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      // matchMedia-driven React state can settle after WebKit's viewport promise.
      await expect
        .poll(() =>
          modal
            .getByTestId("sharing-preview")
            .evaluate((element) => Boolean((element.parentElement as HTMLElement).style.gridTemplateColumns)),
        )
        .toBe(width >= 900);
      await revealImageSettings(modal, language);
      for (const name of language === "ar"
        ? ["صورة", "هذه البطاقة", "بنفسجي · ليلي"]
        : ["Image", "This card", "Lavender · Night"]) {
        const choice = modal.getByRole("button", { name, exact: true });
        await choice.scrollIntoViewIfNeeded();
        const marker = (await choice.locator('svg[aria-hidden="true"]').boundingBox())!;
        const label = (await choice.locator('span[dir="auto"]').boundingBox())!;
        expect(marker.x).toBeGreaterThanOrEqual(label.x + label.width - 1);
        expect(Math.abs(marker.y + marker.height / 2 - (label.y + label.height / 2))).toBeLessThan(1);
        await expect(choice).toHaveClass(/border-primary/u);
        expect(await choice.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      }
    }
    const method = modal.getByRole("group", {
      name: language === "ar" ? "طريقة المشاركة" : "Sharing method",
      exact: true,
    });
    const text = method.getByRole("button", { name: language === "ar" ? "نص" : "Text", exact: true });
    await text.scrollIntoViewIfNeeded();
    const labelOffset = () =>
      text.evaluate((element) => {
        const label = element.querySelector('span[dir="auto"]')!.getBoundingClientRect();
        const button = element.getBoundingClientRect();
        return { x: label.x - button.x, y: label.y - button.y };
      });
    const before = await labelOffset();
    await expect(text.locator('svg[aria-hidden="true"]')).toBeHidden();
    await text.click();
    const after = await labelOffset();
    // Read both rectangles atomically: changing mode can recenter the shorter dialog.
    expect(after.x).toBeCloseTo(before.x, 1);
    expect(after.y).toBeCloseTo(before.y, 1);
    await expect(text.locator('svg[aria-hidden="true"]')).toBeVisible();
    await modal.getByRole("button", { name: language === "ar" ? "صورة" : "Image", exact: true }).click();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    for (const choice of await method.getByRole("button").all())
      expect(await choice.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await modal.getByTestId("sharing-scroll").evaluate((element) => {
      element.scrollTop = 0;
    });
    await page.screenshot({ path: testInfo.outputPath(`sharing-selection-${language}-200percent.png`) });
  });
}

test("sharing layout mirrors wide previews and keeps mobile recovery and focus reachable @cross-browser", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const modal = await openSharing(page, "ar", "before-sleep", true);
  await expect(modal.getByText("جارٍ تجهيز بقية البطاقات…")).toHaveCount(0);
  const preview = modal.getByTestId("sharing-preview");
  const settings = modal.getByTestId("sharing-settings");
  const previewBox = (await preview.boundingBox())!;
  const settingsBox = (await settings.boundingBox())!;
  expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(settingsBox.x);
  await revealImageSettings(modal, "ar");
  await modal.getByRole("combobox", { name: "مقاس الصورة" }).click();
  const unavailable = page.getByRole("option", { name: "مربع · ١:١", exact: true });
  await expect(unavailable).toBeDisabled();
  await expect(unavailable).toContainText("غير متاح: لا يتسع للنص الكامل والإضافات.");
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("combobox", { name: "مقاس الصورة" })).toBeFocused();
  await modal.getByRole("combobox", { name: "مقاس الصورة" }).scrollIntoViewIfNeeded();
  const fieldBox = (await modal.getByRole("combobox", { name: "مقاس الصورة" }).boundingBox())!;
  expect(fieldBox.y + fieldBox.height).toBeLessThanOrEqual(
    (await modal.getByTestId("sharing-actions").boundingBox())!.y,
  );
  await modal.getByTestId("sharing-scroll").evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-desktop-settings-ar.png") });

  await page.setViewportSize({ width: 320, height: 700 });
  await modal.getByRole("button", { name: "تكبير المعاينة", exact: true }).first().click();
  await expect(modal.getByRole("button", { name: "تصغير المعاينة", exact: true }).first()).toBeVisible();
  await expect(modal.getByTestId("modal-close-button")).toBeVisible();
  await modal.getByRole("button", { name: "تصغير المعاينة", exact: true }).first().click();
  const mobilePreview = (await preview.boundingBox())!;
  const mobileSettings = (await settings.boundingBox())!;
  expect(mobileSettings.y).toBeGreaterThanOrEqual(mobilePreview.y + mobilePreview.height);
  await modal.getByTestId("sharing-scroll").evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-phone-ar.png") });
  await page.setViewportSize({ width: 568, height: 320 });
  await expect(modal.getByTestId("modal-close-button")).toBeVisible();
  const footer = (await modal.getByTestId("sharing-actions").boundingBox())!;
  expect(footer.y + footer.height).toBeLessThanOrEqual(320);
  expect(await modal.getByTestId("sharing-scroll").evaluate((element) => element.clientHeight)).toBeGreaterThan(0);
});

test("sharing preview supports readable Arabic, sources and accessible controls @cross-browser", async ({
  page,
}, testInfo) => {
  const modal = await openSharing(page);
  await expect(modal.getByText("جارٍ تجهيز بقية البطاقات…")).toHaveCount(0);
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("olive-collection.png"));
  await modal.getByText("قراءة نص هذه البطاقة", { exact: true }).click();
  await expect(modal.locator('[lang="ar"][dir="rtl"]')).not.toHaveCount(0);
  const measures = await page.evaluate(
    () =>
      (
        window as unknown as {
          shareMeasurements: {
            x: number;
            y: number;
            width: number;
            descent: number;
            direction: string;
            alignment: string;
            canvasHeight: number;
          }[];
        }
      ).shareMeasurements,
  );
  expect(measures.length).toBeGreaterThan(0);
  const pills = await page.evaluate(
    () =>
      (window as unknown as { pillEvidence: { top: number; height: number; centered: number; gap: number }[] })
        .pillEvidence,
  );
  expect(pills.length).toBeGreaterThan(0);
  const artworkChecks = await page.evaluate(
    () => (window as unknown as { artworkChecks: { kind: string; clearance: number }[] }).artworkChecks,
  );
  expect(artworkChecks.some((check) => check.kind === "header")).toBe(true);
  expect(artworkChecks.some((check) => check.kind === "footer")).toBe(true);
  for (const check of artworkChecks) expect(check.clearance).toBeGreaterThanOrEqual(check.kind === "wordmark" ? 6 : 8);
  for (const pill of pills) {
    expect(pill.centered).toBeCloseTo(pill.top + pill.height / 2, 1);
    expect(pill.gap).toBeCloseTo(4, 1);
  }
  for (const measure of measures) {
    expect(measure.width).toBeLessThanOrEqual(858);
    expect(measure.direction).toBe("rtl");
    expect(measure.alignment).toBe("right");
    expect(measure.y + measure.descent).toBeLessThanOrEqual(measure.canvasHeight - 280);
    expect(measure.x - measure.width).toBeGreaterThanOrEqual(110);
  }
  const results = await new AxeBuilder({ page })
    .include('[data-testid="collection-share-modal"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  for (const button of await modal.getByRole("button").all()) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
  await modal.evaluate((element) => {
    element.querySelector<HTMLElement>('[data-testid="sharing-scroll"]')!.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-collection.png") });
});

test("sharing works offline with English meaning and exact text/link alternatives @cross-browser", async ({ page }) => {
  const modal = await openSharing(page, "en");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await page.context().setOffline(true);
  await modal.getByRole("button", { name: "Text", exact: true }).click();
  await expect(modal.getByRole("textbox")).toContainText(/entered the morning|morning/u);
  await modal.getByRole("button", { name: "Link", exact: true }).click();
  await expect(modal.getByRole("textbox")).toHaveValue(/#\/azkar\/morning\?mode=complete$/u);
  await modal.getByRole("button", { name: "Image", exact: true }).click();
  await revealImageSettings(modal);
  await modal.getByRole("combobox", { name: "Image size" }).click();
  await expect(page.getByRole("option", { name: "Square · 1:1", exact: true })).toBeDisabled();
  await page.getByRole("option", { name: "Tall reading image", exact: true }).click();
  await expect(modal.getByRole("img").first()).toHaveAttribute("height", "2920");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await modal.getByText("Customize content", { exact: true }).click();
  await modal.getByRole("checkbox", { name: "Include reviewed English meaning" }).check();
  await expect(modal.getByRole("img").first()).toBeVisible();
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await modal.getByRole("button", { name: "Text", exact: true }).click();
  await expect(modal.getByRole("textbox")).toHaveValue(/We have entered the morning/u);
  await modal.getByRole("button", { name: "Image", exact: true }).click();
  const download = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Save image", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/tall-001-of-\d+/u);
  await page.context().setOffline(false);
});

test("single zikr shares through the same preview without affecting its counter @cross-browser", async ({
  page,
}, testInfo) => {
  await openSharing(page);
  await page.getByTestId("modal-close-button").click();
  await page.goto("./#/azkar/morning/4");
  const reader = page.getByTestId("reader-screen");
  await expect(reader).toBeVisible();
  await reader
    .getByRole("button", { name: /خيارات|Options/u })
    .first()
    .click();
  await page.getByRole("menuitem", { name: /مشاركة/u }).click();
  const modal = page.getByTestId("collection-share-modal");
  await expect(modal).toHaveAccessibleName("مشاركة هذا الذكر");
  await expect(modal.getByRole("img").first()).toBeVisible();
  await modal.getByRole("button", { name: "رابط", exact: true }).click();
  await expect(modal.getByRole("textbox")).toHaveValue(/#\/azkar\/morning\/4\?mode=complete$/u);
  await modal.getByRole("button", { name: "صورة", exact: true }).click();
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("single-zikr.png"));
  await modal.evaluate((element) => {
    element.querySelector<HTMLElement>('[data-testid="sharing-scroll"]')!.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-single.png") });
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await expect(reader).toHaveAttribute("data-zikr-index", "3");
});

test("complete cards, compatible formats and ZIP saving are usable on a narrow screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const modal = await openSharing(page, "ar", "before-sleep", true);
  await revealImageSettings(modal, "ar");
  await expect(modal.getByRole("button", { name: "بنفسجي · ليلي" })).toHaveAttribute("aria-pressed", "true");
  for (const [option, height] of [
    ["صورة قراءة طويلة", 2920],
    ["حالة · ٩:١٦", 1920],
  ] as const) {
    await modal.getByRole("combobox", { name: "مقاس الصورة" }).click();
    await expect(page.getByRole("option", { name: "مربع · ١:١", exact: true })).toBeDisabled();
    const choice = page.getByRole("option", { name: option, exact: true });
    if (await choice.isDisabled()) {
      await expect(choice).toBeDisabled();
      await page.keyboard.press("Escape");
      await expect(modal.getByRole("img").first()).toHaveAttribute("height", "2920");
      await expect(
        modal.getByText("المقاسات غير المتاحة لا تتسع للمحتوى كاملًا. اختر الصورة الطويلة أو النص أو الرابط.", {
          exact: true,
        }),
      ).toBeVisible();
      continue;
    }
    await choice.click();
    await expect(modal.getByRole("img").first()).toHaveAttribute("height", String(height));
    await expect(modal.getByText("جارٍ تجهيز بقية البطاقات…")).toHaveCount(0);
  }
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("lavender-collection.png"));
  const download = page.waitForEvent("download");
  await modal.getByRole("button", { name: "المجموعة كاملة", exact: true }).click();
  await modal.getByRole("button", { name: "حفظ الصور · ZIP" }).click();
  expect((await download).suggestedFilename()).toBe("azkar-cards.zip");
  const overflow = await modal.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(overflow).toBe(false);
  await modal.evaluate((element) => {
    element.querySelector<HTMLElement>('[data-testid="sharing-scroll"]')!.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-narrow.png") });
});

test("gold cards support QR, keyboard navigation and enlarged text", async ({ page }, testInfo) => {
  const modal = await openSharing(page, "en", "evening");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await modal.getByText("Customize content", { exact: true }).click();
  await modal.getByRole("checkbox", { name: "Add a QR link" }).check();
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  const preview = modal.getByRole("button", { name: "Enlarge preview" }).first();
  await preview.focus();
  await page.keyboard.press("End");
  await expect(modal.getByRole("button", { name: "Next card" })).toBeDisabled();
  await page.keyboard.press("Home");
  await expect(modal.getByRole("button", { name: "Previous card" })).toBeDisabled();
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Save image", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("gold-collection-qr.png"));
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(await modal.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  const results = await new AxeBuilder({ page })
    .include('[data-testid="collection-share-modal"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await modal.evaluate((element) => {
    element.querySelector<HTMLElement>('[data-testid="sharing-scroll"]')!.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-enlarged.png") });
});

test("long surahs share sourced reminders with exact Mushaf links @cross-browser", async ({ page }, testInfo) => {
  await openSharing(page, "en", "before-sleep", true);
  const items = getAzkarForMode("before_sleep", "complete");
  for (const id of ["s-hm-110a", "s-hm-110b"]) {
    await page.getByTestId("modal-close-button").click();
    const index = items.findIndex((item) => item.id === id);
    const item = items[index]!;
    await page.goto(`./#/azkar/before-sleep/${index + 1}`);
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", id);
    await page.getByRole("button", { name: "Reader options", exact: true }).first().click();
    await page.getByRole("menuitem", { name: /Share/u }).click();
    const modal = page.getByTestId("collection-share-modal");
    await expect(modal.getByRole("img").first()).toBeVisible();
    await expect(modal.getByRole("img").first()).toHaveJSProperty("naturalHeight", 1350);
    await modal.getByText("Read the text on this card", { exact: true }).click();
    await expect(modal.getByRole("heading", { name: item.surahNameEnglish, exact: true })).toBeVisible();
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: "Save image", exact: true }).click();
    await (await download).saveAs(testInfo.outputPath(`${id}-reminder.png`));
    await modal.getByRole("button", { name: "Text", exact: true }).click();
    const text = await modal.getByRole("textbox").inputValue();
    expect(text).toContain(item.surahNameEnglish);
    expect(text).toContain("Read the complete surah in the Mushaf");
    expect(text).not.toContain(item.arabicText);
    expect(text).not.toContain(item.arabicText.slice(0, 80));
    await modal.getByRole("button", { name: "Link", exact: true }).click();
    await expect(modal.getByRole("textbox")).toHaveValue(new RegExp(`#/quran/${item.mushafPages![0]!.page}$`, "u"));
  }
});

test("selection, theme changes and persistent actions preserve user control", async ({ page }, testInfo) => {
  const modal = await openSharing(page, "en");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await modal.getByRole("button", { name: "Next card", exact: true }).click();
  const previousAlt = await modal.getByRole("img").first().getAttribute("alt");
  await revealImageSettings(modal);
  await modal.getByRole("button", { name: "Olive · Daylight", exact: true }).click();
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await expect(modal.getByRole("img").first()).toHaveAttribute("alt", previousAlt!);
  await modal.getByRole("button", { name: "Selected cards", exact: true }).click();
  const actions = modal.getByTestId("sharing-actions");
  await expect(actions.getByRole("button").first()).toBeDisabled();
  await modal.getByRole("checkbox", { name: "Select card 2", exact: true }).check();
  const download = page.waitForEvent("download");
  await actions.getByRole("button", { name: "Save image", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/002-of-/u);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const box = await actions.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(700);
  for (const checkbox of await modal.getByRole("checkbox", { name: /^Select card / }).all()) {
    const label = checkbox.locator("..");
    expect(await label.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  }
  for (const name of ["Image", "Text", "Link"]) {
    const button = modal.getByRole("button", { name, exact: true });
    const dimensions = await button.evaluate((element) => ({
      content: element.scrollWidth,
      control: element.clientWidth,
    }));
    expect(dimensions.content, `${name} label must fit its ${dimensions.control}px control`).toBeLessThanOrEqual(
      dimensions.control + 1,
    );
  }
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    expect(await modal.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("sharing-selection-200percent.png") });
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
});

test("shared reader links preserve content across recipient routine preferences", async ({ page, browser }) => {
  await openSharing(page, "en");
  await page.getByTestId("modal-close-button").click();
  await page.goto("./#/azkar/morning/20");
  const reader = page.getByTestId("reader-screen");
  await expect(reader).toBeVisible();
  const expectedId = await reader.getAttribute("data-zikr-id");
  await reader.getByRole("button", { name: "Reader options", exact: true }).first().click();
  await page.getByRole("menuitem", { name: /Share/u }).click();
  const modal = page.getByTestId("collection-share-modal");
  await modal.getByRole("button", { name: "Link", exact: true }).click();
  const url = await modal.getByRole("textbox").inputValue();
  const recipient = await browser.newContext();
  try {
    await recipient.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (!localStorage.getItem("azkarapp.state.v1"))
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language: "en", reduceMotion: true, routineModes: { morning: "core" } },
            profile: { displayName: "Guest", isGuest: true },
          }),
        );
    });
    const destination = await recipient.newPage();
    await destination.goto(url);
    await expect(destination.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", expectedId!);
    await destination.reload();
    await expect(destination.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", expectedId!);
    const counter = destination.getByTestId("counter-surface");
    const label = await counter.getAttribute("aria-label");
    const prescribed = Number(label?.match(/0\s*\/\s*(\d+)$/u)?.[1]);
    expect(prescribed).toBeGreaterThan(0);
    for (let repetition = 0; repetition < prescribed; repetition += 1) await counter.click();
    await expect
      .poll(() => destination.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed.morning))
      .toContain(expectedId!);
    expect(
      await destination.evaluate(
        () => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.routineModes.morning,
      ),
    ).toBe("core");
    // The routine selector belongs to the desktop reader sidebar. Keep the
    // recipient identity/completion checks at the project's supplied width,
    // then expose that sidebar for the explicit preference-change assertion.
    await destination.setViewportSize({ width: 1440, height: 900 });
    await destination.getByTestId("routine-mode-filter").click();
    await destination.getByRole("menuitemradio", { name: /^Core/u }).click();
    await expect(destination.getByTestId("reader-screen")).toBeVisible();
    await expect(destination).not.toHaveURL(/mode=/u);
    const selectedCoreId = await destination.getByTestId("reader-screen").getAttribute("data-zikr-id");
    await destination.reload();
    await expect(destination.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", selectedCoreId!);
  } finally {
    await recipient.close();
  }
});

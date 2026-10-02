import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openSharing(page: Page, language = "ar", route = "morning") {
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
      (window as unknown as { shareMeasurements: unknown[] }).shareMeasurements = [];
      CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
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
  await expect(modal.getByRole("img")).toBeVisible();
  return modal;
}

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
  for (const measure of measures) {
    expect(measure.width).toBeLessThanOrEqual(858);
    expect(measure.direction).toBe("rtl");
    expect(measure.alignment).toBe("right");
    expect(measure.y + measure.descent).toBeLessThanOrEqual(measure.canvasHeight - 400);
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
    element.scrollTop = 0;
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
  await modal.getByRole("combobox", { name: "Image size" }).click();
  await page.getByRole("option", { name: "Square · 1:1", exact: true }).click();
  await expect(modal.getByRole("img")).toHaveAttribute("height", "1080");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  const download = page.waitForEvent("download");
  await modal.getByRole("button", { name: "Save image", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/square-001-of-\d+/u);
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
  await expect(modal.getByRole("img")).toBeVisible();
  await modal.getByRole("button", { name: "رابط", exact: true }).click();
  await expect(modal.getByRole("textbox")).toHaveValue(/#\/azkar\/morning\/4\?mode=complete$/u);
  await modal.getByRole("button", { name: "صورة", exact: true }).click();
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("single-zikr.png"));
  await modal.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-single.png") });
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
  await expect(reader).toHaveAttribute("data-zikr-index", "3");
});

test("all designs, continuation cards and ZIP saving are usable on a narrow screen", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 700 });
  const modal = await openSharing(page, "ar", "before-sleep");
  await modal.getByRole("combobox", { name: "مظهر البطاقات" }).click();
  await expect(page.getByRole("option", { name: "بنفسجي · ليلي" })).toHaveAttribute("data-state", "checked");
  await page.keyboard.press("Escape");
  for (const [option, height] of [
    ["مربع · ١:١", 1080],
    ["منشور · ٤:٥", 1350],
    ["صورة قراءة طويلة", 2920],
    ["حالة · ٩:١٦", 1920],
  ] as const) {
    await modal.getByRole("combobox", { name: "مقاس الصورة" }).click();
    await page.getByRole("option", { name: option, exact: true }).click();
    await expect(modal.getByRole("img")).toHaveAttribute("height", String(height));
    await expect(modal.getByText("جارٍ تجهيز بقية البطاقات…")).toHaveCount(0);
  }
  await modal.getByText("خيارات مشاركة إضافية", { exact: true }).click();
  const imageDownload = page.waitForEvent("download");
  await modal.getByRole("button", { name: "حفظ هذه الصورة", exact: true }).click();
  await (await imageDownload).saveAs(testInfo.outputPath("lavender-collection.png"));
  const download = page.waitForEvent("download");
  await modal.getByRole("button", { name: "تحميل الصور والنص كاملًا · ZIP" }).click();
  expect((await download).suggestedFilename()).toBe("azkar-cards.zip");
  const overflow = await modal.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(overflow).toBe(false);
  await modal.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-narrow.png") });
});

test("gold cards support QR, keyboard navigation and enlarged text", async ({ page }, testInfo) => {
  const modal = await openSharing(page, "en", "evening");
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  await modal.getByText("Content and QR options", { exact: true }).click();
  await modal.getByRole("checkbox", { name: "Add a QR link" }).check();
  await expect(modal.getByText("Preparing the remaining cards…")).toHaveCount(0);
  const preview = modal.getByRole("button", { name: "Enlarge preview" });
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
    element.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath("sharing-enlarged.png") });
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
    expect(
      await destination.evaluate(
        () => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.routineModes.morning,
      ),
    ).toBe("core");
  } finally {
    await recipient.close();
  }
});

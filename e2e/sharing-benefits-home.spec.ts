import { sharingStep, sharingCaption } from "./helpers/sharing";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { t } from "../src/app/i18n";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

const hadithReadings = Object.values(
  JSON.parse(readFileSync("src/app/content/benefitsHadithReadings.json", "utf8")),
) as { ar: string; en: string }[];

async function seed(page: Page, language: "ar" | "en") {
  await fixtureReminderCatalogue(page);
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language, themeMode: "midnight", reduceMotion: true }, profile: { isGuest: true } }),
    );
    const draws: { text: string; font: string }[] = [];
    Object.assign(window, { sharingDraws: draws });
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      if (this.canvas.width === 1080) draws.push({ text: args[0], font: this.font });
      return original.apply(this, args);
    };
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`complete Benefits sharing continues long narrations and exports all 21 in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1280, height: 900 });
    await seed(page, language);
    await page.goto("/#/benefits");
    await page.getByRole("tab", { name: /(?:Hadith|الأحاديث)/ }).click();
    await expect(page.getByRole("article")).toHaveCount(15);
    const opener = page.getByTestId("share-benefits-collection-button");
    await opener.click();
    const modal = page.getByTestId("collection-share-modal");
    await sharingStep(modal, "share");
    const save = modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true });
    await expect(save).toBeEnabled({ timeout: 60000 });
    await expect(modal.getByRole("alert")).toHaveCount(0);
    await expect(modal.getByRole("combobox", { name: t(language, "shareStudio.scope"), exact: true })).toContainText(
      t(language, "shareStudio.scopeall"),
    );
    const draws = await page.evaluate(
      () => (window as unknown as { sharingDraws: { text: string; font: string }[] }).sharingDraws,
    );
    expect(draws.some((draw) => /(?:Part |الجزء )/u.test(draw.text))).toBe(true);
    expect(draws.some((draw) => draw.text === t(language, "shareStudio.continuedBefore"))).toBe(true);
    expect(draws.some((draw) => draw.text === t(language, "shareStudio.continuedAfter"))).toBe(true);
    const numbering = draws.filter((draw) => /^(?:Part |Card |الجزء |بطاقة )/u.test(draw.text));
    expect(numbering.length).toBeGreaterThan(0);
    expect(numbering.every((draw) => !(language === "en" ? /[٠-٩۰-۹]/u : /[0-9۰-۹]/u).test(draw.text))).toBe(true);
    expect(draws.some((draw) => /مرة واحدة|Repeat once/u.test(draw.text))).toBe(false);
    const downloaded = page.waitForEvent("download");
    await save.click();
    const archivePath = testInfo.outputPath(`benefits-all-${language}.zip`);
    await (await downloaded).saveAs(archivePath);
    const zip = await readFile(archivePath);
    expect(hadithReadings).toHaveLength(21);
    for (const item of hadithReadings) expect(zip.includes(Buffer.from(item[language]))).toBe(true);
    await expect(save).toBeEnabled();
    await expect.poll(() => save.evaluate((node) => getComputedStyle(node).opacity)).toBe("1");
    await expect
      .poll(() =>
        modal
          .getByRole("checkbox", { name: t(language, "shareStudio.includeCaption"), exact: true })
          .evaluate((node) => getComputedStyle(node).opacity),
      )
      .toBe("1");
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`benefits-all-${language}.png`) });
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });

  test(`Quran Benefits exports use the Mushaf page font in ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 320 : 1280, height: 900 });
    await seed(page, language);
    await page.goto("/#/benefits");
    const opener = page.getByRole("article").nth(1).getByRole("button");
    await opener.click();
    const modal = page.getByTestId("collection-share-modal");
    await sharingStep(modal, "share");
    await expect(modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true })).toBeEnabled({
      timeout: 60000,
    });
    const fonts = await page.evaluate(() =>
      (window as unknown as { sharingDraws: { text: string; font: string }[] }).sharingDraws.map((draw) => draw.font),
    );
    expect(fonts.some((font) => font.includes("qcf-v2-page-23"))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`quran-mushaf-${language}.png`) });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });

  test(`Home reminder shares its displayed reading and restores the trigger in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1280, height: 900 });
    await seed(page, language);
    await page.clock.setFixedTime(new Date("2026-10-19T13:00:00+03:00"));
    await page.goto("/#/home");
    const card = page.getByTestId("home-daily-evidence");
    const quotation = () =>
      card.getByTestId("daily-evidence-hadith").evaluate((node) => {
        const semantic = node.cloneNode(true) as HTMLElement;
        semantic.querySelectorAll('[aria-hidden="true"]').forEach((element) => element.remove());
        return semantic.textContent ?? "";
      });
    const quote = await quotation();
    const opener = card.getByTestId("daily-evidence-share");
    await expect(opener).toBeVisible();
    const size = (await opener.boundingBox())!;
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`home-reminder-${language}.png`) });
    await opener.focus();
    await page.keyboard.press("Enter");
    const modal = page.getByTestId("collection-share-modal");
    await sharingStep(modal, "share");
    await expect(modal.getByRole("img").first()).toBeVisible();
    await sharingCaption(modal);
    const clean = (text: string) =>
      text
        .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu, "")
        .replace(/\s+/gu, " ")
        .trim();
    expect(clean(await modal.getByRole("textbox").inputValue())).toContain(clean(quote));
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await expect.poll(quotation).toBe(quote);
  });
}

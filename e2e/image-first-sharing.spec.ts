import { sharingScope, sharingStep } from "./helpers/sharing";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { t } from "../src/app/i18n";
import { WIRD_EVIDENCE_BY_SECTION } from "../src/app/content/wirdBenefits";

for (const language of ["ar", "en"] as const) {
  test(`image-first evidence sharing and PNG ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/quran-wird/benefits");
    await page.getByTestId("wird-benefits-list").locator("article").first().getByRole("button").click();
    const modal = page.getByTestId("collection-share-modal");
    // The owner-approved single image workflow replaces the Image/Text/Link chooser.
    await expect(modal.getByRole("group", { name: t(language, "shareStudio.method"), exact: true })).toHaveCount(0);
    await sharingStep(modal, "design");
    await modal.getByRole("combobox", { name: t(language, "shareStudio.format") }).click();
    await page.getByRole("option", { name: t(language, "shareStudio.portrait"), exact: true }).click();
    await sharingStep(modal, "share");
    await expect(
      modal.getByRole("button", { name: t(language, "shareStudio.copyReadingLink"), exact: true }),
    ).toBeVisible();
    const preview = modal.getByTestId("sharing-preview").getByRole("img");
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("width", "1080");
    await expect(preview).toHaveAttribute("height", "1350");
    await modal
      .getByText(language === "ar" ? "قراءة نص هذه البطاقة" : "Read the text on this card", { exact: true })
      .click();
    const cardText = modal
      .locator(".sharing-disclosure")
      .filter({ hasText: t(language, "shareStudio.readCard") })
      .locator('p[lang="ar"]')
      .first();
    await expect(cardText).toBeVisible();
    // Verified QCF glyphs are aria-hidden; the original source words remain semantic text.
    await expect
      .poll(() =>
        cardText.evaluate((node) => {
          const copy = node.cloneNode(true) as HTMLElement;
          copy.querySelectorAll('[aria-hidden="true"]').forEach((glyph) => glyph.remove());
          return copy.textContent?.replace(/\s+/gu, " ").trim();
        }),
      )
      .toBe(WIRD_EVIDENCE_BY_SECTION.quran[0].text.ar);
    const download = page.waitForEvent("download");
    await modal
      .getByTestId("sharing-actions")
      .getByRole("button", { name: language === "ar" ? "حفظ" : "Save", exact: true })
      .click();
    const saved = await download;
    expect(saved.suggestedFilename()).toMatch(/\.png$/);
    const bytes = await readFile((await saved.path())!);
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.length).toBeGreaterThan(10000);
    await saved.saveAs(testInfo.outputPath(`milestone-${language}.png`));
    await expect(cardText).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`image-first-${language}.png`) });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(modal).toHaveCSS("font-size", "32px");
    for (const button of await modal.locator(".sharing-caption").getByRole("button").all()) {
      await expect(button).toBeVisible();
      expect(await button.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    const actions = modal.getByTestId("sharing-actions");
    for (const button of await actions.getByRole("button").all()) {
      await expect(button).toBeVisible();
      const bounds = await button.evaluate((node) => ({
        label: node.getAttribute("aria-label") ?? node.textContent,
        scroll: node.scrollWidth,
        width: node.clientWidth,
      }));
      expect(bounds.scroll <= bounds.width, JSON.stringify(bounds)).toBe(true);
    }
    expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await actions.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`image-first-${language}-200percent.png`) });
  });
}

for (const language of ["ar", "en"] as const) {
  test(`completion opens the image studio without changing progress ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
    }, language);
    await page.goto("/#/completion");
    const label = t(language, "completion.shareCollection", {
      category: language === "ar" ? "أذكار الصباح" : "Morning Azkar",
    });
    const trigger = page.getByRole("button", { name: label, exact: true });
    await expect(trigger).toBeVisible();
    // Guest initialization persists its normalized category map asynchronously.
    // Compare sharing against that settled map, not the incomplete seed object.
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.isArray(JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed?.after_prayer),
        ),
      )
      .toBe(true);
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed);
    await trigger.click();
    const modal = page.getByTestId("collection-share-modal");
    // The bounded editor retains a visible gutter and intrinsic artwork size.
    await expect.poll(async () => (await modal.boundingBox())?.y).toBeGreaterThanOrEqual(16);
    expect((await modal.boundingBox())!.height).toBeLessThanOrEqual(812);
    // Prepared-set-first sharing is an independently approved studio change.
    // Exercise the explicit custom option to retain this test's actual PNG,
    // balanced layout and all-card-scope proof for the completion entry point.
    await modal.getByText(t(language, "shareStudio.generatedTab"), { exact: true }).click();
    await sharingStep(modal, "share");
    await expect(modal.getByRole("combobox", { name: /^(Cards to share|البطاقات المراد مشاركتها)$/u })).toHaveText(
      language === "ar" ? "كل البطاقات" : "All cards",
    );
    // The default now shares the whole collection. Retain the actual single-PNG
    // export proof by explicitly selecting the currently previewed card.
    await sharingScope(modal, "current");
    const image = modal.getByTestId("sharing-preview").getByRole("img");
    await expect(image).toHaveAttribute("width", "1080");
    await expect(image).toHaveAttribute("height", "1080");
    expect((await modal.boundingBox())!.y).toBeGreaterThanOrEqual(16);
    const download = page.waitForEvent("download");
    await modal
      .getByTestId("sharing-actions")
      .getByRole("button", { name: language === "ar" ? "حفظ" : "Save", exact: true })
      .click();
    const file = await download;
    const bytes = await readFile((await file.path())!);
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    await file.saveAs(testInfo.outputPath(`completion-${language}.png`));
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    await modal.getByRole("button", { name: language === "ar" ? "إغلاق" : "Close", exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed)).toEqual(before);
  });
}

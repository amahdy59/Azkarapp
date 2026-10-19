import { sharingStep } from "./helpers/sharing";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";

async function openStudio(page: Page, language: "ar" | "en") {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript((language) => {
    // Native OS sheets need physical-device review; exercise explicit file-saving recovery here.
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false });
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
    );
  }, language);
  await page.goto("/#/quran/42");
  const trigger = page.getByRole("button", {
    name: language === "ar" ? "فتح إجراءات الآية ٢٥٥" : "Open actions for ayah 255",
  });
  await expect(trigger).toBeVisible();
  await trigger.click({ button: "right" });
  const imageAction = page.getByRole("button", { name: t(language, "reader.shareAyahImage"), exact: true });
  await imageAction.click();
  const studio = page.getByTestId("ayah-share-studio");
  return { trigger, imageAction, studio };
}

for (const language of ["ar", "en"] as const) {
  test(`ayah image preview exports complete portrait and square cards in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const { trigger, imageAction, studio } = await openStudio(page, language);
    await expect(studio.getByRole("heading", { name: t(language, "reader.ayahCardTitle"), exact: true })).toBeFocused();
    const preview = studio.getByRole("img");
    await expect(preview).toBeVisible();
    await expect(preview).toBeInViewport();
    await expect(studio.locator(".ayah-share-footer")).toBeInViewport();
    const initialSave = studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true });
    await sharingStep(studio, "share");
    await expect(initialSave).toBeEnabled();
    await expect(studio.getByRole("button", { name: t(language, "common.next"), exact: true })).toHaveCount(0);
    const size = studio.getByRole("slider", { name: new RegExp(t(language, "reader.ayahCardTextSize")) });
    await sharingStep(studio, "design");
    if (!(await studio.locator(".sharing-typography").evaluate((node) => (node as HTMLDetailsElement).open)))
      await studio.locator(".sharing-typography > summary").click();
    await size.focus();
    await page.keyboard.press("Home");
    await expect(size).toHaveValue("0.75");
    await sharingStep(studio, "share");
    await expect(initialSave).toBeEnabled();
    await sharingStep(studio, "design");
    if (!(await studio.locator(".sharing-typography").evaluate((node) => (node as HTMLDetailsElement).open)))
      await studio.locator(".sharing-typography > summary").click();
    await size.focus();
    await page.keyboard.press("End");
    await expect(size).toHaveValue("1.125");
    await sharingStep(studio, "share");
    await expect(initialSave).toBeEnabled();
    await expect(studio.getByRole("button", { name: t(language, "common.next"), exact: true })).toHaveCount(0);
    await sharingStep(studio, "design");
    if (!(await studio.locator(".sharing-typography").evaluate((node) => (node as HTMLDetailsElement).open)))
      await studio.locator(".sharing-typography > summary").click();
    await size.focus();
    await page.keyboard.press("Home");
    // WebKit and Chromium use different native horizontal keys for an RTL range.
    await page.keyboard.press("ArrowRight");
    const increase = (await size.inputValue()) === "0.75" ? "ArrowLeft" : "ArrowRight";
    if (increase === "ArrowLeft") await page.keyboard.press(increase);
    await page.keyboard.press(increase);
    await expect(size).toHaveValue("1");
    await sharingStep(studio, "share");
    await expect(initialSave).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-mobile-sizing.png`), scale: "css" });
    if (language === "en") {
      const completeAyahDownload = page.waitForEvent("download");
      await initialSave.click();
      await (await completeAyahDownload).saveAs(testInfo.outputPath("ayah-kursi-complete.png"));
    }
    await studio.locator(".ayah-share-body").evaluate((body) => {
      body.scrollTop = 0;
    });
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-mobile-preview.png`), scale: "css" });
    const headerBefore = await studio.locator(".ayah-share-header").boundingBox();
    await sharingStep(studio, "content");
    await expect(
      studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }),
    ).toBeEnabled();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }).check();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardMeanings"), exact: true }).check();
    await sharingStep(studio, "share");
    await expect(
      studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true }),
    ).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-mobile-options.png`), scale: "css" });
    await sharingStep(studio, "share");
    await studio.locator("summary").click();
    await expect(studio.locator("[data-quran-glyph]").first()).toBeVisible();
    await studio.locator('p[lang="ar"]').first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-mobile-text.png`), scale: "css" });
    await expect(studio.locator('div[lang="en"]')).toContainText("Allah - there is no deity except Him");
    const semanticArabic = await studio
      .locator('p[lang="ar"]')
      .first()
      .evaluate((paragraph) => {
        const semantic = paragraph.cloneNode(true) as HTMLElement;
        semantic.querySelectorAll('[aria-hidden="true"]').forEach((glyph) => glyph.remove());
        return semantic.textContent;
      });
    expect(semanticArabic).toContain("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ");
    expect(await studio.locator(".ayah-share-header").boundingBox()).toEqual(headerBefore);
    await expect(studio.locator(".ayah-share-footer")).toBeInViewport();
    for (const format of ["story", "square", "portrait", "tall"] as const) {
      await sharingStep(studio, "design");
      if (!(await studio.locator(".sharing-typography").evaluate((node) => (node as HTMLDetailsElement).open)))
        await studio.locator(".sharing-typography > summary").click();
      await studio.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }).click();
      const option = page.getByRole("option", { name: t(language, `shareStudio.${format}`), exact: true });
      await expect(option.getByTestId("share-format-platforms").locator(":scope > span")).toHaveCount(2);
      await option.click();
      await sharingStep(studio, "share");
      const save = studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true });
      await expect(save).toBeEnabled();
      await expect(preview).toHaveAttribute(
        "height",
        String({ story: 1920, portrait: 1350, square: 1080, tall: 2920 }[format]),
      );
      const previous = studio.getByRole("button", { name: t(language, "common.previous"), exact: true });
      while (await previous.isEnabled()) await previous.click();
      const downloadPromise = page.waitForEvent("download");
      await save.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(`ayah-2-255-${format}-1.png`);
      await download.saveAs(testInfo.outputPath(`ayah-card-${language}-${format}-${testInfo.project.name}.png`));
      let part = 1;
      const next = studio.getByRole("button", { name: t(language, "common.next"), exact: true });
      while (await next.isEnabled()) {
        await next.click();
        part += 1;
        // Preview every continuation without triggering repeated OS download scans.
        await expect(preview).toBeVisible();
        if (language === "en" && format === "portrait" && part === 2) {
          const continuationDownload = page.waitForEvent("download");
          await save.click();
          await (await continuationDownload).saveAs(testInfo.outputPath("ayah-card-en-portrait-continuation-full.png"));
        }
        await preview.screenshot({
          path: testInfo.outputPath(`ayah-card-${language}-${format}-part-${part}-${testInfo.project.name}.png`),
        });
      }
      await preview.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(`ayah-studio-${language}-${format}-${testInfo.project.name}.png`),
      });
      expect(await studio.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    const zipDownload = page.waitForEvent("download");
    await studio.getByRole("button", { name: language === "en" ? /^Save all .*ZIP/ : /^حفظ البطاقات.*ZIP/ }).click();
    const archive = await zipDownload;
    expect(archive.suggestedFilename()).toBe("azkar-cards.zip");
    await archive.saveAs(testInfo.outputPath(`ayah-${language}-complete.zip`));
    await studio.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(imageAction).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test(`ayah sharing enlarged text, themes and short windows in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const { trigger, imageAction, studio } = await openStudio(page, language);
    const scroll = studio.locator(".ayah-share-body");
    await expect(
      studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }),
    ).toBeEnabled();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardTranslation"), exact: true }).check();
    await studio.getByRole("checkbox", { name: t(language, "reader.ayahCardMeanings"), exact: true }).check();
    await sharingStep(studio, "share");
    await studio.locator("summary").click();
    await sharingStep(studio, "share");
    await expect(
      studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true }),
    ).toBeEnabled();
    const initialDownload = page.waitForEvent("download");
    await studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true }).click();
    expect((await initialDownload).suggestedFilename()).toBe("ayah-2-255-portrait-1.png");
    for (const theme of ["light", "midnight", "dark"]) {
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
      }, theme);
      await page.setViewportSize({ width: 320, height: 740 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await sharingStep(studio, "design");
      if (!(await studio.locator(".sharing-typography").evaluate((node) => (node as HTMLDetailsElement).open)))
        await studio.locator(".sharing-typography > summary").click();
      await studio.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }).focus();
      await expect(
        studio.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }),
      ).toBeInViewport();
      await sharingStep(studio, "share");
      const enlargedSave = studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true });
      await enlargedSave.focus();
      await expect(enlargedSave).toBeInViewport();
      expect((await studio.locator(".ayah-share-header").boundingBox())!.height).toBeLessThan(280);
      const geometry = await studio.evaluate((element) => ({
        fits: element.scrollWidth <= element.clientWidth + 1,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowing: [...element.querySelectorAll<HTMLElement>("*")]
          .filter((child) => child.clientWidth > 0 && child.scrollWidth > child.clientWidth + 1)
          .map((child) => ({
            tag: child.tagName,
            class: child.className,
            width: child.clientWidth,
            scroll: child.scrollWidth,
          })),
      }));
      expect(geometry.fits, JSON.stringify(geometry)).toBe(true);
      await sharingStep(studio, "content");
      await expect(studio.locator(".ayah-share-option")).toHaveCount(2);
      for (const target of await studio.locator(".ayah-share-option").all()) {
        const bounds = await target.boundingBox();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      await sharingStep(studio, "share");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="ayah-interaction-sheet"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`studio-${language}-${theme}-320-enlarged.png`),
        scale: "css",
      });
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.setViewportSize({ width: 1024, height: 768 });
    await sharingStep(studio, "share");
    await expect(
      studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true }),
    ).toBeEnabled();
    await expect(studio.locator(".ayah-share-footer")).toBeInViewport();
    await scroll.evaluate((element) => {
      element.scrollTop = 0;
    });
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-desktop.png`), scale: "css" });
    await page.setViewportSize({ width: 844, height: 390 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const shortSave = studio.getByRole("button", { name: t(language, "reader.ayahCardDownload"), exact: true });
    await shortSave.focus();
    await expect(shortSave).toBeInViewport();
    expect(await studio.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`studio-${language}-landscape-enlarged.png`), scale: "css" });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    const results = await new AxeBuilder({ page })
      .include('[data-testid="ayah-interaction-sheet"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await studio.getByRole("button", { name: t(language, "common.back"), exact: true }).click();
    await expect(imageAction).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
}

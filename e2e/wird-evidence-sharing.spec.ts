import { expect, test } from "@playwright/test";
import { sharingContent, sharingStep, sharingCaption, sharingReadingLink } from "./helpers/sharing";
import { t } from "../src/app/i18n";
import { WIRD_EVIDENCE_BY_SECTION, WIRD_SECTION_ORDER } from "../src/app/content/wirdBenefits";

for (const language of ["ar", "en"] as const) {
  for (const section of WIRD_SECTION_ORDER) {
    test(`Wird evidence ${section} opens the complete sharing studio in ${language} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: language === "ar" ? 390 : 1280, height: 900 });
      await page.addInitScript((language) => {
        const drawn: string[] = [];
        Object.assign(window, { __wirdDrawnText: drawn });
        const fillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof fillText>) {
          if (this.canvas.width === 1080) drawn.push(args[0]);
          return fillText.apply(this, args);
        };
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, themeMode: "midnight" },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/quran-wird/benefits");
      await expect(page.getByRole("heading", { name: t(language, "garden.explanationLabel") })).toHaveCount(0);
      await page.getByRole("tab", { name: t(language, `wirdBenefits.${section}`), exact: true }).click();
      const item = WIRD_EVIDENCE_BY_SECTION[section][0];
      const opener = page.getByTestId("wird-benefits-list").locator("article").first().getByRole("button");
      await expect(opener).toHaveAttribute("aria-haspopup", "dialog");
      await opener.click();
      const dialog = page.getByRole("dialog", { name: t(language, "wirdBenefits.shareEvidence"), exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("group", { name: t(language, "shareStudio.method"), exact: true })).toHaveCount(0);
      await expect(dialog.getByRole("img").first()).toBeVisible();
      await sharingStep(dialog, "design");
      const format = dialog.getByRole("combobox", { name: t(language, "shareStudio.format") });
      await expect(format).toBeEnabled();
      await format.click();
      await page.getByRole("option", { name: t(language, "shareStudio.square"), exact: true }).click();
      await expect(format).toContainText(t(language, "shareStudio.square"));
      if (section === "quran") {
        await sharingContent(dialog);
        const translation = dialog.getByRole("checkbox", { name: t(language, "shareStudio.meaning"), exact: true });
        await expect(translation).toBeEnabled();
        await translation.check();
        const qr = dialog.getByRole("checkbox", { name: t(language, "shareStudio.qr"), exact: true });
        await expect(qr).toBeEnabled();
        await qr.check();
        // Use a portrait with enough space for complete translation and the source QR.
        await sharingStep(dialog, "design");
        await format.click();
        await page.getByRole("option", { name: t(language, "shareStudio.portrait"), exact: true }).click();
        await sharingStep(dialog, "share");
        const save = dialog.getByRole("button", { name: t(language, "shareStudio.save"), exact: true });
        await expect(save).toBeEnabled();
        await expect
          .poll(() =>
            dialog
              .getByRole("img")
              .first()
              .evaluate((image) => (image as HTMLImageElement).naturalHeight),
          )
          .toBe(1350);
        expect(
          await page.evaluate(() => (window as unknown as { __wirdDrawnText: string[] }).__wirdDrawnText),
        ).not.toContain(t(language, "shareStudio.repeatOnce"));
        const file = page.waitForEvent("download");
        await save.click();
        await (await file).saveAs(testInfo.outputPath(`wird-evidence-card-${language}.png`));
        await dialog.getByTestId("sharing-scroll").evaluate((element) => {
          element.scrollTop = 0;
        });
        await page.screenshot({ path: testInfo.outputPath(`wird-sharing-studio-${language}.png`) });
      }
      await sharingStep(dialog, "share");
      await sharingCaption(dialog);
      const text = await dialog.getByRole("textbox").inputValue();
      expect(text).toContain(item.kind === "quran" ? item.text.ar : item.text[language]);
      expect(text).toContain(item.source[language]);
      if (item.attribution) expect(text).toContain(item.attribution[language]);
      expect(await sharingReadingLink(dialog)).toBe(item.sourceUrl);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(opener).toBeFocused();
      await page.screenshot({ path: testInfo.outputPath(`wird-evidence-${language}.png`) });
      if (section === "quran") {
        await page.goto("/#/progress");
        await page.getByTestId("oasis-stage-card").locator("summary").click();
        await expect(page.getByRole("heading", { name: t(language, "garden.explanationLabel") })).toBeVisible();
      }
    });
  }
}

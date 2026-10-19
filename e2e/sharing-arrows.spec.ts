import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";

async function arrowGeometry(button: Locator) {
  return button.evaluate((node) => {
    const path = node.querySelector("path")!;
    const svg = node.querySelector("svg")!;
    const start = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
    const tip = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!);
    return {
      x: node.getBoundingClientRect().x,
      pointsRight: tip.x > start.x,
      width: node.getBoundingClientRect().width,
      height: node.getBoundingClientRect().height,
      transform: getComputedStyle(svg).transform,
    };
  });
}

async function outwardPair(previous: Locator, next: Locator, language: "en" | "ar") {
  const before = await arrowGeometry(previous);
  const after = await arrowGeometry(next);
  expect(before.pointsRight).toBe(language === "ar");
  expect(after.pointsRight).toBe(language === "en");
  expect(before.x < after.x).toBe(language === "en");
  for (const control of [before, after]) {
    expect(control.width).toBeGreaterThanOrEqual(44);
    expect(control.height).toBeGreaterThanOrEqual(44);
  }
}

for (const language of ["en", "ar"] as const) {
  for (const curated of [false, true]) {
    test(`${language} ${curated ? "approved" : "generated"} sharing arrows stay near the card and point outward @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, reduceMotion: true, themeMode: "midnight" },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/azkar/morning");
      await page.getByTestId("share-collection-button").click();
      const modal = page.getByTestId("collection-share-modal");
      if (curated)
        await modal.getByRole("button", { name: t(language, "shareStudio.curatedTab"), exact: true }).click();
      const image = modal.getByTestId("sharing-preview").getByRole("img").first();
      await expect(image).toBeVisible();
      if (curated) await expect(image).toHaveAttribute("src", /^blob:/u);
      const previous = modal.getByRole("button", { name: t(language, "shareStoryPack.previousPage"), exact: true });
      const next = modal.getByRole("button", { name: t(language, "shareStoryPack.nextPage"), exact: true });
      await expect(previous).toBeDisabled();
      await expect(next).toBeEnabled();
      const initial = await image.getAttribute("src");
      for (const viewport of [
        { width: 1280, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await outwardPair(previous, next, language);
        await expect(previous).toBeInViewport({ ratio: 1 });
        await expect(next).toBeInViewport({ ratio: 1 });
        const navigation = await modal.locator(".sharing-card-navigation").boundingBox();
        expect(navigation!.width).toBeLessThanOrEqual(320);
        const footer = await modal.getByTestId("sharing-actions").boundingBox();
        expect(navigation!.y + navigation!.height).toBeLessThanOrEqual(footer!.y);
        if (viewport.width === 1280) {
          const card = await image.boundingBox();
          expect(navigation!.y - (card!.y + card!.height)).toBeLessThanOrEqual(24);
        }
        await page.screenshot({ path: testInfo.outputPath(`arrows-${language}-${curated}-${viewport.width}.png`) });
      }
      await next.click();
      await expect(image).not.toHaveAttribute("src", initial!);
      await expect(previous).toBeEnabled();
      await previous.click();
      await expect(image).toHaveAttribute("src", initial!);
      await next.focus();
      await page.keyboard.press(language === "ar" ? "ArrowLeft" : "ArrowRight");
      await expect(image).not.toHaveAttribute("src", initial!);
      await page.keyboard.press("Home");
      await expect(image).toHaveAttribute("src", initial!);
      await page.keyboard.press("End");
      await expect(next).toBeDisabled();
      await previous.focus();
      await page.keyboard.press("Home");
      if (!curated) {
        const stepPrevious = modal.getByRole("button", { name: t(language, "shareStudio.previousStep"), exact: true });
        const stepNext = modal.getByRole("button", { name: t(language, "shareStudio.nextStep"), exact: true });
        await outwardPair(stepPrevious, stepNext, language);
        await stepNext.click();
        await expect(
          modal.getByRole("heading", { name: t(language, "shareStudio.stepdesign"), exact: true }),
        ).toBeFocused();
        await stepPrevious.click();
        await sharingStep(modal, "share");
      }
    });
  }
}

import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";

async function outwardPair(previous: Locator, next: Locator, language: "en" | "ar") {
  const nextLabel = await next.getAttribute("aria-label");
  // A responsive dialog can reflow between browser round trips after resize.
  // Compare both siblings in one layout, retaining the physical SVG checks.
  const { before, after } = await previous.evaluate((node, label) => {
    const nextButton = Array.from(node.parentElement!.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === label,
    )!;
    const geometry = (button: Element) => {
      const path = button.querySelector("path")!;
      const svg = button.querySelector("svg")!;
      const start = path.getPointAtLength(0).matrixTransform(path.getScreenCTM()!);
      const tip = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!);
      const bounds = button.getBoundingClientRect();
      return {
        x: bounds.x,
        pointsRight: tip.x > start.x,
        width: bounds.width,
        height: bounds.height,
        transform: getComputedStyle(svg).transform,
      };
    };
    return { before: geometry(node), after: geometry(nextButton) };
  }, nextLabel);
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
        await expect(
          modal.getByRole("button", { name: t(language, "shareStudio.previousStep"), exact: true }),
        ).toHaveCount(0);
        await sharingStep(modal, "design");
        const stepPrevious = modal.getByRole("button", { name: t(language, "shareStudio.previousStep"), exact: true });
        const stepNext = modal.getByRole("button", { name: t(language, "shareStudio.nextStep"), exact: true });
        await outwardPair(stepPrevious, stepNext, language);
        await stepNext.click();
        await expect(
          modal.getByRole("heading", { name: t(language, "shareStudio.stepshare"), exact: true }),
        ).toBeFocused();
        await sharingStep(modal, "design");
        await stepPrevious.click();
        await sharingStep(modal, "share");
      }
    });
  }
}

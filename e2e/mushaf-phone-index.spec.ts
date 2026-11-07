import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const { width, language, owner } of [
  { width: 390, language: "ar", owner: "wird" },
  { width: 320, language: "en", owner: "wird" },
  { width: 390, language: "ar", owner: "surah" },
] as const) {
  test(`phone Mushaf index and controls ${owner} ${language} ${width} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(
      ({ language }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: language === "ar" ? "midnight" : "light", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      },
      { language },
    );
    await page.goto(owner === "wird" ? "/#/quran/42" : "/#/azkar/friday-kahf/1");
    if (owner === "surah") await page.getByTestId("reader-mushaf-button").click();
    const reader = page.locator(".mushaf-reader-viewer");
    const paper = reader.locator(".mushaf-paper");
    await expect(paper).toBeVisible();
    await expect(paper.locator("[data-mushaf-line]").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (width === 320)
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
    const top = reader.locator(".mushaf-control-band--top");
    const bottom = reader.locator(".mushaf-control-band--bottom");
    const opener = top.getByTestId(owner === "wird" ? "mushaf-top-center-index" : "mushaf-furniture-surah-btn");
    const bookmark = top.getByTestId(owner === "wird" ? "mushaf-page-bookmark" : "mushaf-immersive-bookmark");
    const folio = bottom.getByTestId("mushaf-furniture-page-btn");
    const focus = bottom.getByTestId("mushaf-focus-toggle");
    const back = top.getByTestId(owner === "wird" ? "mushaf-top-left-back" : "mushaf-immersive-close");
    for (const control of [opener, bookmark, folio, focus]) {
      const bounds = (await control.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    }
    for (const control of [opener, folio]) {
      const bounds = (await control.boundingBox())!;
      expect(Math.abs(bounds.x + bounds.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    }
    expect((await bookmark.boundingBox())!.x).toBeLessThan((await opener.boundingBox())!.x);
    expect((await focus.boundingBox())!.x).toBeLessThan((await folio.boundingBox())!.x);
    await expect(focus).toHaveText("");
    await page.screenshot({ path: info.outputPath("reading.png") });
    await bookmark.click();
    await expect(bookmark).toHaveAttribute(owner === "wird" ? "aria-checked" : "aria-pressed", "true");
    await page.screenshot({ path: info.outputPath("bookmarked.png") });
    await focus.click();
    const exit = bottom.getByTestId("mushaf-focus-exit");
    await expect(exit).toHaveText("");
    await expect(exit).toBeFocused();
    await page.screenshot({ path: info.outputPath("focus.png") });
    await exit.click();
    await expect(focus).toBeFocused();
    await opener.click();
    const index = reader.getByTestId("mushaf-index-inline");
    await expect(index).toBeVisible();
    await expect(paper).toBeHidden();
    const panel = index.getByRole("tabpanel");
    const search = index.getByRole("searchbox");
    const topBounds = (await top.boundingBox())!;
    const bottomBounds = (await bottom.boundingBox())!;
    const bounds = (await index.boundingBox())!;
    expect(bounds.y).toBeCloseTo(topBounds.y + topBounds.height, 0);
    expect(bounds.y + bounds.height).toBeCloseTo(bottomBounds.y, 0);
    await page.screenshot({ path: info.outputPath("index.png") });
    await panel.evaluate((node) => {
      node.scrollTop = 180;
    });
    expect(await panel.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    await expect(search).toBeInViewport();
    expect(await top.boundingBox()).toEqual(topBounds);
    expect(await bottom.boundingBox()).toEqual(bottomBounds);
    expect((await new AxeBuilder({ page }).include(".mushaf-reader-viewer").analyze()).violations).toEqual([]);
    await search.fill(owner === "wird" ? "2" : "18");
    await expect(panel.locator(".mushaf-index-surah").first()).toBeVisible();
    await back.click();
    await expect(index).toHaveCount(0);
    await expect(opener).toBeFocused();
    await folio.click();
    await expect(index.getByRole("tab", { selected: true })).toHaveAttribute("id", /jump$/);
    await page.keyboard.press("Escape");
    await expect(index).toHaveCount(0);
    await expect(folio).toBeFocused();
  });
}

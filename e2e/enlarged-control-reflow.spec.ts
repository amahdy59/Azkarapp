import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";

async function expectTextInside(owner: Locator, text: Locator) {
  const bounds = await owner.boundingBox();
  const ink = await text.evaluate((node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
  expect(ink.left).toBeGreaterThanOrEqual(bounds!.x - 1);
  expect(ink.right).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  expect(ink.top).toBeGreaterThanOrEqual(bounds!.y - 1);
  expect(ink.bottom).toBeLessThanOrEqual(bounds!.y + bounds!.height + 1);
}

for (const language of ["ar", "en"] as const) {
  test(`enlarged counting controls, titles and Settings actions reflow in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", reduceMotion: true, hapticFeedback: false },
          profile: { isGuest: true },
        }),
      );
    }, language);
    for (const reading of [
      { route: "/counter", counter: "custom-counter-surface" },
      { route: "/friday/salawat", counter: "salawat-counter" },
      { route: "/azkar/morning/1", counter: "counter-surface" },
    ]) {
      await page.goto(`/#${reading.route}`);
      const counter = page.getByTestId(reading.counter);
      await expect(counter).toBeVisible();
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      await page.evaluate(() => document.fonts.ready);
      if (reading.route !== "/azkar/morning/1") {
        const title = page.locator(".reading-compact-header h1");
        await expect(title).toBeVisible();
        expect((await title.boundingBox())!.width).toBeGreaterThan(200);
        await expectTextInside(page.locator(".reading-compact-header .shared-screen-header"), title);
      }
      await counter.scrollIntoViewIfNeeded();
      await expectTextInside(counter, counter.locator(".adaptive-counter-content"));
      if (reading.route === "/counter") {
        for (const id of ["custom-counter-prev-btn", "custom-counter-next-btn"]) {
          const nav = page.getByTestId(id);
          await nav.scrollIntoViewIfNeeded();
          const bounds = await nav.boundingBox();
          const owner = await page.getByTestId("reader-card").boundingBox();
          expect(bounds!.x).toBeGreaterThanOrEqual(owner!.x);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(owner!.x + owner!.width);
          expect(bounds!.width).toBeGreaterThanOrEqual(44);
        }
        const summary = page.getByTestId("masbaha-settings-summary");
        await summary.scrollIntoViewIfNeeded();
        for (const line of await summary.locator("p").all()) await expectTextInside(summary, line);
        const settings = (await page.getByTestId("masbaha-settings-trigger").boundingBox())!;
        expect(settings.width).toBeGreaterThanOrEqual(44);
        expect(settings.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      await page.screenshot({ path: info.outputPath(`${reading.counter}-200.png`) });
    }
    await page.goto("/#/azkar");
    const category = page.getByTestId("category-card-after_prayer");
    await category.scrollIntoViewIfNeeded();
    await expectTextInside(category, category.locator('[data-slot="category-copy"]'));
    const badge = await category.locator('[data-slot="category-icon"]').boundingBox();
    expect(badge!.width).toBe(44);
    expect((await category.boundingBox())!.height).toBeLessThanOrEqual(
      (await page.locator(".library-panel").boundingBox())!.height,
    );
    await page.screenshot({ path: info.outputPath("library-card-200.png") });
    await page.goto("/#/settings/account-data");
    const downloads = page.getByRole("button", { name: t(language, "dataSafety.downloads"), exact: true });
    await downloads.scrollIntoViewIfNeeded();
    await expectTextInside(downloads, downloads);
    const bounds = await downloads.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await page.screenshot({ path: info.outputPath("account-actions-200.png") });
    await page.goto("/#/settings/notifications");
    const toggle = page.getByRole("switch").first();
    await toggle.scrollIntoViewIfNeeded();
    await page.keyboard.press("Tab");
    await toggle.focus();
    await expect
      .poll(() => toggle.evaluate((node) => getComputedStyle(node).boxShadow))
      .toMatch(/3px.*inset|inset.*3px/);
  });
}

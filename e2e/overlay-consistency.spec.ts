import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";

async function seed(page: Page, language: "ar" | "en", still = true) {
  await page.addInitScript(
    ({ language, still }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            reduceMotion: still,
            themeMode: "midnight",
            appMaterial: "glass",
            mushafTheme: "follow-app",
          },
          profile: { isGuest: true },
          khatmahPage: 42,
        }),
      );
    },
    { language, still },
  );
  await page.route("**/fonts/qcf-v2/**", (route) => route.abort());
}

async function insideBars(panel: Locator, top: Locator, bottom: Locator) {
  const [p, a, b] = await Promise.all([panel.boundingBox(), top.boundingBox(), bottom.boundingBox()]);
  expect(p).not.toBeNull();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  expect(p!.y).toBeGreaterThanOrEqual(a!.y + a!.height - 1);
  expect(p!.y + p!.height).toBeLessThanOrEqual(b!.y + 1);
  expect(p!.height).toBeGreaterThan(150);
  for (const bar of [top, bottom]) {
    expect(
      await bar.evaluate((node) => {
        const box = node.getBoundingClientRect();
        return (
          !node.closest("[inert], [aria-hidden=true]") &&
          node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
        );
      }),
    ).toBe(true);
  }
}

for (const language of ["ar", "en"] as const) {
  for (const owner of ["wird", "surah"] as const) {
    test(`reader toolbar panels share index bounds and recover focus ${owner} ${language} @cross-browser`, async ({
      page,
    }, info) => {
      await seed(page, language);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(owner === "wird" ? "/#/quran/42" : "/#/azkar/friday-kahf/1");
      if (owner === "surah") await page.getByTestId("reader-mushaf-button").click();
      const canvas = page.locator("[data-mushaf-page]").first();
      await expect(canvas).toBeVisible();
      const position = await canvas.getAttribute("data-mushaf-page");
      const more = page.getByTestId(owner === "wird" ? "mushaf-more-actions" : "mushaf-immersive-more");
      const top = page.locator(".mushaf-control-band--top");
      const bottom = page.locator(".mushaf-control-band--bottom");
      await more.click();
      const options = page.getByTestId("mushaf-quick-menu");
      await expect(options).toHaveAttribute("data-toolbar-panel", "");
      await expect(options).toHaveAttribute("data-overlay-origin", "top");
      await expect(options).toBeFocused();
      await insideBars(options, top, bottom);
      await page.screenshot({ path: info.outputPath(`${owner}-${language}-options.png`) });
      await options.getByTestId("mushaf-quick-settings").click();
      const settings = page.getByTestId("mushaf-settings-sheet");
      await expect(options).toBeHidden();
      await expect(settings).toHaveAttribute("data-toolbar-panel", "");
      await insideBars(settings, top, bottom);
      await page.keyboard.press("Escape");
      await expect(settings).toBeHidden();
      await expect(more).toBeFocused();
      const jump = page.getByTestId("mushaf-furniture-page-btn");
      await jump.click();
      const index = page.getByTestId("mushaf-index-inline");
      await expect(index).toHaveAttribute("data-overlay-origin", "bottom");
      await more.click();
      await expect(index).toBeHidden();
      await expect(options).toBeVisible();
      // One close leaves the reader in place, with the opener still reachable.
      await page.keyboard.press("Escape");
      await expect(more).toBeFocused();
      await expect(canvas).toBeVisible();
      expect(await canvas.getAttribute("data-mushaf-page")).toBe(position);
      await page.setViewportSize({ width: 320, height: 568 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "32px";
      });
      await more.click();
      await insideBars(options, top, bottom);
      const close = options.getByTestId("modal-close-button");
      await expect(close).toBeVisible();
      expect((await close.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const body = options.locator(".overflow-y-auto");
      expect(await body.evaluate((node) => node.clientHeight)).toBeGreaterThanOrEqual(96);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      await page.screenshot({ path: info.outputPath(`${owner}-${language}-large-text.png`) });
      const scan = await new AxeBuilder({ page })
        .include("[data-toolbar-panel]")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      await options.getByTestId("mushaf-quick-settings").scrollIntoViewIfNeeded();
      await options.getByTestId("mushaf-quick-settings").click();
      await expect(settings).toBeVisible();
      await expect(settings.getByTestId("modal-close-button")).toBeVisible();
    });
  }
}

for (const mode of ["normal", "app-still", "system-still"] as const) {
  test(`overlay family motion follows ${mode} @cross-browser`, async ({ page }) => {
    await seed(page, "en", mode === "app-still");
    await page.emulateMedia({ reducedMotion: mode === "system-still" ? "reduce" : "no-preference" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#/quran/42");
    await page.getByTestId("mushaf-more-actions").click();
    const panel = page.getByTestId("mushaf-quick-menu");
    await expect(panel).toBeVisible();
    const motion = await panel.evaluate((node) => {
      const style = getComputedStyle(node);
      return { name: style.animationName, duration: style.animationDuration };
    });
    expect(motion.name).toBe(mode === "normal" ? "overlay-arrive" : "none");
    if (mode === "normal") expect(parseFloat(motion.duration)).toBeCloseTo(0.26);
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });
}

test("an open reader tool adapts through phone, tablet and desktop without losing its return target @cross-browser", async ({
  page,
}, info) => {
  await seed(page, "en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/quran/42");
  await page.getByTestId("mushaf-more-actions").click();
  const options = page.getByTestId("mushaf-quick-menu");
  await expect(options).toHaveAttribute("data-toolbar-panel", "");
  await page.setViewportSize({ width: 834, height: 1112 });
  await expect(options).toHaveAttribute("role", "dialog");
  await expect(options).not.toHaveAttribute("data-toolbar-panel");
  await page.screenshot({ path: info.outputPath("tablet-options.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.keyboard.press("Escape");
  const rail = page.getByTestId("mushaf-rail-more");
  await expect(rail).toBeFocused();
  await rail.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(options).toHaveAttribute("data-toolbar-panel", "");
  await insideBars(options, page.locator(".mushaf-control-band--top"), page.locator(".mushaf-control-band--bottom"));
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("mushaf-more-actions")).toBeFocused();
  await expect(page.locator('[data-mushaf-page="42"]')).toBeVisible();
});

test("global top sheets and anchored menus share the protected overlay family @cross-browser", async ({ page }) => {
  await seed(page, "en");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/friday/salawat");
  await page.getByRole("button", { name: "More options", exact: true }).click();
  const menu = page.locator('[data-slot="dropdown-menu-content"]');
  await expect(menu).toHaveAttribute("data-overlay-surface", "contextual");
  await expect(menu).toHaveCSS("background-color", "rgb(15, 23, 42)");
  await page.keyboard.press("Escape");
  await page.goto("/#/counter");
  await page.getByRole("button", { name: t("en", "counter.settings"), exact: true }).click();
  const sheet = page.getByTestId("masbaha-settings-sheet");
  await expect(sheet).toHaveAttribute("data-overlay-surface", "sheet");
  await expect(sheet).toHaveAttribute("data-overlay-origin", "top");
  await expect(sheet).toBeFocused();
  expect((await sheet.boundingBox())!.y).toBeLessThanOrEqual(1);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

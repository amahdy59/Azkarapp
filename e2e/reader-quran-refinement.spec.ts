import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 820, 1440]) {
    test(`calm Quran typography and focused menu ${language}/${width} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, textSize: "medium", routineMode: "complete" },
            routineMode: "complete",
            profile: { isGuest: true },
          }),
        );
      }, language);
      const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-76c") + 1;
      await page.goto(`/#/azkar/morning/${position}`);
      const passage = page.getByTestId("zikr-text");
      const basmalah = page.getByTestId("quran-basmalah");
      await expect(passage).toBeVisible();
      await expect(basmalah).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const measure = async () => {
        return passage.evaluate((element) => {
          // Read both boxes in one frame: a late page font can recenter the
          // reading group between separate browser round trips.
          const bounds = element.getBoundingClientRect();
          const prelude = document.querySelector('[data-testid="quran-basmalah"]')!.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            size: parseFloat(style.fontSize),
            leading: parseFloat(style.lineHeight),
            overflow: element.scrollWidth - element.clientWidth,
            gap: bounds.y - prelude.y - prelude.height,
          };
        });
      };
      const initial = await measure();
      expect(initial.size).toBeCloseTo(23, 1);
      expect(initial.leading).toBeCloseTo(37.95, 1);
      expect(initial.gap).toBeGreaterThanOrEqual(0);
      expect(initial.gap).toBeLessThanOrEqual(16);
      expect(initial.overflow).toBeLessThanOrEqual(1);
      const help = page.getByTestId("reader-help-trigger");
      if (width < 768) await expect(help).toBeHidden();
      else await expect(help).toBeVisible();
      const menuTrigger = page.getByRole("button", { name: t(language, "reader.menu"), exact: true });
      await menuTrigger.focus();
      await page.keyboard.press("Enter");
      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByText(t(language, "category.readAgain"), { exact: true })).toHaveCount(0);
      await expect(menu.getByText(t(language, "reader.keyboardShortcuts"), { exact: true })).toHaveCount(0);
      await expect(menu.getByText(t(language, "reader.enterFocus"), { exact: true })).toHaveCount(0);
      await expect(menu.getByText(t(language, "reader.save"), { exact: true })).toBeVisible();
      await expect(menu.getByText(t(language, "reader.resetCounter"), { exact: true })).toBeVisible();
      await page.screenshot({ path: info.outputPath("reader-menu.png") });
      await page.keyboard.press("Escape");
      await expect(menuTrigger).toBeFocused();
      await page.getByRole("button", { name: t(language, "reader.enterFocus"), exact: true }).click();
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reading-focus", "true");
      await expect(page.getByRole("button", { name: t(language, "reader.exitFocus"), exact: true })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reading-focus", "false");
      await page.screenshot({ path: info.outputPath("quran-reading.png") });
      await page.locator("html").evaluate((element) => {
        element.style.fontSize = "32px";
      });
      await expect.poll(async () => (await measure()).size).toBeCloseTo(46, 1);
      expect((await measure()).overflow).toBeLessThanOrEqual(1);
      await page.screenshot({ path: info.outputPath("quran-reading-enlarged.png") });
      const scan = await new AxeBuilder({ page })
        .include('[data-testid="reader-screen"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
    });
  }
}

test("counter keyboard feedback stays finite, durable and reduced-motion aware @cross-browser", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => {
    if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", routineMode: "complete" },
        routineMode: "complete",
        profile: { isGuest: true },
      }),
    );
  });
  const position = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.repetitionCount === 100) + 1;
  expect(position).toBeGreaterThan(0);
  await page.goto(`/#/azkar/morning/${position}`);
  const counter = page.getByTestId("counter-surface");
  await counter.focus();
  await page.keyboard.down("Space");
  await expect(counter).toHaveClass(/is-pressed/);
  await expect(counter).toHaveAttribute("aria-label", /1 \/ 100$/);
  await page.keyboard.down("Space");
  await expect(counter).toHaveAttribute("aria-label", /1 \/ 100$/);
  await page.keyboard.up("Space");
  await expect(counter).not.toHaveClass(/is-pressed/);
  await page.reload();
  await expect(counter).toHaveAttribute("aria-label", /1 \/ 100$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await counter.focus();
  await page.keyboard.down("Enter");
  await expect(counter).not.toHaveClass(/is-pressed/);
  await page.keyboard.up("Enter");
  await expect(counter).toHaveAttribute("aria-label", /2 \/ 100$/);
  await page.screenshot({ path: info.outputPath("counter-keyboard.png") });
});

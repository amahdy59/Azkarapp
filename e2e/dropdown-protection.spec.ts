import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator } from "@playwright/test";
import { t } from "../src/app/i18n";
import { chooseWirdOption } from "./helpers/wird";

async function expectProtectedPopup(popup: Locator, width: number, height: number) {
  await expect(popup).toBeVisible();
  // Floating placement settles after the portal's first visible frame.
  await expect
    .poll(() =>
      popup.evaluate(
        (node, viewport) => {
          const rect = node.getBoundingClientRect();
          return rect.x >= 7 && rect.y >= 7 && rect.right <= viewport.width - 7 && rect.bottom <= viewport.height - 7;
        },
        { width, height },
      ),
    )
    .toBe(true);
  const geometry = await popup.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const background = getComputedStyle(node).backgroundColor;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1, 1);
    const points = [
      [0.1, 0.1],
      [0.5, 0.5],
      [0.9, 0.9],
    ];
    return {
      x: rect.x,
      y: rect.y,
      right: rect.right,
      bottom: rect.bottom,
      alpha: ctx.getImageData(0, 0, 1, 1).data[3],
      overflow: node.scrollWidth > node.clientWidth + 1,
      aboveContent: points.every(([x, y]) =>
        node.contains(document.elementFromPoint(rect.x + rect.width * x!, rect.y + rect.height * y!)),
      ),
      outsideCard: node.closest(".app-shell") === null,
    };
  });
  expect(geometry.alpha).toBe(255);
  expect(geometry.x).toBeGreaterThanOrEqual(7);
  expect(geometry.y).toBeGreaterThanOrEqual(7);
  expect(geometry.right).toBeLessThanOrEqual(width - 7);
  expect(geometry.bottom).toBeLessThanOrEqual(height - 7);
  expect(geometry.overflow).toBe(false);
  expect(geometry.aboveContent).toBe(true);
  expect(geometry.outsideCard).toBe(true);
}

for (const fallback of [
  "high-contrast",
  "reduced-transparency",
  "no-filter",
  "forced-colors",
  "deuteranopia",
  "protanopia",
  "tritanopia",
] as const) {
  test(`shared dropdown accessibility fallback ${fallback} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 700 });
    if (fallback === "forced-colors") await page.emulateMedia({ forcedColors: "active" });
    await page.addInitScript((fallback) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: "en",
            themeMode: "light",
            appMaterial: "glass",
            reduceMotion: true,
            highContrast: fallback === "high-contrast",
            reduceTransparency: fallback === "reduced-transparency",
            colorBlindSupport: ["deuteranopia", "protanopia", "tritanopia"].includes(fallback) ? fallback : "none",
          },
          profile: { isGuest: true },
          quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
        }),
      );
    }, fallback);
    if (fallback === "no-filter") {
      await page.route("**/assets/*.css", async (route) => {
        const response = await route.fetch();
        const body = (await response.text()).replace(
          /@supports\s*\(\s*backdrop-filter\s*:\s*blur\(1px\)\s*\)/g,
          "@supports (unknown-frost: unsupported)",
        );
        await route.fulfill({ response, body });
      });
    }
    await page.goto("/#/quran-wird");
    await page.getByRole("button", { name: t("en", "mushaf.editPlan"), exact: true }).click();
    const plan = page.getByRole("combobox", { name: t("en", "mushaf.readingPlanLabel"), exact: true });
    await plan.click();
    await expectProtectedPopup(page.locator('[data-slot="select-content"]'), 320, 700);
    await page.keyboard.press("Escape");
    await chooseWirdOption(page, "en", "plan", "repeating");
    const trigger = page.getByRole("combobox", { name: /^Select Juz/ });
    await trigger.click();
    await expectProtectedPopup(page.locator('[data-slot="combobox-content"]'), 320, 700);
    await page.screenshot({ path: testInfo.outputPath(`dropdown-${fallback}.png`) });
    await page.keyboard.press("Escape");
    await page.goto("/#/counter");
    await page.getByRole("button", { name: "More options" }).click();
    await expectProtectedPopup(page.locator('[data-slot="dropdown-menu-content"]'), 320, 700);
  });
}

for (const language of ["ar", "en"] as const) {
  for (const themeMode of ["light", "midnight", "dark"] as const) {
    for (const appMaterial of ["solid", "glass"] as const) {
      test(`dropdown protection ${language} ${themeMode} ${appMaterial} @cross-browser`, async ({ page }, testInfo) => {
        await page.addInitScript(
          ({ language, themeMode, appMaterial }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            localStorage.setItem(
              "azkarapp.state.v1",
              JSON.stringify({
                settings: { language, themeMode, appMaterial, reduceMotion: true },
                profile: { isGuest: true },
                quranWirdPlan: { kind: "daily", dailyPages: 4, startedDayKey: "2026-10-01" },
              }),
            );
          },
          { language, themeMode, appMaterial },
        );
        await page.goto("/#/quran-wird");
        await page.getByRole("button", { name: t(language, "mushaf.editPlan"), exact: true }).click();
        const plan = page.getByRole("combobox", { name: t(language, "mushaf.readingPlanLabel"), exact: true });
        await plan.click();
        const initialViewport = page.viewportSize()!;
        await expectProtectedPopup(
          page.locator('[data-slot="select-content"]'),
          initialViewport.width,
          initialViewport.height,
        );
        await page.keyboard.press("Escape");
        await chooseWirdOption(page, language, "plan", "repeating");
        const trigger = page.getByRole("combobox", { name: new RegExp(`^${t(language, "mushaf.selectJuz")}`) });
        const popup = page.locator('[data-slot="combobox-content"]');
        for (const width of [320, 390, 834, 1280]) {
          await page.setViewportSize({ width, height: 700 });
          await trigger.click();
          await expectProtectedPopup(popup, width, 700);
          if (width === 390)
            await page.screenshot({ path: testInfo.outputPath(`phone-${language}-${themeMode}-${appMaterial}.png`) });
          const search = popup.getByRole("textbox");
          await expect(search).toBeFocused();
          expect(
            await search.evaluate((node) => {
              const style = getComputedStyle(node);
              return Number.parseFloat(style.paddingInlineStart);
            }),
          ).toBeGreaterThanOrEqual(32);
          // English page ranges also contain 30; search the full option label.
          await search.fill(language === "en" ? "Juz 30" : "30");
          await expect(popup.getByRole("option")).toHaveCount(1);
          await search.press("ArrowDown");
          await search.press("Enter");
          await expect(popup).toHaveCount(0);
          await expect(trigger).toBeFocused();
        }
        await page.setViewportSize({ width: 320, height: 480 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await trigger.click();
        await expectProtectedPopup(popup, 320, 480);
        const list = popup.getByRole("listbox");
        expect(await list.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
        await popup.getByRole("option").last().scrollIntoViewIfNeeded();
        await expectProtectedPopup(popup, 320, 480);
        await page.screenshot({ path: testInfo.outputPath(`protected-${language}-${themeMode}-${appMaterial}.png`) });
        expect((await new AxeBuilder({ page }).include('[data-slot="combobox-content"]').analyze()).violations).toEqual(
          [],
        );
        await popup.getByRole("textbox").press("Escape");
        await expect(trigger).toBeFocused();
        await trigger.click();
        await popup.getByRole("textbox").press("Tab");
        await expect(popup).toHaveCount(0);
        await expect(page.getByRole("button", { name: t(language, "mushaf.cancelPlan"), exact: true })).toBeFocused();
      });
    }
  }
}

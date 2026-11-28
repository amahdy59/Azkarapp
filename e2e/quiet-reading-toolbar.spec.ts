import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

for (const scenario of [
  { language: "ar", width: 390, height: 872, themeMode: "midnight", appMaterial: "glass", scale: 1 },
  { language: "en", width: 390, height: 844, themeMode: "light", appMaterial: "solid", scale: 1 },
  { language: "ar", width: 320, height: 740, themeMode: "light", appMaterial: "solid", scale: 2 },
  { language: "en", width: 834, height: 1112, themeMode: "dark", appMaterial: "glass", scale: 1 },
  { language: "ar", width: 1440, height: 900, themeMode: "midnight", appMaterial: "solid", scale: 1 },
  { language: "en", width: 740, height: 390, themeMode: "light", appMaterial: "solid", scale: 1 },
] as const) {
  for (const inline of [false, true]) {
    test(`quiet ${inline ? "inline" : "excerpt"} toolbar ${scenario.language}/${scenario.width}/${scenario.scale} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize(scenario);
      await page.addInitScript((scenario) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language: scenario.language,
              themeMode: scenario.themeMode,
              appMaterial: scenario.appMaterial,
              reduceMotion: true,
              routineModes: { before_sleep: "complete" },
            },
            profile: { isGuest: true },
          }),
        );
      }, scenario);
      const position = getAzkarForMode("before_sleep", "complete").findIndex(({ id }) => id === "s-hm-99-ikhlas") + 1;
      await page.goto(inline ? "/#/quran/42" : `/#/azkar/before-sleep/${position}`);
      const opener = page.getByRole("button", { name: t(scenario.language, "quranZoom.open"), exact: true });
      await opener.click();
      const reader = page.getByTestId("quran-enlarged-reading");
      const text = reader.getByTestId("quran-enlarged-text");
      await expect(text).toHaveAttribute("data-layout-ready", "true");
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
        node.style.setProperty("--safe-area-inset-top", "32px");
        node.style.setProperty("--safe-area-inset-bottom", "24px");
      }, scenario.scale);
      if (inline) {
        const header = page.getByTestId("quran-zoom-header");
        await expect(header).toBeVisible();
        await expect(page.getByTestId("enlarged-reading-toolbar")).toHaveCount(0);
        await expect(page.locator(".quran-portion-navigation")).toHaveCount(0);
        const bounds = (await header.boundingBox())!;
        expect(bounds.y).toBeGreaterThanOrEqual(0);
        for (const control of await header.getByRole("button").all()) {
          const box = (await control.boundingBox())!;
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.y).toBeGreaterThanOrEqual(32);
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(scenario.width + 1);
          expect(
            await control.evaluate((node) => {
              const r = node.getBoundingClientRect();
              return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
            }),
          ).toBe(true);
        }
        const words = await text.locator("[data-zoom-word]").allTextContents();
        await header.getByRole("button", { name: t(scenario.language, "quranZoom.larger"), exact: true }).click();
        expect(await text.locator("[data-zoom-word]").allTextContents()).toEqual(words);
        expect(await reader.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        expect((await new AxeBuilder({ page }).include(".mushaf-reader-viewer").analyze()).violations).toEqual([]);
        await page.screenshot({
          path: info.outputPath(`quiet-inline-${scenario.language}-${scenario.width}.png`),
          scale: "css",
        });
        await header.getByRole("button", { name: t(scenario.language, "quranZoom.pageView"), exact: true }).click();
        await expect(reader).toBeHidden();
        await expect(opener).toBeFocused();
        return;
      }
      const toolbar = reader.getByTestId("enlarged-reading-toolbar");
      await expect(toolbar).toBeVisible();
      if (scenario.scale === 1) expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(66);
      if (!inline && scenario.width === 390 && scenario.scale === 1) {
        await expect(toolbar.getByRole("navigation")).toHaveCount(0);
        await expect(reader.getByRole("button", { name: t(scenario.language, "quranZoom.returnReading") })).toHaveCount(
          0,
        );
      }
      const size = toolbar.getByTestId("enlarged-size-trigger");
      const before = await reader.locator(".quran-enlarged-viewport").boundingBox();
      const words = await text.locator("[data-zoom-word]").allTextContents();
      await size.click();
      const popup = reader.getByTestId("enlarged-size-popover");
      await expect(popup).toHaveAttribute("data-dropdown-surface", "");
      const range = popup.getByRole("slider", { name: t(scenario.language, "quranZoom.size"), exact: true });
      await expect(range).toBeFocused();
      const area = (await popup.boundingBox())!;
      expect(area.x).toBeGreaterThanOrEqual(0);
      expect(area.x + area.width).toBeLessThanOrEqual(scenario.width + 1);
      expect(area.y).toBeGreaterThanOrEqual(32);
      expect(area.y + area.height).toBeLessThanOrEqual(scenario.height - 24 + 1);
      expect(await reader.locator(".quran-enlarged-viewport").boundingBox()).toEqual(before);
      expect(await text.locator("[data-zoom-word]").allTextContents()).toEqual(words);
      await page.screenshot({
        path: info.outputPath(`size-open-${inline}-${scenario.language}-${scenario.width}.png`),
        scale: "css",
      });
      await range.press("Home");
      await expect(range).toHaveValue("125");
      await expect(popup.getByRole("button", { name: t(scenario.language, "quranZoom.smaller") })).toBeDisabled();
      await range.press("End");
      await expect(range).toHaveValue("250");
      await expect(popup.getByRole("button", { name: t(scenario.language, "quranZoom.larger") })).toBeDisabled();
      await popup.getByRole("button", { name: t(scenario.language, "quranZoom.smaller") }).click();
      await expect(range).toHaveValue("225");
      await popup.press("Escape");
      await expect(popup).toBeHidden();
      await expect(size).toBeFocused();
      await expect(reader).toBeVisible();
      await expect(text).toHaveAttribute("data-layout-ready", "true");
      for (const button of await toolbar.getByRole("button").all()) {
        await button.scrollIntoViewIfNeeded();
        const box = (await button.boundingBox())!;
        // Firefox may serialize a transformed 44px edge as 43.999984px.
        // Keep the 44 CSS px requirement, ignoring only sub-millipixel noise.
        expect(Number(box.width.toFixed(3))).toBeGreaterThanOrEqual(44);
        expect(Number(box.height.toFixed(3))).toBeGreaterThanOrEqual(44);
        await expect
          .poll(() =>
            button.evaluate((node) => {
              const r = node.getBoundingClientRect();
              return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
            }),
          )
          .toBe(true);
      }
      expect(await reader.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="quran-enlarged-reading"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`quiet-${inline}-${scenario.language}-${scenario.width}.png`),
        scale: "css",
      });
      await reader.getByTestId("modal-close-button").click();
      await expect(reader).toBeHidden();
      await expect(opener).toBeFocused();
    });
  }
}

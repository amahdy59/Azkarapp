import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";
import { AUTHENTIC_AZKAR_COLLECTION } from "../src/app/content/authenticAzkar";

for (const language of ["ar", "en"] as const) {
  for (const route of ["/counter", "/friday/salawat"]) {
    test(`counter footer and longer picker ${route} ${language} @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        if (!localStorage.getItem("azkarapp.state.v1"))
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: {
                language,
                reduceMotion: true,
                readerToolLabels: false,
                themeMode: language === "ar" ? "midnight" : "light",
                appMaterial: language === "ar" ? "solid" : "glass",
              },
              profile: { isGuest: true },
              masbahaState: {
                selectedZikrId: "auth_la_ilaha_illallah_wahdahu",
                count: 16,
                target: 100,
                laps: 0,
                items: { auth_la_ilaha_illallah_wahdahu: { count: 16, target: 100, laps: 0 } },
              },
            }),
          );
      }, language);
      await page.goto(`/#${route}`);
      const counter = page.getByTestId(route === "/counter" ? "custom-counter-surface" : "salawat-counter");
      const benefit = page.getByTestId(
        route === "/counter" ? "custom-counter-benefit-dock-button" : "salawat-benefit-dock-button",
      );
      const row = page.locator(".reader-tools-row");
      const actions = row.locator("button[data-press-compact]");
      await expect(counter).toBeVisible();
      await expect(actions).toHaveCount(4);
      await page.evaluate(() => document.fonts.ready);
      const before = await counter.getAttribute("aria-label");
      await expect(benefit.getByText(t(language, "reader.referencesButton"), { exact: true })).toBeHidden();
      for (const action of await actions.all()) {
        await expect(action.locator(".reader-tool-label")).toHaveCount(1);
        await expect(action.locator(".reader-tool-label")).toBeHidden();
        await expect(action).toBeInViewport({ ratio: 1 });
        const bounds = (await action.boundingBox())!;
        expect(bounds.width).toBeCloseTo(52, 0);
        expect(bounds.height).toBeCloseTo(52, 0);
        await expect(action).toHaveAccessibleName(/\S/);
      }
      await benefit.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(benefit).toBeFocused();
      await expect(counter).toHaveAttribute("aria-label", before!);
      await page.screenshot({
        path: info.outputPath(`${language}-${route === "/counter" ? "masbaha" : "salawat"}-icons.png`),
      });

      const trigger = page.getByTestId(route === "/counter" ? "counter-zikr-filter" : "salawat-formula-filter");
      for (const enlarged of [false, true]) {
        await page.setViewportSize({ width: enlarged ? 320 : 390, height: 844 });
        if (enlarged) await page.locator("html").evaluate((root) => (root.style.fontSize = "200%"));
        await trigger.click();
        const menu = page.getByRole("menu");
        await expect(menu).toBeVisible();
        await expect
          .poll(() =>
            menu.evaluate((node) => {
              const r = node.getBoundingClientRect();
              return r.x >= 15 && r.right <= innerWidth - 15 && r.y >= 15 && r.bottom <= innerHeight - 15;
            }),
          )
          .toBe(true);
        expect(await menu.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        expect(
          await menu
            .getByRole("menuitemradio")
            .evaluateAll((nodes) => nodes.every((node) => node.getBoundingClientRect().height >= 64)),
        ).toBe(true);
        expect(
          await menu.evaluate(
            (node) => node.hasAttribute("data-dropdown-surface") && node.closest(".app-shell") === null,
          ),
        ).toBe(true);
        expect(
          await menu.evaluate((node) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            context.fillStyle = getComputedStyle(node).backgroundColor;
            context.fillRect(0, 0, 1, 1);
            const rect = node.getBoundingClientRect();
            return (
              context.getImageData(0, 0, 1, 1).data[3] === 255 &&
              node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
            );
          }),
        ).toBe(true);
        if (route === "/counter") {
          const item = AUTHENTIC_AZKAR_COLLECTION[2]!;
          const option = page.getByTestId(`zikr-option-${item.id}`);
          await expect(option).toContainText(language === "ar" ? item.textAr : item.textEn);
          await expect(option.locator(".devotional-picker-preview")).toHaveCSS("-webkit-line-clamp", "2");
        }
        await page.screenshot({
          path: info.outputPath(
            `${language}-${route === "/counter" ? "masbaha" : "salawat"}-menu-${enlarged ? "200" : "100"}.png`,
          ),
        });
        expect(
          (
            await new AxeBuilder({ page })
              .include('[role="menu"]')
              .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.keyboard.press("End");
        await expect(menu.getByRole("menuitemradio").last()).toBeFocused();
        await expect(menu.getByRole("menuitemradio").last()).toBeInViewport();
        await page.keyboard.press("Escape");
        await expect(menu).toBeHidden();
        await expect(trigger).toBeFocused();
        await expect(counter).toHaveAttribute("aria-label", before!);
      }
      await page.goto("/#/settings/reading");
      await page.getByRole("radio", { name: t(language, "settings.iconsWithLabels"), exact: true }).click();
      await expect(page.locator("html")).toHaveAttribute("data-reader-tool-labels", "true");
      await expect
        .poll(() =>
          page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.readerToolLabels),
        )
        .toBe(true);
      await page.goto(`/#${route}`);
      await page.locator("html").evaluate((root) => (root.style.fontSize = "200%"));
      await expect(benefit.locator(".reader-tool-label")).toBeVisible();
      for (const action of await actions.all()) {
        await expect(action.locator(".reader-tool-label")).toBeVisible();
        await action.focus();
        await expect(action).toBeInViewport({ ratio: 1 });
        expect(await action.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      }
      await page.screenshot({
        path: info.outputPath(`${language}-${route === "/counter" ? "masbaha" : "salawat"}-labels.png`),
      });
    });
  }
}

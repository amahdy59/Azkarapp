import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import AxeBuilder from "@axe-core/playwright";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390]) {
    for (const enlarged of [false, true]) {
      test(`@cross-browser routine actions stay inside ${language} ${width}px ${enlarged ? "200%" : "100%"}`, async ({
        page,
      }, testInfo) => {
        await page.clock.setFixedTime(new Date("2026-10-18T08:00:00+03:00"));
        await page.setViewportSize({ width, height: 1000 });
        await page.addInitScript(
          ({ language, ids }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            localStorage.setItem(
              "azkarapp.state.v1",
              JSON.stringify({
                settings: { language, themeMode: "midnight", reduceMotion: true, homeMaterial: "glass" },
                profile: { isGuest: true },
                completed: { morning: ids },
              }),
            );
          },
          {
            language,
            ids: getAzkarForMode("morning", "complete")
              .slice(0, 21)
              .map((zikr) => zikr.id),
          },
        );
        await page.goto("/#/home");
        if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        const card = page.getByTestId("home-routine-card");
        const primary = page.getByTestId("home-primary-cta");
        const share = page.getByTestId("home-quick-share");
        await expect(primary).toHaveAccessibleName(/تابع|Continue/);
        await expect(share).toBeVisible();
        await expect
          .poll(() =>
            card.evaluate((node) => {
              const primary = node.querySelector<HTMLElement>('[data-testid="home-primary-cta"]')!;
              const share = node.querySelector<HTMLElement>('[data-testid="home-quick-share"]')!;
              const row = primary.parentElement!.getBoundingClientRect();
              const a = primary.getBoundingClientRect();
              const b = share.getBoundingClientRect();
              return (
                [a, b].every(
                  (box) =>
                    box.left >= row.left - 1 && box.right <= row.right + 1 && box.width >= 44 && box.height >= 44,
                ) &&
                (a.right <= b.left || b.right <= a.left) &&
                Math.abs(a.height - b.height) <= 1 &&
                Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2) <= 1
              );
            }),
          )
          .toBe(true);
        const label = primary.locator("span");
        await expect(label).toHaveCSS("text-overflow", "ellipsis");
        await expect(primary).toHaveAccessibleName((await label.textContent())!);
        if (enlarged) expect(await label.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
        await share.focus();
        await expect(share).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(primary).toBeFocused();
        await card.scrollIntoViewIfNeeded();
        await card.screenshot({ path: testInfo.outputPath("routine-actions.png") });
        await primary.click();
        await expect(page.getByTestId("home-routine-card")).toHaveCount(0);
      });
    }
  }
}

for (const themeMode of ["midnight", "dark", "light"] as const) {
  for (const homeMaterial of ["glass", "solid"] as const) {
    test(`routine action design in ${themeMode} ${homeMaterial}`, async ({ page }, testInfo) => {
      await page.clock.setFixedTime(new Date("2026-10-18T08:00:00+03:00"));
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.addInitScript(
        ({ themeMode, homeMaterial }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language: "ar", themeMode, homeMaterial, appMaterial: homeMaterial, reduceMotion: true },
              profile: { isGuest: true },
            }),
          );
        },
        { themeMode, homeMaterial },
      );
      await page.goto("/#/home");
      const primary = page.getByTestId("home-primary-cta");
      const share = page.getByTestId("home-quick-share");
      await expect(share).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      for (const highContrast of [false, true]) {
        await page
          .locator("html")
          .evaluate((root, highContrast) => root.classList.toggle("high-contrast", highContrast), highContrast);
        const metrics = await primary.evaluate((node) => {
          const share = document.querySelector<HTMLElement>('[data-testid="home-quick-share"]')!;
          const a = node.getBoundingClientRect();
          const b = share.getBoundingClientRect();
          return {
            height: a.height,
            shareHeight: b.height,
            width: b.width,
            radius: getComputedStyle(node).borderRadius,
            shareRadius: getComputedStyle(share).borderRadius,
          };
        });
        expect(metrics.shareHeight).toBeCloseTo(metrics.height, 0);
        expect(metrics.shareHeight).toBeGreaterThanOrEqual(52);
        expect(metrics.width).toBe(52);
        expect(metrics.radius).toBe(metrics.shareRadius);
        const scan = await new AxeBuilder({ page })
          .include('[data-testid="home-primary-cta"]')
          .include('[data-testid="home-quick-share"]')
          .analyze();
        expect(scan.violations).toEqual([]);
        await share.focus();
        await expect(share).toBeFocused();
        expect(
          await share.evaluate((node) => {
            const style = getComputedStyle(node);
            return style.boxShadow !== "none" || (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0);
          }),
        ).toBe(true);
        await page.getByTestId("home-routine-card").screenshot({
          path: `output/home-routine-actions-2026-10-18/${testInfo.project.name}-${themeMode}-${homeMaterial}${highContrast ? "-contrast" : ""}.png`,
        });
      }
      await share.hover();
      await expect(share).toBeEnabled();
    });
  }
}

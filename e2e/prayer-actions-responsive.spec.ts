import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const material of ["glass", "solid"] as const) {
  for (const language of ["ar", "en"] as const) {
    for (const theme of ["midnight", "light", "dark"] as const) {
      test(`prayer actions responsive ${language} ${theme} ${material} @cross-browser`, async ({ page }, testInfo) => {
        await page.clock.setFixedTime(new Date("2026-10-18T08:00:00+03:00"));
        await page.addInitScript(
          ({ language, theme, material }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            localStorage.setItem(
              "azkarapp.state.v1",
              JSON.stringify({
                settings: {
                  language,
                  themeMode: theme,
                  appMaterial: material,
                  homeMaterial: material,
                  reduceMotion: true,
                },
                profile: { isGuest: true },
              }),
            );
          },
          { language, theme, material },
        );
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto("/#/home");
        await page.getByTestId("prayer-card-fajr").getByRole("button").click();
        await page.evaluate(() => document.fonts.ready);
        const panel = page.getByTestId("home-prayer-moment");
        const row = panel.getByTestId("prayer-action-fajr-adhkar");
        const read = row.getByTestId("prayer-open-adhkar");
        const checkbox = row.getByRole("checkbox");
        const quote = panel.locator(".prayer-evidence-body");
        const disclosure = panel.locator(".prayer-evidence-toggle");
        await expect(quote).toBeVisible();
        await expect(disclosure).toBeHidden();
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          await read.scrollIntoViewIfNeeded();
          await expect(read).toBeVisible();
          // Compare related geometry in one layout sample: responsive font/
          // parent settling can occur between separate browser round trips.
          const { titleBox, sunriseBox } = await panel.evaluate((node) => {
            const rect = (element: Element) => {
              const { x, y, width, height } = element.getBoundingClientRect();
              return { x, y, width, height };
            };
            return {
              titleBox: rect(node.querySelector("h2")!),
              sunriseBox: rect(node.querySelector('[data-testid="prayer-sunrise-context"]')!),
            };
          });
          expect(sunriseBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height);
          expect(language === "ar" ? sunriseBox.x + sunriseBox.width : sunriseBox.x).toBeCloseTo(
            language === "ar" ? titleBox.x + titleBox.width : titleBox.x,
            0,
          );
          await expect(read).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
          await expect(read).toHaveCSS("background-image", "none");
          expect((await read.boundingBox())!.width).toBeLessThan(112);
          const controls = await row.locator("input, button").evaluateAll((nodes) =>
            nodes.map((node) => {
              const r = node.getBoundingClientRect();
              return { x: r.x, right: r.right, y: r.y, bottom: r.bottom, width: r.width, height: r.height };
            }),
          );
          for (const box of controls) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
          expect(
            controls[0]!.right <= controls[1]!.x ||
              controls[1]!.right <= controls[0]!.x ||
              controls[0]!.bottom <= controls[1]!.y ||
              controls[1]!.bottom <= controls[0]!.y,
          ).toBe(true);
          const labelBox = (await row.locator("label").boundingBox())!;
          const readBox = (await read.boundingBox())!;
          const wrapped = readBox.y >= labelBox.y + labelBox.height;
          const gap = wrapped
            ? readBox.y - (labelBox.y + labelBox.height)
            : Math.max(readBox.x - (labelBox.x + labelBox.width), labelBox.x - (readBox.x + readBox.width));
          expect(gap).toBeCloseTo(8, 0);
          if (width === 1440) {
            const { titleBox, sunriseBox, evidenceBox, virtueTitle, attributionBox } = await panel.evaluate((node) => {
              const rect = (selector: string) => {
                const { x, y, width, height } = node.querySelector(selector)!.getBoundingClientRect();
                return { x, y, width, height };
              };
              return {
                titleBox: rect("h2"),
                sunriseBox: rect('[data-testid="prayer-sunrise-context"]'),
                evidenceBox: rect('[data-testid="prayer-moment-virtue"]'),
                virtueTitle: rect(".prayer-evidence-desktop-title"),
                attributionBox: rect('[data-testid="prayer-virtue-attribution"]'),
              };
            });
            expect(Math.abs(virtueTitle.y - titleBox.y)).toBeLessThanOrEqual(1);
            expect(evidenceBox.y).toBeCloseTo(titleBox.y, 0);
            expect(virtueTitle.height).toBeCloseTo(titleBox.height, 0);
            const attribution = panel.getByTestId("prayer-virtue-attribution");
            expect(attributionBox.y).toBeCloseTo(sunriseBox.y, 0);
            await expect(attribution).toHaveCSS("font-size", "13px");
            expect(language === "ar" ? attributionBox.x + attributionBox.width : attributionBox.x).toBeCloseTo(
              language === "ar" ? virtueTitle.x + virtueTitle.width : virtueTitle.x,
              0,
            );
            await expect(panel.getByTestId("prayer-record-date")).toHaveCount(0);
            expect((await panel.boundingBox())!.height).toBeLessThanOrEqual(language === "ar" ? 240 : 300);
          }

          expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
          if (width <= 390) {
            await expect(disclosure).toBeVisible();
            await expect(quote).toBeHidden();
            await disclosure.press("Enter");
            await expect(quote).toBeVisible();
            await disclosure.press("Space");
            await expect(quote).toBeHidden();
          }
          await disclosure.evaluate((node) => (node as HTMLElement).blur());
          await panel.screenshot({
            path: `output/playwright/prayer-actions/${testInfo.project.name}-${language}-${theme}-${material}-${width}.png`,
          });
        }
        await checkbox.check();
        await expect(checkbox).toBeChecked();
        await checkbox.press("Space");
        await expect(checkbox).not.toBeChecked();
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "32px";
        });
        expect(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "";
        });
        expect(
          (await new AxeBuilder({ page }).include('[data-testid="home-prayer-moment"]').analyze()).violations,
        ).toEqual([]);
        await read.click();
        await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
      });
    }
  }
}

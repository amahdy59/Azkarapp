import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test.describe(`English page (${language})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.route("https://verses.quran.foundation/**", (route) => route.abort());
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true, mushafLayout: "single" },
            khatmahPage: 3,
          }),
        );
      }, language);
      await page.goto("/#/quran/3");
      await expect(page.locator('[data-mushaf-page="3"]')).toBeVisible();
      await page.getByTestId("mushaf-rail-more").click();
      await page.getByTestId("quick-page-translation-switch").click();
      await expect(page.getByTestId("mushaf-quick-menu")).toBeHidden();
      const english = page.locator(".quran-meaning-text");
      await expect(english.locator("p")).toHaveCount(11);
      await expect(page.locator(".quran-meaning-header h2")).not.toHaveText(t(language, "quranListening.translation"));
      await expect(page.locator(".quran-meaning-metadata > span")).toHaveCount(1);
      await expect(page.locator(".quran-meaning-metadata")).toHaveText(
        t(language, "mushaf.juzLabel", { juz: language === "ar" ? "١" : "1" }),
      );
      await expect(page.locator(".quran-meaning-footer")).toContainText("Saheeh International");
      const furniture = await page.locator(".quran-meaning-heading").evaluate((header) => {
        const bounds = header.getBoundingClientRect();
        const title = header.querySelector("h2")!.getBoundingClientRect();
        const juz = header.querySelector("p")!.getBoundingClientRect();
        const rtl = getComputedStyle(header).direction === "rtl";
        return {
          titleInset: Math.abs(rtl ? bounds.right - title.right : title.left - bounds.left),
          juzInset: Math.abs(rtl ? juz.left - bounds.left : bounds.right - juz.right),
        };
      });
      expect(furniture.titleInset).toBeLessThanOrEqual(1);
      expect(furniture.juzInset).toBeLessThanOrEqual(1);
      const verseGap = await english
        .locator("p")
        .first()
        .evaluate((paragraph) => parseFloat(getComputedStyle(paragraph).marginBottom));
      expect(verseGap).toBe(8);
    });

    test("Independent geometry and keyboard reading @cross-browser", async ({ page }, testInfo) => {
      const english = page.locator(".quran-meaning-text");
      // Page fitting and the paired ResizeObserver complete on browser frames.
      // Assert their settled geometry, retaining the same one-pixel limit.
      await expect
        .poll(() =>
          english.evaluate((region) => {
            const arabic = region.closest(".mushaf-paper")!.querySelector("[data-mushaf-column]")!;
            return Math.abs(
              region.closest(".mushaf-page-frame")!.getBoundingClientRect().width -
                arabic.closest(".mushaf-page-frame")!.getBoundingClientRect().width,
            );
          }),
        )
        .toBeLessThanOrEqual(1);
      const geometry = await english.evaluate((region) => {
        const paper = region.closest(".mushaf-paper")!;
        const arabic = paper.querySelector("[data-mushaf-column]")!;
        const englishFrame = region.closest(".mushaf-page-frame")!.getBoundingClientRect();
        const arabicFrame = arabic.closest(".mushaf-page-frame")!.getBoundingClientRect();
        const view = region.getBoundingClientRect();
        const body = arabic.getBoundingClientRect();
        const textStarts = [...region.querySelectorAll(".quran-meaning-verse-text")].map(
          (node) => node.getBoundingClientRect().left,
        );
        return {
          frameWidthGap: Math.abs(englishFrame.width - arabicFrame.width),
          frameTopGap: Math.abs(englishFrame.top - arabicFrame.top),
          bodyTopGap: Math.abs(view.top - body.top),
          beside: englishFrame.right < arabicFrame.left,
          overflowing: region.scrollHeight > region.clientHeight,
          parentOverflow: paper.scrollHeight - paper.clientHeight,
          numberAlignmentGap: Math.max(...textStarts) - Math.min(...textStarts),
          fontSize: parseFloat(getComputedStyle(region).fontSize),
        };
      });
      expect(geometry.frameWidthGap).toBeLessThanOrEqual(1);
      expect(geometry.frameTopGap).toBeLessThanOrEqual(1);
      expect(geometry.bodyTopGap).toBeLessThanOrEqual(1);
      expect(geometry.beside).toBe(true);
      expect(geometry.overflowing).toBe(true);
      expect(geometry.parentOverflow).toBeLessThanOrEqual(1);
      expect(geometry.numberAlignmentGap).toBeLessThanOrEqual(1);
      expect(geometry.fontSize).toBeGreaterThanOrEqual(20);
      const arabic = page.locator('[data-mushaf-page="3"]');
      const before = await arabic.boundingBox();
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-desktop.png`), scale: "css" });
      await english.focus();
      await page.keyboard.press("PageDown");
      await expect.poll(() => english.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
      await expect(english).toBeFocused();
      expect(await arabic.boundingBox()).toEqual(before);
      expect(await page.locator(".mushaf-paper").evaluate((node) => node.scrollTop)).toBe(0);
      await page.keyboard.press("End");
      await expect
        .poll(() => english.evaluate((node) => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop)))
        .toBeLessThanOrEqual(1);
      await expect(page).toHaveURL(/quran\/3$/);
      expect((await new AxeBuilder({ page }).include(".mushaf-paper").analyze()).violations).toEqual([]);
    });

    test("Translation header and footer share comfortable responsive insets @cross-browser", async ({
      page,
    }, testInfo) => {
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const scale of [1, 2]) {
          await page.evaluate((scale) => {
            document.documentElement.style.fontSize = `${16 * scale}px`;
          }, scale);
          const panel = page.locator(".quran-page-meaning");
          // WebKit applies rem changes on a rendering frame after root text
          // resizing. Wait for that exact inset before measuring the row.
          await expect
            .poll(() =>
              panel.locator(".quran-meaning-header").evaluate((node) => parseFloat(getComputedStyle(node).paddingLeft)),
            )
            .toBe(24 * scale + 3);
          const spacing = await panel.evaluate((panel) => {
            const furniture = [...panel.querySelectorAll(".quran-meaning-header, .quran-meaning-footer")];
            const bounds = panel.getBoundingClientRect();
            return furniture.map((node) => {
              const style = getComputedStyle(node);
              return {
                left: parseFloat(style.paddingLeft),
                right: parseFloat(style.paddingRight),
                top: parseFloat(style.paddingTop),
                bottom: parseFloat(style.paddingBottom),
                borderTop: parseFloat(style.borderTopWidth),
                borderBottom: parseFloat(style.borderBottomWidth),
                contained: [...node.children].every((child) => {
                  const childBounds = child.getBoundingClientRect();
                  return childBounds.left >= bounds.left && childBounds.right <= bounds.right;
                }),
              };
            });
          });
          expect(spacing).toHaveLength(2);
          for (const row of spacing) {
            expect(row.left).toBe(24 * scale + 3);
            expect(row.right).toBe(row.left);
            expect(row.top).toBe(6 * scale);
            expect(row.bottom).toBe(row.top);
            expect(row.borderTop).toBe(0);
            expect(row.borderBottom).toBe(0);
            expect(row.contained).toBe(true);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
          ).toBeLessThanOrEqual(1);
          if (scale === 1 && width !== 320)
            await page.screenshot({
              path: testInfo.outputPath(`translation-furniture-${language}-${width}.png`),
              scale: "css",
            });
        }
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    });

    test("Three-digit ayah chips remain on one line at the bottom right @cross-browser", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/#/quran/16");
      const english = page.locator(".quran-meaning-text");
      await expect(english.locator('[data-translation-verse="2:102"]')).toBeVisible();
      await expect(english.locator("p")).toHaveCount(4);
      const geometry = await english.evaluate((region) =>
        [...region.querySelectorAll("p")].map((paragraph) => {
          const marker = paragraph.querySelector(".audio-translation-marker")!;
          const range = document.createRange();
          range.selectNodeContents(marker);
          return {
            lines: range.getClientRects().length,
            right: paragraph.getBoundingClientRect().right - marker.getBoundingClientRect().right,
            bottom: paragraph.getBoundingClientRect().bottom - marker.getBoundingClientRect().bottom,
            position: getComputedStyle(marker).position,
            leftPadding: parseFloat(getComputedStyle(paragraph).paddingLeft),
            rightPadding: parseFloat(getComputedStyle(paragraph).paddingRight),
            topPadding: parseFloat(getComputedStyle(paragraph).paddingTop),
            bottomPadding: parseFloat(getComputedStyle(paragraph).paddingBottom),
          };
        }),
      );
      geometry.forEach((verse) => {
        expect(verse.lines).toBe(1);
        expect(verse.position).toBe("absolute");
        expect(verse.right).toBeGreaterThanOrEqual(14);
        expect(verse.right).toBeLessThanOrEqual(16);
        expect(verse.bottom).toBeGreaterThanOrEqual(10);
        expect(verse.bottom).toBeLessThanOrEqual(12);
        expect(verse.leftPadding).toBe(14);
        expect(verse.leftPadding).toBe(verse.rightPadding);
        expect(verse.bottomPadding - verse.topPadding).toBe(2);
      });
    });

    test("Compact enlarged text and short windows @cross-browser", async ({ page }, testInfo) => {
      const english = page.locator(".quran-meaning-text");
      const arabic = page.locator('[data-mushaf-page="3"]');
      await page.setViewportSize({ width: 390, height: 844 });
      const englishChoice = page.getByRole("radio", { name: "English", exact: true });
      await expect(englishChoice).toBeVisible();
      await englishChoice.check();
      await expect(english).toBeVisible();
      await expect(page.locator(".quran-meaning-footer")).toBeInViewport();
      const gutter = await english.evaluate((region) => {
        const paragraph = region.querySelector("p")!;
        const number = paragraph.querySelector(".audio-translation-marker")!;
        return paragraph.getBoundingClientRect().right - number.getBoundingClientRect().right;
      });
      expect(gutter).toBeGreaterThanOrEqual(14);
      expect(gutter).toBeLessThanOrEqual(16);
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-390.png`), scale: "css" });
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
        expect(await english.evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
        expect(await english.evaluate((node) => node.clientHeight)).toBeGreaterThan(120);
        const choiceBox = await englishChoice.boundingBox();
        expect(choiceBox!.width).toBeGreaterThanOrEqual(44);
        expect(choiceBox!.height).toBeLessThan(150);
        const footer = await page.locator(".quran-meaning-footer").boundingBox();
        const navigation = await page
          .getByRole("navigation", { name: t(language, "mushaf.pageNavigation") })
          .boundingBox();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(navigation!.y + 1);
        for (const button of await page
          .getByRole("navigation", { name: t(language, "mushaf.pageNavigation") })
          .getByRole("button")
          .all()) {
          const box = await button.boundingBox();
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          expect(box!.width).toBeGreaterThanOrEqual(44);
        }
        await page.screenshot({ path: testInfo.outputPath(`translation-${language}-${width}-200.png`), scale: "css" });
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await page.getByRole("radio", { name: "العربية", exact: true }).check();
      await expect(arabic).toBeVisible();
      await expect(arabic.locator("[data-mushaf-column] > div")).toHaveCount(15);
      await page.setViewportSize({ width: 1440, height: 600 });
      await expect(english).toBeVisible();
      await expect(page.locator(".quran-meaning-footer")).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`translation-${language}-short.png`), scale: "css" });
    });

    for (const compactWidth of [320, 390, 430]) {
      test(`Compact translation replaces controls and restores reading space ${compactWidth} @cross-browser`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width: 390, height: 844 });
        const toolbar = page.getByTestId("mushaf-translation-toolbar");
        const englishChoice = page.getByRole("radio", { name: "English", exact: true });
        const arabicChoice = page.getByRole("radio", { name: "العربية", exact: true });
        await expect(englishChoice).toBeChecked();
        const english = page.locator(".quran-meaning-text");
        await english.focus();
        await english.evaluate((node) => node.scrollTo({ top: 240, behavior: "instant" }));
        await expect.poll(() => english.evaluate((node) => node.scrollTop)).toBe(240);
        const scroll = await english.evaluate((node) => node.scrollTop);
        expect(scroll).toBeGreaterThan(0);
        await arabicChoice.check();
        const canvas = page.locator('[data-mushaf-page="3"]');
        await expect(canvas).toBeVisible();
        const translatedBounds = await canvas.boundingBox();
        await expect(page.getByTestId("mushaf-top-center-index")).toHaveCount(0);
        await expect(page.getByTestId("mushaf-more-actions")).toHaveCount(1);
        await englishChoice.check();
        expect(await english.evaluate((node) => node.scrollTop)).toBe(scroll);
        for (const width of [compactWidth]) {
          await page.setViewportSize({ width, height: 844 });
          for (const scale of ["100%", "200%"]) {
            await page.evaluate((scale) => {
              document.documentElement.style.fontSize = scale;
            }, scale);
            for (const control of [englishChoice, arabicChoice, page.getByTestId("mushaf-exit-translation")]) {
              const box = await control.boundingBox();
              expect(box!.width).toBeGreaterThanOrEqual(44);
              expect(box!.height).toBeGreaterThanOrEqual(44);
              expect(box!.x).toBeGreaterThanOrEqual(0);
              expect(box!.x + box!.width).toBeLessThanOrEqual(width);
            }
            const header = await toolbar.boundingBox();
            const text = await english.boundingBox();
            expect(text!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
            expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
            await page.screenshot({
              path: testInfo.outputPath(`compact-${language}-${width}-${scale}.png`),
              scale: "css",
            });
          }
        }
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
        await page.setViewportSize({ width: 390, height: 844 });
        expect(
          (await new AxeBuilder({ page }).include('[data-testid="mushaf-translation-toolbar"]').analyze()).violations,
        ).toEqual([]);
        await page.getByTestId("mushaf-exit-translation").click();
        await expect(page.getByTestId("mushaf-top-center-index")).toBeFocused();
        await expect(canvas).toBeVisible();
        const normalBounds = await canvas.boundingBox();
        expect(Math.abs(normalBounds!.height - translatedBounds!.height)).toBeLessThanOrEqual(1);
        await expect(page).toHaveURL(/quran\/3$/);
      });
    }
  });
}

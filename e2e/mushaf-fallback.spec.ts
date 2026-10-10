import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

for (const width of [390, 1440]) {
  for (const pageNumber of [5, 599]) {
    test(`fallback preserves canonical lines on page ${pageNumber} at ${width}px @cross-browser`, async ({
      page,
    }, testInfo) => {
      const verses: { k: string; w: [number, number, number, string, string][] }[] = JSON.parse(
        readFileSync(`public/data/mushaf/${pageNumber}.json`, "utf8"),
      );
      const expected = Array.from({ length: 15 }, (_, index) =>
        verses.flatMap((verse) => verse.w.filter((word) => word[1] === index + 1 && !word[2]).map((word) => word[3])),
      );
      await page.setViewportSize({ width, height: 900 });
      await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
      await page.addInitScript(() => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language: "ar", reduceMotion: true, mushafLayout: "single" },
            profile: { isGuest: true },
          }),
        );
      });
      await page.goto(`/#/quran/${pageNumber}`);
      const canvas = page.locator(`[data-mushaf-page="${pageNumber}"]`);
      await expect(canvas).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
      await page.evaluate(async () => {
        await document.fonts.load('400 32px "Amiri Quran"', "بِسْمِ اللَّهِ");
        await document.fonts.ready;
      });
      const column = canvas.locator("[data-mushaf-column]");
      await expect(column.locator(":scope > div")).toHaveCount(15);
      for (const [index, words] of expected.entries()) {
        const slot = column.locator(":scope > div").nth(index);
        for (const word of words) await expect(slot).toContainText(word);
        if (!words.length) continue;
        const line = slot.locator("[data-mushaf-line-content]");
        await expect(line).toHaveCSS("-webkit-text-stroke-width", "0px");
        const geometry = await line.evaluate((element) => ({
          transform: getComputedStyle(element).transform,
          content: element.getBoundingClientRect().toJSON(),
          parent: element.parentElement!.getBoundingClientRect().toJSON(),
          children: Array.from(element.children, (child) => child.getBoundingClientRect().toJSON()),
        }));
        await expect
          .poll(
            async () =>
              line.evaluate((element) => {
                const parent = element.parentElement!.getBoundingClientRect();
                const children = Array.from(element.children, (child) => child.getBoundingClientRect());
                return Math.max(
                  0,
                  parent.left - Math.min(...children.map((child) => child.left)),
                  Math.max(...children.map((child) => child.right)) - parent.right,
                );
              }),
            { message: JSON.stringify({ index, geometry }) },
          )
          .toBeLessThanOrEqual(1);
      }
      await page.screenshot({ path: testInfo.outputPath(`fallback-${pageNumber}-${width}.png`) });
    });
  }
}

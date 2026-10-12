import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`opening pages and glossary retain readable geometry at ${width}px @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("https://verses.quran.foundation/**", (route) => route.abort());
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "ar", theme: "midnight", reduceMotion: true, mushafLayout: "single" },
          profile: { isGuest: true },
        }),
      );
    });
    const sizes: number[] = [];
    for (const number of [1, 2, 3]) {
      await page.goto(`/#/quran/${number}`);
      const canvas = page.locator(`[data-mushaf-page="${number}"]`);
      await expect(canvas.locator("[data-mushaf-line-content]").first()).toBeVisible();
      await expect(canvas).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
      await page.evaluate(() => document.fonts.ready);
      await canvas.evaluate(async (el) => {
        const line = el.querySelector<HTMLElement>("[data-mushaf-line-content]")!;
        await new Promise<void>((resolve) => {
          let previous = "";
          let unchanged = 0;
          const sample = () => {
            const size = getComputedStyle(line).fontSize;
            unchanged = size === previous ? unchanged + 1 : 0;
            previous = size;
            if (unchanged >= 12) resolve();
            else requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        });
      });
      await expect
        .poll(async () => canvas.evaluate((el) => Number.parseFloat(el.style.getPropertyValue("--mushaf-fit"))))
        .toBeGreaterThan(0);
      const metrics = await canvas.evaluate((el) => {
        const lines = [...el.querySelectorAll<HTMLElement>("[data-mushaf-line-content]")];
        return {
          size: parseFloat(getComputedStyle(lines[0]!).fontSize),
          contained: lines.every((line) => {
            const slot = line.parentElement!.getBoundingClientRect();
            return [...line.children].every((word) => {
              const box = word.getBoundingClientRect();
              return box.left >= slot.left - 2 && box.right <= slot.right + 2;
            });
          }),
        };
      });
      sizes.push(metrics.size);
      expect(metrics.contained).toBe(true);
      await expect(canvas.locator("[data-mushaf-column] > div")).toHaveCount(number < 3 ? 8 : 15);
      await page.screenshot({ path: info.outputPath(`page-${number}-${width}.png`) });
    }
    expect(sizes[0]).toBeGreaterThanOrEqual(sizes[2]! * 0.9);
    expect(sizes[1]).toBeGreaterThanOrEqual(sizes[2]! * 0.9);
    await page.goto("/#/quran/42");
    await expect(page.locator("[data-mushaf-line-content]").first()).toBeVisible();
    await expect(page.locator('[data-mushaf-page="42"]')).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
    const toggle = page.getByTestId("mushaf-difficult-words-switch");
    await toggle.click();
    const word = page.locator('[data-mushaf-line-content] [role="button"]').first();
    await expect(word).toBeVisible();
    await word.evaluate(async (el) => {
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        let previous = "";
        let unchanged = 0;
        const sample = () => {
          const box = el.getBoundingClientRect();
          const current = JSON.stringify([box.x, box.y, box.width, box.height]);
          unchanged = current === previous ? unchanged + 1 : 0;
          previous = current;
          if (unchanged >= 12) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
    });
    const before = await word.boundingBox();
    await expect(word).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await word.focus();
    await page.keyboard.press("Enter");
    await expect(word).toHaveAttribute("aria-pressed", "true");
    expect(await word.boundingBox()).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(word).toHaveAttribute("aria-pressed", "false");
    await expect(page).toHaveURL(/#\/quran\/42$/);
    await page.screenshot({ path: info.outputPath(`glossary-${width}.png`) });
  });
}

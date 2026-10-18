import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const route of ["/counter", "/friday/salawat"]) {
  for (const language of ["ar", "en"] as const) {
    for (const width of [320, 1440]) {
      test(`standalone footer ${route} ${language} ${width}px @cross-browser`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((language) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, reduceMotion: true },
              profile: { isGuest: true },
            }),
          );
        }, language);
        await page.goto(`/#${route}`);
        const counter = page.getByTestId(route === "/counter" ? "custom-counter-surface" : "salawat-counter");
        const tools = page.getByTestId("reader-support-actions");
        const toggle = page.getByTestId("reader-tools-toggle");
        await expect(counter).toBeVisible();
        await expect(tools).toBeVisible();
        const before = (await counter.boundingBox())!;
        const actions = (await page.locator(".reader-tools-row").boundingBox())!;
        expect(before.y - actions.y - actions.height).toBeGreaterThanOrEqual(16);
        if (width === 1440) {
          const cells = await tools.getByRole("button").evaluateAll((buttons) =>
            buttons.map((button) => {
              const box = button.getBoundingClientRect();
              return { x: box.x, right: box.right };
            }),
          );
          const disclosure = (await toggle.boundingBox())!;
          const grid = [...cells, { x: disclosure.x, right: disclosure.x + disclosure.width }].sort(
            (a, b) => a.x - b.x,
          );
          expect(Math.abs(before.x + before.width / 2 - (grid[0].x + grid.at(-1)!.right) / 2)).toBeLessThanOrEqual(1);
        }
        await counter.click();
        const count = await counter.getAttribute("aria-label");
        await toggle.focus();
        await page.keyboard.press("Enter");
        await expect(tools).toBeHidden();
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
        await expect(toggle).toHaveAttribute("data-focus-active", "true");
        await expect(counter).toBeInViewport();
        await expect(counter).toHaveAttribute("aria-label", count!);
        await toggle.click();
        await expect(tools).toBeVisible();
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expect(toggle).toHaveAttribute("data-focus-active", "false");
        expect((await counter.boundingBox())!.y).toBeCloseTo(before.y, 0);
        await expect(counter).toHaveAttribute("aria-label", count!);
        await page.screenshot({ path: testInfo.outputPath("standalone-footer.png") });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(
          (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze()).violations,
        ).toEqual([]);
      });
    }
  }
}

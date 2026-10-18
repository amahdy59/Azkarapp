import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    for (const route of ["azkar/morning/1", "counter", "friday/salawat"]) {
      test(`Shared reader controls ${route} in ${language} at ${width}px @cross-browser`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((language) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, themeMode: "midnight", reduceMotion: true },
              profile: { isGuest: true },
            }),
          );
        }, language);
        await page.goto(`/#/${route}`);
        const toggle = page.getByTestId("reader-tools-toggle");
        const actions = page.getByTestId("reader-support-actions");
        await expect(toggle).toBeVisible();
        await expect(actions).toBeVisible();
        await expect(page.getByTestId("counter-tap-hint")).toHaveCount(0);
        await expect(page.getByTestId("counter-guidance-reopen")).toHaveCount(0);
        const controls = page.locator(
          '[data-testid="reader-support-actions"] .devotional-secondary-action, .reader-tools-toggle',
        );
        const styles = await controls.evaluateAll((buttons) =>
          buttons.map((button) => {
            const style = getComputedStyle(button);
            const svg = button.querySelector("svg")!;
            return {
              radius: style.borderRadius,
              border: style.borderColor,
              background: style.backgroundColor,
              shadow: style.boxShadow,
              height: (button as HTMLElement).offsetHeight,
              icon: svg.getBoundingClientRect().width,
            };
          }),
        );
        expect(styles.length).toBe(4);
        for (const style of styles) {
          expect(style.radius).toBe(styles[0].radius);
          expect(style.border).toBe(styles[0].border);
          expect(style.background).toBe(styles[0].background);
          expect(style.shadow).toBe(styles[0].shadow);
          expect(style.height).toBeGreaterThanOrEqual(44);
          expect(style.icon).toBe(20);
        }
        for (const textScale of [1, 2]) {
          await page.evaluate((scale) => {
            document.documentElement.style.fontSize = `${scale * 100}%`;
          }, textScale);
          const geometry = await controls.evaluateAll((buttons) =>
            buttons.map((button) => {
              const rect = button.getBoundingClientRect();
              const label = button.querySelector("span:last-child") as HTMLElement;
              const style = getComputedStyle(label);
              return {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height,
                labelVisible: style.display !== "none",
                labelClipped: label.scrollWidth > label.clientWidth + 1,
                ellipsis: style.textOverflow === "ellipsis",
                top: rect.top,
              };
            }),
          );
          for (const item of geometry) {
            expect(item.left).toBeGreaterThanOrEqual(0);
            expect(item.right).toBeLessThanOrEqual(width);
            expect(item.width).toBeGreaterThanOrEqual(44);
            expect(item.height).toBeGreaterThanOrEqual(44);
            expect(item.top).toBeCloseTo(geometry[0].top, 0);
            expect(item.labelVisible).toBe(width === 1440 && textScale === 1);
            expect(item.labelClipped).toBe(false);
            expect(item.ellipsis).toBe(false);
          }
          await page.screenshot({
            path: `output/playwright/reader-footer-hug/${route.replaceAll("/", "-")}-${language}-${width}-${textScale}x.png`,
          });
        }
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-testid="reader-dock"]')
              .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: `output/playwright/reader-consistency/${route.replaceAll("/", "-")}-${language}-${width}.png`,
        });
        await toggle.focus();
        await page.keyboard.press("Enter");
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
        await expect(toggle).toBeFocused();
        await expect(actions).not.toBeVisible();
        await page.keyboard.press("Escape");
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expect(actions).toBeVisible();
        await expect(page.locator(".reader-text-scroll:visible").first()).toBeFocused();
      });
    }
  }
}

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const seed = Date.parse("2026-10-20T14:00:00+03:00");
for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`prayer countdown stays readable and updates by the minute ${language} ${width} @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.clock.install({ time: new Date(seed) });
      await page.addInitScript(
        ({ language }) => {
          localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
          localStorage.setItem(
            "azkarapp.state.v1",
            JSON.stringify({
              settings: { language, themeMode: "midnight", homeMaterial: "glass", reduceMotion: false },
              profile: { isGuest: true },
            }),
          );
        },
        { language },
      );
      await page.goto("/#/home");
      await page.evaluate(() => document.fonts.ready);
      const card = page.locator('[data-density="summary"][data-prayer-state="next"]');
      const countdown = card.locator("[data-prayer-footer] .home-prayer-countdown-text");
      const wording = language === "ar" ? /متبقٍ.*[٠-٩]+\sد/u : /\d+m remaining/u;
      await expect(countdown).toHaveCSS("font-size", width < 768 ? "13px" : "15px");
      await expect(countdown).toHaveText(wording);
      const fitsOneLine = (node: HTMLElement) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = node.getBoundingClientRect();
        const runs = [...range.getClientRects()].filter((rect) => rect.width > 0);
        if (!runs.length) return false;
        const lineTop = runs[0].top;
        return runs.every(
          (rect) => rect.left >= box.left - 1 && rect.right <= box.right + 1 && Math.abs(rect.top - lineTop) <= 1,
        );
      };
      await expect.poll(() => countdown.evaluate(fitsOneLine)).toBe(true);
      await expect(card.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
      const before = (await countdown.textContent())!;
      await page.clock.fastForward(2000);
      await expect(countdown).toHaveText(before);
      await page.clock.fastForward(60_000);
      await expect(countdown).not.toHaveText(before);
      await expect(countdown).toHaveText(wording);
      await expect(card.locator("[aria-live], [role=timer], [role=progressbar]")).toHaveCount(0);
      await expect(card.locator("button")).toHaveAccessibleDescription(wording);
      const assertFit = async () =>
        expect
          .poll(() =>
            card.evaluate((node) => {
              const cardBox = node.getBoundingClientRect();
              return [
                ...node.querySelectorAll<HTMLElement>(".home-prayer-countdown-text, h3, [data-prayer-timing] p"),
              ].flatMap((child) => {
                const state = child.closest("[data-prayer-footer], [data-prayer-compact-countdown]");
                if (state && getComputedStyle(state).opacity === "0") return [];
                const box = child.getBoundingClientRect();
                const start = box.left - cardBox.left;
                const end = cardBox.right - box.right;
                const overflow = child.scrollWidth - child.clientWidth;
                return start >= 8 && end >= 8 && overflow <= 1
                  ? []
                  : [{ text: child.textContent, start, end, overflow }];
              });
            }),
          )
          .toEqual([]);
      await assertFit();
      await page.screenshot({ path: testInfo.outputPath(`countdown-${language}-${width}.png`), scale: "css" });
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      await assertFit();
      await expect.poll(() => countdown.evaluate(fitsOneLine)).toBe(true);
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "";
      });
      const sticky = page.getByTestId("home-sticky-prayers");
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 180;
      });
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      if (width < 768) {
        const compact = page.getByTestId("home-compact-prayer");
        await expect(compact).toBeInViewport();
        await expect(compact).toContainText(wording);
        await expect(compact.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
      } else {
        const compact = card.locator("[data-prayer-compact-countdown]");
        await expect(compact).toHaveCSS("opacity", "1");
        await expect(compact).toContainText(wording);
        await expect(compact.locator(".prayer-countdown-seconds, .prayer-countdown-ring")).toHaveCount(0);
        await expect(card.locator("[data-prayer-compact-countdown] .home-prayer-countdown-text")).toHaveCSS(
          "font-size",
          "13px",
        );
        await assertFit();
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await page.evaluate(() => document.fonts.ready);
      await assertFit();
      const activeCountdown =
        width < 768
          ? page.getByTestId("home-compact-prayer").locator("[data-prayer-countdown-line]")
          : card.locator("[data-prayer-compact-countdown] .home-prayer-countdown-text");
      await expect.poll(() => activeCountdown.evaluate(fitsOneLine)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`countdown-enlarged-condensed-${language}-${width}.png`),
        scale: "css",
      });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations,
      ).toEqual([]);
    });
  }
}

for (const source of ["app", "os"] as const) {
  test(`prayer minute updates respect ${source} reduced motion @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: source === "os" ? "reduce" : "no-preference" });
    await page.clock.install({ time: new Date(seed) });
    await page.addInitScript(
      ({ source }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language: "en", reduceMotion: source === "app" }, profile: { isGuest: true } }),
        );
      },
      { source },
    );
    await page.goto("/#/home");
    const footer = page.locator('[data-prayer-state="next"] [data-prayer-footer]');
    await expect(footer.locator(".prayer-countdown-arc, .prayer-countdown-seconds")).toHaveCount(0);
    const countdown = footer.locator(".home-prayer-countdown-text");
    const before = (await countdown.textContent())!;
    await page.clock.fastForward(60_000);
    await expect(countdown).not.toHaveText(before);
  });
}

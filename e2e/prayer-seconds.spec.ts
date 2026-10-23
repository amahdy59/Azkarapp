import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const seed = Date.parse("2026-10-20T14:00:00+03:00");
for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`prayer seconds stay stable and complete ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.clock.setFixedTime(new Date(seed));
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
      const digits = card.locator("[data-prayer-footer] .prayer-countdown-digits");
      const arc = card.locator("[data-prayer-footer] .prayer-countdown-arc");
      await expect(digits).toHaveCSS("font-size", "15px");
      await expect(digits).toHaveText(language === "ar" ? /^[٠-٩]{2}:[٠-٩]{2}:[٠-٩]{2}$/ : /^\d{2}:\d{2}:\d{2}$/);
      await expect(arc).toHaveCSS("transition-duration", "0.22s");
      await expect(card.locator("[data-prayer-footer] .prayer-countdown-seconds")).toHaveCSS(
        "animation-name",
        "prayer-seconds-arrive",
      );
      if (width < 640) {
        for (const word of await card.locator("[data-prayer-footer] .prayer-countdown-word").all())
          await expect(word).toBeHidden();
      }
      const before = (await digits.textContent())!;
      const beforeBounds = (await digits.boundingBox())!;
      const beforeArc = Number(await arc.getAttribute("stroke-dashoffset"));
      const homeDate = page.locator('[data-testid="home-utility-header"] time');
      const beforeHomeDate = await homeDate.getAttribute("datetime");
      await page.clock.setFixedTime(new Date(seed + 2000));
      await expect(digits).not.toHaveText(before);
      await expect.poll(async () => Number(await arc.getAttribute("stroke-dashoffset"))).toBeLessThan(beforeArc);
      const afterBounds = (await digits.boundingBox())!;
      expect(afterBounds.width).toBeCloseTo(beforeBounds.width, 1);
      expect(afterBounds.height).toBeCloseTo(beforeBounds.height, 1);
      expect(await homeDate.getAttribute("datetime")).toBe(beforeHomeDate);
      await expect(card.locator("[aria-live], [role=timer], [role=progressbar]")).toHaveCount(0);
      await expect(card.locator("button")).toHaveAccessibleDescription(
        language === "ar" ? /الوقت المتبقي حتى/ : /Time remaining until/,
      );
      const assertFit = async () =>
        expect
          .poll(() =>
            card.evaluate((node) => {
              const cardBox = node.getBoundingClientRect();
              return [
                ...node.querySelectorAll<HTMLElement>(".prayer-countdown-digits, h3, [data-prayer-timing] p"),
              ].every((child) => {
                const box = child.getBoundingClientRect();
                return (
                  box.left >= cardBox.left + 8 &&
                  box.right <= cardBox.right - 8 &&
                  child.scrollWidth <= child.clientWidth + 1
                );
              });
            }),
          )
          .toBe(true);
      await assertFit();
      await page.screenshot({ path: testInfo.outputPath(`seconds-${language}-${width}.png`), scale: "css" });
      const sticky = page.getByTestId("home-sticky-prayers");
      await sticky.locator("..").evaluate((node) => {
        node.scrollTop = 180;
      });
      await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
      await expect(card.locator("[data-prayer-compact-countdown]")).toHaveCSS("opacity", "1");
      await expect(card.locator("[data-prayer-compact-countdown] .prayer-countdown-digits")).toHaveCSS(
        "font-size",
        "13px",
      );
      await assertFit();
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await page.evaluate(() => document.fonts.ready);
      await assertFit();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`seconds-enlarged-condensed-${language}-${width}.png`),
        scale: "css",
      });
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-strip"]').analyze()).violations,
      ).toEqual([]);
    });
  }
}

for (const source of ["app", "os"] as const) {
  test(`prayer seconds respect ${source} reduced motion @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: source === "os" ? "reduce" : "no-preference" });
    await page.clock.setFixedTime(new Date(seed));
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
    await expect(footer.locator(".prayer-countdown-arc")).toHaveCSS("transition-duration", "0s");
    await expect(footer.locator(".prayer-countdown-seconds")).toHaveCSS("animation-name", "none");
    const digits = footer.locator(".prayer-countdown-digits");
    const before = (await digits.textContent())!;
    await page.clock.setFixedTime(new Date(seed + 2000));
    await expect(digits).not.toHaveText(before);
  });
}

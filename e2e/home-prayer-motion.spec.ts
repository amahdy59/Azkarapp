import { expect, test } from "@playwright/test";

for (const [language, width] of [
  ["ar", 390],
  ["en", 1440],
] as const) {
  test(`Home prayer cards interpolate together ${language} ${width} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            appMaterial: "glass",
            homeMaterial: "glass",
            reduceMotion: false,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    const sticky = page.getByTestId("home-sticky-prayers");
    const card = page.getByTestId("prayer-card-dhuhr");
    await expect(card).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .getByTestId("time-of-day-scene-window")
          .last()
          .locator("img")
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    const capture = async (state: string) =>
      page.screenshot({
        path: `output/playwright/glass-refinement/home-motion/${testInfo.project.name}/${language}-${width}-${state}.png`,
        scale: "css",
      });
    const expanded = (await card.boundingBox())!.height;
    const digits = card.locator("[data-prayer-time-digits]");
    const expandedFont = await digits.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    const expandedSticky = (await sticky.boundingBox())!.height;
    await capture("expanded");
    const paused = await sticky.evaluate(
      (node) =>
        new Promise<boolean>((resolve) => {
          // Observe the real React scroll-state commit. Under mobile WebKit the
          // emulated RAF loop can run before the native scroll event is delivered.
          getComputedStyle(node).getPropertyValue("--home-prayer-expansion");
          const observer = new MutationObserver(() => {
            getComputedStyle(node).getPropertyValue("--home-prayer-expansion");
            const animation = node
              .getAnimations()
              .find((a) => a instanceof CSSTransition && a.transitionProperty === "--home-prayer-expansion");
            observer.disconnect();
            if (animation) {
              animation.pause();
              animation.currentTime = 0;
            }
            for (const font of node.getAnimations({ subtree: true }))
              if (font instanceof CSSTransition && ["font-size", "translate"].includes(font.transitionProperty)) {
                font.pause();
                font.currentTime = 0;
              }
            resolve(Boolean(animation));
          });
          observer.observe(node, { attributes: true, attributeFilter: ["data-prayer-cards-condensed"] });
          node.parentElement!.scrollTop = 150;
        }),
    );
    expect(paused).toBe(true);
    await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
    await expect(sticky).toHaveCSS("transition-duration", "0.22s");
    await expect(sticky).toHaveCSS("transition-delay", "0s");
    // At time zero the actual card shape is still expanded: no hidden-footer snap.
    expect((await card.boundingBox())!.height).toBeCloseTo(expanded, 0);
    await sticky.evaluate((node) => {
      for (const animation of node.getAnimations({ subtree: true }))
        if (
          animation instanceof CSSTransition &&
          ["--home-prayer-expansion", "font-size", "translate"].includes(animation.transitionProperty)
        )
          animation.currentTime = 100;
    });
    const middle = (await card.boundingBox())!.height;
    const middleFont = await digits.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(middleFont).toBeLessThan(expandedFont);
    expect(middle).toBeLessThan(expanded - 2);
    await capture("middle");
    // The new countdown arrives during the final 60ms, finishing with the
    // geometry rather than appearing while a delayed contraction is running.
    await expect(sticky.locator("[data-prayer-compact-countdown]")).toHaveCSS("transition-delay", "0.16s");
    await expect(sticky.locator("[data-prayer-footer]").first()).toHaveCSS("transition-delay", "0s");
    await sticky.evaluate((node) => {
      for (const animation of node.getAnimations({ subtree: true })) animation.finish();
    });
    await expect(sticky).toHaveCSS("--home-prayer-expansion", "0");
    const compact = (await card.boundingBox())!.height;
    const compactFont = await digits.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(middleFont).toBeGreaterThan(compactFont);
    expect(expandedFont / compactFont).toBeCloseTo(1.4, 1);
    await expect(digits).toHaveCSS("transform", "none");
    expect(middle).toBeGreaterThan(compact + 2);
    expect(compact).toBeLessThan(expanded - 20);
    expect((await sticky.boundingBox())!.height).toBeLessThan(expandedSticky - 35);
    expect(await sticky.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
    await expect(card).toHaveCSS("backdrop-filter", "none");
    await expect(page.getByTestId("home-all-prayers-row")).toHaveCSS("scrollbar-width", "none");
    await expect(sticky.locator("[data-prayer-compact-countdown]")).toHaveCSS("opacity", "1");
    // An ancestor opacity entrance creates a backdrop root and prevents each
    // card from frosting the moving content outside the prayer strip.
    await expect(page.getByTestId("home-all-prayers-row")).toHaveCSS("animation-name", "none");
    await expect(page.getByTestId("home-utility-header")).toHaveCSS("backdrop-filter", "none");
    for (const button of await sticky.locator("[data-density='summary'] button").all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    }
    await capture("compact");
    // Native CSS reverses from the current interpolated value; preferences cancel it.
    await sticky.locator("..").evaluate((node) => {
      node.scrollTop = 0;
    });
    await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(sticky).toHaveCSS("--home-prayer-expansion", "1");
    await expect.poll(() => sticky.evaluate((node) => node.getAnimations().length)).toBe(0);
    await sticky.locator("..").evaluate((node) => {
      node.scrollTop = 150;
    });
    await expect(sticky).toHaveCSS("--home-prayer-expansion", "0");
    await expect.poll(() => sticky.evaluate((node) => node.getAnimations().length)).toBe(0);
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "32px";
    });
    const timeFits = await sticky
      .locator('[id^="prayer-summary-time-"]')
      .evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1));
    expect(timeFits).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await capture("compact-large-text");
  });
}

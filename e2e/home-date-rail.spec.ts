import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const viewport of [
  { width: 390, height: 844, language: "ar", material: "glass" },
  { width: 820, height: 1024, language: "ar", material: "glass" },
  { width: 1440, height: 900, language: "en", material: "solid" },
  { width: 320, height: 800, language: "en", material: "glass", large: true },
] as const) {
  test(`Home date and prayer rail at ${viewport.width}px ${viewport.language} @cross-browser`, async ({
    page,
  }, info) => {
    const { width, language, material } = viewport;
    const phone = width < 768;
    const large = "large" in viewport;
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(new Date("2026-11-06T08:00:00+02:00"));
    await page.emulateMedia({ reducedMotion: large ? "reduce" : "no-preference" });
    await page.addInitScript(
      ({ language, material, large }) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              themeMode: material === "solid" ? "light" : "midnight",
              appMaterial: material,
              homeMaterial: material,
              reduceMotion: false,
              paperTexture: true,
              reduceTransparency: large,
            },
            profile: { isGuest: true },
          }),
        );
      },
      { language, material, large },
    );
    await page.goto("/#/home");
    const sticky = page.getByTestId("home-sticky-prayers");
    const strip = page.getByTestId("home-prayer-strip");
    const summary = page.getByTestId("home-compact-prayer");
    const date = page.getByTestId("hijri-date").locator("time");
    const secondary = page.getByTestId("home-secondary-date");
    const progress = page.locator(".home-header-path-button").filter({ visible: true }).first();
    const scroller = sticky.locator("..");
    await expect(strip.locator("article")).toHaveCount(5);
    if (large) await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await page.evaluate(() => document.fonts.ready);
    await expect(secondary).toBeVisible();
    await expect(summary).toBeHidden();
    const context = page.getByTestId("home-context-grid");
    await expect(context).toHaveCSS("row-gap", large ? "16px" : phone ? "8px" : "12px");
    await expect(context).toHaveCSS("align-items", "flex-start");
    const anchor = async () => [
      (await date.boundingBox())!.y,
      (await progress.boundingBox())!.y,
      (await sticky.boundingBox())!.y,
    ];
    const anchored = await anchor();
    const initialHeight = (await sticky.boundingBox())!.height;
    const capture = (state: string) => page.screenshot({ path: info.outputPath(`${state}.png`), scale: "css" });
    await capture("expanded");
    if (!large && phone) {
      const frames = await sticky.evaluate(
        (node) =>
          new Promise<number[]>((resolve) => {
            const observer = new MutationObserver(() => {
              observer.disconnect();
              const animations = node
                .getAnimations({ subtree: true })
                .filter(
                  (animation) =>
                    animation instanceof CSSTransition &&
                    ["--home-prayer-expansion", "grid-template-rows", "opacity"].includes(animation.transitionProperty),
                );
              const frames = [0, 65, 130, 195, 260].map((time) => {
                for (const animation of animations) {
                  animation.pause();
                  animation.currentTime = time;
                }
                return node.getBoundingClientRect().height;
              });
              for (const animation of animations) animation.finish();
              resolve(frames);
            });
            observer.observe(node, { attributes: true, attributeFilter: ["data-prayer-cards-condensed"] });
            node.parentElement!.scrollTop = 150;
          }),
      );
      expect(frames[0]).toBeCloseTo(initialHeight, 0);
      expect(frames[0] - frames[4]).toBeGreaterThan(24);
      for (let index = 1; index < frames.length; index++) {
        expect(frames[index]).toBeLessThan(frames[index - 1]);
      }
    } else {
      await scroller.evaluate((node) => (node.scrollTop = 150));
    }
    await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
    await expect(secondary).toBeVisible();
    await expect.poll(anchor).toEqual(anchored);
    if (phone) {
      await expect(strip).toHaveAttribute("inert", "");
      await expect(summary).toBeInViewport();
      const action = summary.getByRole("button", { name: t(language, "home.viewAllPrayers") });
      const hit = await action.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return (
          r.height >= 44 &&
          r.width >= 44 &&
          node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
        );
      });
      expect(hit).toBe(true);
      await expect(summary).toContainText(language === "ar" ? /متبقٍ.*[٠-٩]+\sد/u : /\d+m remaining/u);
    } else {
      await expect(summary).toHaveCount(0);
      for (const card of await strip.locator("article").all()) await expect(card).toBeInViewport();
    }
    if (material === "glass") {
      await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      if (phone) await expect(summary).toHaveCSS("backdrop-filter", "none");
    } else {
      await expect(sticky).toHaveCSS("backdrop-filter", "none");
      await expect(page.locator(".home-photo-canvas")).toHaveCSS("background-image", /paper-grain-light/);
    }
    if (large) await expect.poll(() => sticky.evaluate((node) => node.getAnimations().length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await capture("scrolled");
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
    ).toEqual([]);
    await scroller.evaluate((node) => (node.scrollTop = 0));
    await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
    await expect(secondary).toBeVisible();
    await expect(strip).not.toHaveAttribute("inert", "");
    if (phone) {
      await expect(summary).toBeHidden();
      await scroller.evaluate((node) => (node.scrollTop = 150));
      const action = summary.getByRole("button", { name: t(language, "home.viewAllPrayers") });
      await action.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("prayer-moment-strip").getByRole("button")).toHaveCount(5);
    }
  });
}

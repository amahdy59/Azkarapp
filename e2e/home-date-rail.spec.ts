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
    const summary = page.getByTestId("home-prayer-interval");
    const date = page.getByTestId("hijri-date").locator("time");
    const secondary = page.getByTestId("home-secondary-date");
    const progress = page.locator(".home-header-path-button").filter({ visible: true }).first();
    const scroller = sticky.locator("..");
    await expect(strip.locator("article")).toHaveCount(5);
    if (large) await page.locator("html").evaluate((node) => (node.style.fontSize = "200%"));
    await page.evaluate(() => document.fonts.ready);
    await expect(secondary).toBeVisible();
    await expect(summary).toBeVisible();
    const context = page.getByTestId("home-context-grid");
    await expect(context).toHaveCSS("row-gap", large ? "16px" : phone ? "8px" : "12px");
    await expect(context).toHaveCSS("align-items", "flex-start");
    const anchor = async () => [
      (await date.boundingBox())!.y,
      (await progress.boundingBox())!.y,
      (await sticky.boundingBox())!.y,
    ];
    const anchored = await anchor();
    const capture = (state: string) => page.screenshot({ path: info.outputPath(`${state}.png`), scale: "css" });
    await capture("expanded");
    await scroller.evaluate((node) => {
      node.scrollTop = 150;
    });
    await expect(sticky).toHaveAttribute("data-scrolled", "true");
    await expect(secondary).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(() =>
        sticky.evaluate((node) => {
          const scroll = node.parentElement!,
            fits = node.getBoundingClientRect().height + 44 < scroll.clientHeight;
          const position = getComputedStyle(node).position,
            offset = position === "relative" ? scroll.scrollTop : 0;
          const date = node.querySelector('[data-testid="hijri-date"] time')!;
          const progress = [...node.querySelectorAll(".home-header-path-button")].find(
            (b) => b.getBoundingClientRect().width > 0,
          )!;
          return {
            policySettled: position === (fits ? "sticky" : "relative"),
            coordinates: [date, progress, node].map((el) => Math.round(el.getBoundingClientRect().y + offset)),
          };
        }),
      )
      .toEqual({ policySettled: true, coordinates: anchored.map(Math.round) });
    const action = page.getByTestId("home-prayer-disclosure");
    await expect(action).toHaveAccessibleName(t(language, "home.hidePrayerTimes"));
    await expect
      .poll(() =>
        action.evaluate((node) => {
          const r = node.getBoundingClientRect();
          return (
            r.height >= 44 &&
            r.width >= 44 &&
            node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
          );
        }),
      )
      .toBe(true);
    await expect(summary).toContainText(language === "ar" ? /متبقٍ.*[٠-٩]+\sد/u : /\d+m remaining/u);
    if (material === "glass") {
      await expect(sticky).toHaveCSS("backdrop-filter", "blur(32px) saturate(1.35)");
      await expect(summary).toHaveCSS("backdrop-filter", "none");
    } else {
      await expect(sticky).toHaveCSS("backdrop-filter", "none");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await capture("scrolled");
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="home-sticky-prayers"]').analyze()).violations,
    ).toEqual([]);
    await action.focus();
    await action.press("Enter");
    await expect(action).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#home-prayer-timings")).toHaveAttribute("inert", "");
    await scroller.evaluate((node) => {
      node.scrollTop = 0;
    });
    await expect(action).toHaveAttribute("aria-expanded", "false");
    await expect(secondary).toBeVisible();
    await action.press("Enter");
    await expect(action).toHaveAttribute("aria-expanded", "true");
    await expect(strip.locator("article")).toHaveCount(5);
    await progress.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
}

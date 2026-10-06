import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { categorySlug } from "../src/app/routing";
import type { AppLanguage } from "../src/app/types";
import { getAzkarForMode } from "../src/app/content/azkar";

async function prepare(page: Page, language: AppLanguage, browserName: string, themeMode = "midnight") {
  await page.addInitScript(
    ({ language, themeMode }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (localStorage.getItem("azkarapp.state.v1")) return;
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, themeMode, reduceMotion: true }, profile: { isGuest: true } }),
      );
    },
    { language, themeMode },
  );
  // Native emulation is necessary: replacing matchMedia cannot change CSS.
  const cdp = browserName === "chromium" ? await page.context().newCDPSession(page) : null;
  await cdp?.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
  });
  return cdp;
}

const headerSelector = (width: number) =>
  width < 768 ? '[data-testid="shared-screen-header"]' : '[data-testid="reader-desktop-hero"]';

for (const language of ["ar", "en"] as const) {
  test(`entry tools stay outside the consistent ${language} collection header @cross-browser`, async ({
    page,
    browserName,
  }) => {
    await prepare(page, language, browserName);
    await page.goto("/#/azkar/morning/1");
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    const ayahIndex = getAzkarForMode("morning", "complete").findIndex((zikr) => zikr.id === "m-hm-75");
    for (const width of [320, 390, 820, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      let height: number | undefined;
      for (const route of ["morning/1", `morning/${ayahIndex + 1}`, "evening/1", "before-sleep/1"]) {
        await page.evaluate((route) => {
          window.location.hash = `/azkar/${route}`;
        }, route);
        await expect(page.getByTestId("reader-screen")).toHaveAttribute(
          "data-reader-category",
          route.split("/")[0]!.replace(/-/g, "_"),
        );
        const header = page.locator(headerSelector(width));
        await expect(header).toBeVisible();
        await expect(header.getByTestId("reader-zikr-title")).toHaveCount(0);
        await expect(header.getByRole("switch")).toHaveCount(0);
        const bounds = (await header.boundingBox())!;
        height ??= bounds.height;
        expect(bounds.height).toBeCloseTo(height, 1);
        const tools = page.getByTestId("reader-entry-tools");
        if (await tools.count()) {
          await expect(tools).toBeVisible();
          expect((await tools.boundingBox())!.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
          await expect(page.getByTestId("reader-card").getByTestId("reader-entry-tools")).toBeVisible();
        }
      }
    }
  });

  for (const category of ["morning", "evening", "before_sleep"] as const) {
    test(`${category} scene preserves ${language} geometry and contrast @cross-browser`, async ({
      page,
      browserName,
    }, testInfo) => {
      const cdp = await prepare(page, language, browserName);
      await page.goto(`/#/azkar/${categorySlug(category)}/1`);
      for (const width of [320, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const scene = page.getByTestId("reader-scene");
        await expect(scene).toBeVisible();
        await expect(scene).toHaveAttribute("data-scene", category);
        const header = page.locator(headerSelector(width));
        await expect(header).toBeVisible();
        const before = await header.boundingBox();
        const art = await scene.boundingBox();
        expect(before).not.toBeNull();
        expect(art).not.toBeNull();
        const borderHeight = await header.evaluate((element) => {
          const style = getComputedStyle(element);
          return parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        });
        expect(art!.height).toBeCloseTo(before!.height - borderHeight, 1);
        expect(art!.width).toBeLessThanOrEqual(before!.width);
        await page.evaluate(() => document.documentElement.classList.add("reduce-transparency"));
        await expect(scene).toBeVisible();
        await expect(scene.locator(".reader-scene__skyline")).toBeVisible();
        expect(await header.boundingBox()).toEqual(before);
        await page.evaluate(() => document.documentElement.classList.remove("reduce-transparency"));
        if (cdp) {
          await cdp.send("Emulation.setEmulatedMedia", {
            features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
          });
          await expect(scene).toBeVisible();
          await expect(scene.locator(".reader-scene__skyline")).toBeVisible();
          expect(await header.boundingBox()).toEqual(before);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect((await new AxeBuilder({ page }).include(headerSelector(width)).analyze()).violations).toEqual([]);
        await page.screenshot({
          path: `output/playwright/reader-scenes/${testInfo.project.name}/${category}-${language}-${width}.png`,
        });
        await cdp?.send("Emulation.setEmulatedMedia", {
          features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
        });
      }
    });
  }

  for (const theme of ["light", "midnight", "dark"] as const) {
    test(`reader scene ${theme} theme and accessibility fallbacks in ${language} @cross-browser`, async ({
      page,
      browserName,
    }, testInfo) => {
      const cdp = await prepare(page, language, browserName, theme);
      await page.goto("/#/azkar/before-sleep/1");
      await expect(page.locator("html")).toHaveClass(new RegExp(`theme-${theme}`));
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.getByTestId("reader-scene")).toBeVisible();
        await expect(page.locator(headerSelector(width))).toBeVisible();
        expect((await new AxeBuilder({ page }).include(headerSelector(width)).analyze()).violations).toEqual([]);
        await page.screenshot({
          path: `output/playwright/reader-scenes/${testInfo.project.name}/sleep-${theme}-${language}-${width}.png`,
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect((await new AxeBuilder({ page }).include(headerSelector(390)).analyze()).violations).toEqual([]);
      await page.emulateMedia({ forcedColors: "active" });
      await expect(page.getByTestId("reader-scene")).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.emulateMedia({ forcedColors: "none" });
      await page.context().setOffline(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByTestId("reader-scene")).toBeVisible();
      if (cdp) {
        const header = page.locator(headerSelector(390));
        const before = await header.boundingBox();
        await cdp.send("Emulation.setEmulatedMedia", {
          features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
        });
        await expect(page.getByTestId("reader-scene")).toBeVisible();
        await expect(page.locator(".reader-scene__skyline")).toBeVisible();
        expect(await header.boundingBox()).toEqual(before);
        expect((await new AxeBuilder({ page }).include(headerSelector(390)).analyze()).violations).toEqual([]);
        await page.screenshot({
          path: `output/playwright/reader-scenes/${testInfo.project.name}/sleep-${theme}-${language}-reduced-transparency.png`,
        });
      }
    });
  }
}

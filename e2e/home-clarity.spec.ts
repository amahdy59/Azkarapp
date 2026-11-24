import { assertPrayerOverview } from "./helpers/home-overview";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => fixtureReminderCatalogue(page));
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

test.beforeEach(async ({ page }) => {
  const later = page.getByRole("button", { name: /^(Later|لاحقاً)$/ });
  await page.addLocatorHandler(later, async () => later.click());
});

for (const language of ["ar", "en"] as const) {
  for (const width of [600, 820, 1024, 1440, 1920]) {
    test(`@cross-browser aligned Home card edges ${language} at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1100 });
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", homeMaterial: "glass", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      await page.getByTestId("prayer-card-dhuhr").getByRole("button").click();
      await expect(page.getByTestId("home-prayer-moment")).toBeVisible();
      const alignment = await page.getByTestId("home-context-grid").evaluate((grid) => {
        const row = document.querySelector('[data-testid="home-prayer-strip"]')!;
        const frame = row.getBoundingClientRect();
        const inset = getComputedStyle(row);
        // Narrow tablets retain native browsing; align to its visible aperture.
        const left = frame.left + parseFloat(inset.paddingLeft);
        const right = frame.right - parseFloat(inset.paddingRight);
        const sections = [
          grid,
          document.querySelector('[data-testid="home-prayer-moment"]')!,
          ...document.querySelectorAll('[data-testid="home-content-grid"] > .px-page'),
        ];
        return sections.map((section) => {
          const bounds = section.getBoundingClientRect();
          const style = getComputedStyle(section);
          return {
            left: bounds.left + parseFloat(style.paddingLeft) - left,
            right: bounds.right - parseFloat(style.paddingRight) - right,
          };
        });
      });
      for (const section of alignment) {
        expect(Math.abs(section.left), JSON.stringify(alignment)).toBeLessThanOrEqual(1);
        expect(Math.abs(section.right), JSON.stringify(alignment)).toBeLessThanOrEqual(1);
      }
      const homeGrid = (await page.getByTestId("home-context-grid").boundingBox())!;
      const homeColumns = await page
        .getByTestId("home-context-grid")
        .evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length);
      expect(homeColumns).toBe(width >= 768 ? 2 : 1);
      const companion = page.getByTestId("home-context-companion");
      const companionBox = (await companion.boundingBox())!;
      const reminderBox = (await companion.locator("section").boundingBox())!;
      expect(reminderBox.width).toBeCloseTo(companionBox.width, 0);
      await page.screenshot({ path: testInfo.outputPath(`aligned-${language}-${width}.png`), scale: "css" });
      await page.goto("/#/azkar");
      const library = (await page.locator(".field-shell").boundingBox())!;
      expect(homeGrid.x).toBeCloseTo(library.x, 0);
      expect(homeGrid.width).toBeCloseTo(library.width, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`@cross-browser bounded prayer hierarchy ${language} at ${width}px`, async ({
      page,
      browserName,
    }, testInfo) => {
      if (browserName === "chromium") {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setEmulatedMedia", {
          features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
        });
      }
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.setViewportSize({ width, height: 1000 });
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
      await page.goto("/#/home");
      const row = page.getByTestId("home-all-prayers-row");
      await expect(row.locator("article")).toHaveCount(5);
      await assertPrayerOverview(page);
      const current = row.locator('[data-prayer-state="current"]');
      const toggle = current.getByRole("button");
      await toggle.focus();
      await expect(toggle).toBeFocused();
      const initial = await toggle.getAttribute("aria-expanded");
      await toggle.press("Space");
      await expect(toggle).toHaveAttribute("aria-expanded", initial === "true" ? "false" : "true");
      if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
      await expect(row.locator('[data-selected="true"]')).toHaveCount(1);
      await expect(page.getByTestId("home-prayer-moment")).toHaveAttribute(
        "data-prayer",
        (await current.getAttribute("data-prayer"))!,
      );
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "32px";
      });
      await assertPrayerOverview(page);
      const arrow = current.locator("[data-prayer-chevron]");
      await toggle.scrollIntoViewIfNeeded();
      const hit = (await arrow.boundingBox())!;
      await page.mouse.click(hit.x + hit.width / 2, hit.y + hit.height / 2);
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await toggle.press("Space");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      const panel = page.getByTestId("home-prayer-moment");
      await expect(panel).toHaveAttribute("data-prayer", (await current.getAttribute("data-prayer"))!);
      await expect(row.locator('[data-selected="true"]')).toHaveCount(1);
      await expect(panel).toHaveCSS("margin-top", "0px");
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "";
      });
      await page.screenshot({ path: testInfo.outputPath(`${language}-${width}-joined.png`), scale: "css" });
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 900, 1920]) {
    test(`@cross-browser ${language} clear Home and independent appearance at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.state.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const header = page.getByTestId("home-utility-header");
      const frame = await header.evaluate((element) => {
        const outer = element.getBoundingClientRect();
        const canvas = element.closest('[role="region"]')!.getBoundingClientRect();
        const inner = element.querySelector('[data-testid="home-header-content"]')!.getBoundingClientRect();
        const grid = document.querySelector('[data-testid="home-content-grid"]')!.getBoundingClientRect();
        return {
          outerLeft: outer.left,
          outerRight: outer.right,
          canvasLeft: canvas.left,
          canvasRight: canvas.right,
          innerLeft: inner.left,
          innerRight: inner.right,
          gridLeft: grid.left,
          gridRight: grid.right,
        };
      });
      expect(Math.abs(frame.outerLeft - frame.canvasLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.outerRight - frame.canvasRight)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerLeft - frame.gridLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerRight - frame.gridRight)).toBeLessThanOrEqual(1);
      const strip = page.getByTestId("home-prayer-strip");
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
      await expect(page.getByTestId("prayer-card-dhuhr")).toHaveAttribute("data-prayer-state", "current");
      await expect(page.getByTestId("prayer-card-asr")).toHaveAttribute("data-prayer-state", "next");
      await expect(strip.getByRole("button", { name: t(language, "settings.showAllPrayers") })).toHaveCount(0);
      const allRow = page.getByTestId("home-all-prayers-row");
      await assertPrayerOverview(page);
      await expect(strip.getByRole("progressbar")).toHaveCount(0);
      expect(await allRow.evaluate((row) => row.scrollWidth > row.clientWidth + 1)).toBe(false);
      const path = page.getByTestId("home-header-routine-summary");
      if (width >= 600) await expect(path).toBeVisible();
      else await expect(path).toBeHidden();
      const mobilePath = page.getByTestId("home-header-routine-summary-mobile");
      if (width < 600) await expect(mobilePath).toBeVisible();
      else await expect(mobilePath).toBeHidden();
      const date = page.getByTestId("hijri-date");
      const visiblePath = width < 600 ? mobilePath : path;
      const [dateBounds, pathBounds] = await Promise.all([date.boundingBox(), visiblePath.boundingBox()]);
      expect(dateBounds).not.toBeNull();
      expect(pathBounds).not.toBeNull();
      if (language === "ar") expect(dateBounds!.x).toBeGreaterThanOrEqual(pathBounds!.x + pathBounds!.width);
      else expect(dateBounds!.x + dateBounds!.width).toBeLessThanOrEqual(pathBounds!.x);
      await expect(visiblePath.locator("svg")).toHaveCount(2);
      expect(
        await date.evaluate((node) => {
          const time = node.querySelector("time")!;
          return (
            time.scrollWidth <= node.clientWidth + 1 &&
            time.getBoundingClientRect().bottom <= node.getBoundingClientRect().bottom + 1
          );
        }),
      ).toBe(true);
      const cards = page.getByTestId("wird-category-card");
      await expect(cards).toHaveCount(4);
      if (width < 640) {
        const positions = await cards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        expect(Math.abs(positions[0]! - positions[1]!)).toBeLessThanOrEqual(1);
        expect(Math.abs(positions[2]! - positions[3]!)).toBeLessThanOrEqual(1);
        expect(positions[2]!).toBeGreaterThan(positions[0]!);
        const heights = await cards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
        for (const height of heights) {
          expect(height).toBeGreaterThanOrEqual(120);
          expect(height).toBeLessThanOrEqual(160);
        }
        const spacing = await cards
          .first()
          .locator(".home-wird-caption")
          .evaluate((node) => {
            const style = getComputedStyle(node);
            return { top: style.paddingTop, bottom: style.paddingBottom, minimum: style.minHeight };
          });
        expect(spacing).toEqual({ top: "12px", bottom: "12px", minimum: "120px" });
      }
      await expect(cards.locator("img")).toHaveCount(0);
      await expect(page.getByTestId("daily-evidence-hadith")).toBeVisible();
      await expect(page.getByTestId("open-wird-benefits")).toBeVisible();
      await expect(page.getByTestId("situational-shortcuts").locator("a svg")).toHaveCount(3);
      await page.goto("/#/settings/appearance");
      const images = page.getByRole("switch", { name: new RegExp(t(language, "settings.homeWirdImages")) });
      const homeAppearance = page.getByRole("radiogroup", { name: t(language, "settings.homeMaterial"), exact: true });
      const transparency = homeAppearance.getByRole("radio", {
        name: t(language, "settings.homeMaterial_solid"),
        exact: true,
      });
      await transparency.click();
      await expect(images).toHaveAttribute("aria-checked", "false");
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await images.click();
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(4);
      const caption = cards.first().locator(".home-wird-caption");
      const material = await caption.evaluate((node) => ({
        filter: getComputedStyle(node).backdropFilter,
        systemReduced: matchMedia("(prefers-reduced-transparency: reduce)").matches,
        color: getComputedStyle(node).backgroundColor,
      }));
      if (material.systemReduced) {
        expect(material.filter).toBe("none");
        expect(await caption.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("linear-gradient");
      } else {
        expect(material.filter).toBe("none");
        expect(await caption.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("linear-gradient");
      }
      await page.goto("/#/settings/appearance");
      await homeAppearance
        .getByRole("radio", { name: t(language, "settings.homeMaterial_solid"), exact: true })
        .click();
      await expect(images).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await page.reload();
      await expect(cards.locator("img")).toHaveCount(4);
      expect(await caption.evaluate((node) => getComputedStyle(node).backdropFilter)).toBe("none");
      await page.goto("/#/settings/appearance");
      await images.click();
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(0);
      if (width === 320) {
        const shortcuts = page.getByTestId("situational-shortcuts");
        await shortcuts.getByRole("button", { name: t(language, "reader.viewAll"), exact: true }).click();
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "32px";
        });
        const links = shortcuts.getByRole("link");
        await expect(links).toHaveCount(6);
        expect(
          await links.evaluateAll((nodes) =>
            nodes.every(
              (node) => node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1,
            ),
          ),
        ).toBe(true);
        const tops = await links.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        expect(new Set(tops).size).toBe(6);
      }
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(0);
      expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(
        true,
      );
      await cards.first().focus();
      await expect(cards.first()).toBeFocused();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${language}-home-clear-${width}.png`) });
    });
  }
}

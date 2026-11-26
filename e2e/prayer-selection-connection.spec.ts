import { openPrayerDialog, closePrayerDialog } from "./helpers/home-overview";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openHome(page: Page, language: "ar" | "en", width: number, material = "glass", time = "05:40:00") {
  await page.setViewportSize({ width, height: 1000 });
  await page.clock.setFixedTime(new Date("2026-10-18T" + time + "+03:00"));
  await page.addInitScript(
    ({ language, material }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            appMaterial: material,
            homeMaterial: material,
            themeMode: "midnight",
            reduceMotion: true,
          },
          profile: { isGuest: true },
        }),
      );
    },
    { language, material },
  );
  await page.goto("/#/home");
  const current = await page
    .locator('[data-density="summary"][data-prayer-state="current"]')
    .getAttribute("data-prayer");
  await openPrayerDialog(page, current!);
  await page.evaluate(() => document.fonts.ready);
}

async function expectAligned(page: Page) {
  const panel = page.getByTestId("home-prayer-moment");
  const selected = page.getByTestId("home-all-prayers-row").locator('[data-selected="true"]');
  await expect(selected).toHaveCount(1);
  await expect(selected).toHaveCSS("outline-width", "2px");
  await expect(selected.locator("button")).toHaveAttribute("aria-haspopup", "dialog");
  await expect(panel.locator(".prayer-tracking-body")).toHaveAttribute(
    "data-prayer",
    (await selected.getAttribute("data-prayer"))!,
  );
  await expect(panel).toHaveCSS("position", "fixed");
  await expect(panel).toHaveAttribute("data-dropdown-surface", "");
  expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await expect(page.locator(".home-prayer-bridge")).toHaveCount(0);
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test("localized prayer connection " + language + " " + width + " @cross-browser", async ({ page }, testInfo) => {
      await openHome(page, language, width);
      await expectAligned(page);
      const panel = page.getByTestId("home-prayer-moment");
      const selected = page.locator('[data-selected="true"]');
      const row = (await page.getByTestId("home-all-prayers-row").boundingBox())!;
      const detail = (await panel.boundingBox())!;
      expect(detail.x + detail.width / 2).toBeCloseTo(width / 2, 0);
      expect(detail.y).toBeGreaterThanOrEqual(0);
      expect(row.width).toBeGreaterThan(0);
      expect(detail.y + detail.height).toBeLessThanOrEqual(1000);
      if (testInfo.project.name === "desktop-chromium") {
        const scene = page.getByTestId("time-of-day-scene-window").last().locator("img");
        await expect
          .poll(() =>
            scene.evaluate((n) => (n as HTMLImageElement).complete && (n as HTMLImageElement).naturalWidth > 0),
          )
          .toBe(true);
        await page.screenshot({
          path: "output/playwright/prayer-connection/after-" + language + "-" + width + ".png",
          scale: "css",
        });
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="home-prayer-moment"]').analyze()).violations,
      ).toEqual([]);
      await page.setViewportSize({ width: width === 1440 ? 1000 : 480, height: 1000 });
      await expectAligned(page);
      await page.locator("html").evaluate((n) => (n.style.fontSize = "32px"));
      await expect(selected).toHaveCount(1);
      await expectAligned(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}

test("selection follows keyboard activation and remains independent of browsing @cross-browser", async ({
  page,
}, testInfo) => {
  await openHome(page, "ar", 390, "glass", "19:45:00");
  const row = page.getByTestId("home-all-prayers-row");
  const panel = page.getByTestId("home-prayer-moment");
  await closePrayerDialog(page);
  const maghrib = row.locator('[data-prayer="maghrib"] button');
  await maghrib.focus();
  await maghrib.press("Enter");
  await expect(panel.locator(".prayer-tracking-body")).toHaveAttribute("data-prayer", "maghrib");
  expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await expectAligned(page);
  await panel.getByRole("checkbox").first().focus();
  await page.keyboard.press("Tab");
  expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await closePrayerDialog(page);
  await expect(maghrib).toBeFocused();
  await openPrayerDialog(page, "isha");
  await expectAligned(page);
  if (testInfo.project.name === "desktop-chromium")
    await page.screenshot({ path: "output/playwright/prayer-connection/selected-isha-phone.png", scale: "css" });
  await closePrayerDialog(page);
  await page.locator(".home-content-scroll").evaluate((node) => {
    node.scrollTop = 130;
  });
  await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-expanded", "true");
  await page.locator(".home-content-scroll").evaluate((node) => {
    node.scrollTop = 0;
  });
  await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-expanded", "true");
});

test("opaque and forced-color connection retains native disclosure @cross-browser", async ({ page }) => {
  await openHome(page, "en", 390, "solid");
  await expectAligned(page);
  const panel = page.getByTestId("home-prayer-moment");
  await expect(panel.locator(".hero-glass")).toHaveCount(0);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(panel).toHaveAttribute("data-dropdown-surface", "");
  await expect(page.locator('[data-selected="true"] button')).toHaveAttribute("aria-haspopup", "dialog");
  await expect(panel.getByTestId("prayer-open-adhkar")).toBeVisible();
});

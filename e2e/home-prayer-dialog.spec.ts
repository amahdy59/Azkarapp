import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

async function openHome(page: Page, language: "ar" | "en", material = "solid", theme = "midnight") {
  await fixtureReminderCatalogue(page);
  await page.clock.setFixedTime(new Date("2026-11-25T12:30:00+02:00"));
  await page.addInitScript(
    ({ language, material, theme }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      if (localStorage.getItem("azkarapp.state.v1")) return;
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: theme, appMaterial: material, homeMaterial: material, reduceMotion: true },
          profile: { isGuest: true },
          prayerTracking: [
            { dayKey: "2026-11-25", prayer: "fajr", mosque: false, location: "home", adhkar: false },
            { dayKey: "2026-11-25", prayer: "dhuhr", mosque: false, adhkar: true, sunnahBefore: true },
          ],
        }),
      );
    },
    { language, material, theme },
  );
  await page.goto("/#/home");
  await expect(page.getByTestId("home-prayer-disclosure")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

for (const language of ["ar", "en"] as const) {
  test(`prayer dialog records the prayer independently and restores context ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1000 });
    await openHome(page, language);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("prayer-recorded-fajr")).toBeVisible();
    await expect(page.getByTestId("prayer-recorded-dhuhr")).toHaveCount(0);
    const future = page.getByTestId("prayer-card-isha").locator("button");
    await expect(future).toBeDisabled();
    const opener = page.getByTestId("prayer-card-dhuhr").locator("button");
    const context = page.getByTestId("home-primary-card");
    const before = await context.boundingBox();
    await opener.click();
    const dialog = page.getByTestId("home-prayer-moment");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("data-dropdown-surface", "");
    await expect(dialog.getByTestId("prayer-record-date")).toBeVisible();
    await expect(dialog.getByTestId("prayer-actions-more-info")).toHaveCount(0);
    const prayed = dialog.getByTestId("prayer-action-location").getByRole("checkbox");
    await expect(prayed).not.toBeChecked();
    await prayed.check();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("azkarapp.state.v1")!).prayerTracking.find(
              (r: { prayer: string }) => r.prayer === "dhuhr",
            )?.location,
        ),
      )
      .toBe("mosque");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(page.getByTestId("prayer-recorded-dhuhr")).toBeVisible();
    expect((await context.boundingBox())!.y).toBeCloseTo(before!.y, 0);
    await opener.click();
    await expect(prayed).toBeChecked();
    await prayed.uncheck();
    await dialog.getByRole("button", { name: language === "ar" ? "تم" : "Done", exact: true }).click();
    await expect(page.getByTestId("prayer-recorded-dhuhr")).toHaveCount(0);
    await opener.click();
    await dialog.getByTestId("modal-close-button").focus();
    await dialog.getByTestId("modal-close-button").press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#\/home$/);
    await expect(opener).toBeFocused();
    await page.reload();
    await expect(page.getByTestId("prayer-recorded-fajr")).toBeVisible();
    await expect(page.getByTestId("prayer-recorded-dhuhr")).toHaveCount(0);
  });

  test(`manual timings survive scrolling clock and resizing ${language} @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 855 });
    await openHome(page, language, "glass");
    const toggle = page.getByTestId("home-prayer-disclosure");
    const timings = page.locator("#home-prayer-timings");
    const scroll = page.locator(".home-content-scroll");
    await scroll.evaluate((node) => {
      node.scrollTop = 240;
    });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("home-sticky-prayers")).toHaveAttribute("data-scrolled", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(timings).toHaveAttribute("inert", "");
    for (const [width, hour] of [
      [390, "12:35"],
      [1440, "15:40"],
      [768, "19:00"],
    ] as const) {
      await page.setViewportSize({ width, height: 855 });
      await scroll.evaluate((node) => {
        node.scrollTop = 0;
      });
      await page.clock.setFixedTime(new Date(`2026-11-25T${hour}:00+02:00`));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByTestId("home-prayer-interval")).toBeVisible();
      await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
    }
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(timings).not.toHaveAttribute("inert");
    await expect(page.getByTestId("home-all-prayers-row").locator("article")).toHaveCount(5);
  });

  for (const material of ["solid", "glass"]) {
    for (const [width, height, enlarged] of [
      [768, 855, false],
      [1024, 900, false],
      [1440, 1000, false],
      [390, 844, false],
      [320, 700, true],
    ] as const) {
      test(`prayer surfaces reflow and keep dialog controls reachable ${language} ${material} ${width} @cross-browser`, async ({
        page,
      }, info) => {
        await openHome(page, language, material, material === "solid" ? "light" : "midnight");
        await page.setViewportSize({ width, height });
        await page.locator("html").evaluate((node, enlarged) => {
          node.style.fontSize = enlarged ? "200%" : "";
        }, enlarged);
        await page.locator(".home-content-scroll").evaluate((node) => {
          node.scrollTop = 0;
        });
        const cards = page.getByTestId("home-all-prayers-row");
        const geometry = await cards.evaluate((node) =>
          [...node.querySelectorAll("button")].map((button) => ({
            width: button.clientWidth,
            height: button.clientHeight,
            overflow: button.scrollWidth - button.clientWidth,
            top: button.getBoundingClientRect().top,
          })),
        );
        expect(
          geometry.every((r) => r.width >= 44 && r.height >= 44 && r.overflow <= 1),
          JSON.stringify(geometry),
        ).toBe(true);
        if (width === 768) {
          expect(new Set(geometry.map((r) => Math.round(r.top))).size).toBe(1);
          await expect(cards.locator("[data-prayer-time]").first()).toHaveCSS("font-size", "28px");
        }
        await page.getByTestId("prayer-card-dhuhr").locator("button").click();
        const dialog = page.getByTestId("home-prayer-moment");
        if (enlarged) {
          const labelNodes = dialog.locator('.prayer-actions-list [id^="prayer-action-label-"]');
          await expect(labelNodes).toHaveCount(4);
          const labels = await labelNodes.evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect().width),
          );
          expect(Math.min(...labels)).toBeGreaterThanOrEqual(100);
        }
        const done = dialog.getByRole("button", { name: language === "ar" ? "تم" : "Done", exact: true });
        await expect(done).toBeInViewport();
        await expect(
          dialog.getByRole("button", { name: language === "ar" ? "إغلاق" : "Close", exact: true }),
        ).toBeInViewport();
        await dialog.getByTestId("prayer-open-adhkar").scrollIntoViewIfNeeded();
        await expect(dialog.getByTestId("prayer-open-adhkar")).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 768 || width === 390) {
          await page.screenshot({
            path: `output/playwright/prayer-dialog/${info.project.name}-${language}-${material}-${width}-dialog.png`,
          });
          expect(
            (await new AxeBuilder({ page }).include('[data-testid="home-prayer-moment"]').analyze()).violations,
          ).toEqual([]);
        }
        await done.click();
        await expect(dialog).toBeHidden();
        if (width === 768 || width === 1440)
          await page.screenshot({
            path: `output/playwright/prayer-dialog/${info.project.name}-${language}-${material}-${width}.png`,
          });
      });
    }
  }
}

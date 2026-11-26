import { chooseProgressDetail, chooseProgressOption, openPrayerBreakdown } from "./helpers/progress";
import { expect, test, type Page } from "@playwright/test";
import { assertPrayerOverview } from "./helpers/home-overview";

async function openHome(page: Page) {
  await page.clock.setFixedTime(new Date("2026-09-05T22:30:00+03:00"));
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", reduceMotion: true },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  await page.getByTestId("prayer-card-isha").getByRole("button").click();
  await expect(page.getByTestId("prayer-actions-card")).toBeVisible();
}

test.describe("after-prayer tracking", () => {
  test("fills the mosque completion mark with the theme colour when ticked", async ({ page }) => {
    await openHome(page);
    const row = page.getByTestId("prayer-action-location");
    const mark = row.locator(".tracking-check");
    const checkbox = row.getByRole("checkbox");
    await expect(checkbox).toHaveAccessibleName("صليتها في المسجد");
    await expect(mark).not.toHaveAttribute("data-checked", "true");
    await checkbox.check();
    await expect(mark).toHaveAttribute("data-checked", "true");
    await expect
      .poll(() =>
        mark.evaluate((node) => {
          const style = getComputedStyle(node);
          return style.backgroundColor === style.borderTopColor && style.backgroundColor !== "rgba(0, 0, 0, 0)";
        }),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("azkarapp.state.v1")!).prayerTracking.find(
              (record: { prayer: string }) => record.prayer === "isha",
            )?.location,
        ),
      )
      .toBe("mosque");
  });

  test("prayer evidence is optional and undo does not interrupt recording", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    const actions = page.getByTestId("prayer-actions-card");
    const checkbox = actions.getByTestId("prayer-action-location").getByRole("checkbox");
    await checkbox.check();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    const guidance = actions.locator(".prayer-dialog-guidance").last();
    await guidance.locator("summary").click();
    await expect(guidance.getByTestId("prayer-inline-info")).toBeVisible();
    await guidance.locator("summary").click();
    await checkbox.uncheck();
    await expect(guidance.locator(".prayer-sunnah-details")).toBeHidden();
    await expect(checkbox).not.toBeChecked();
  });

  test("summary cards reflow on phones and fit the wide canvas without squeezed text", async ({ page }) => {
    await openHome(page);
    await page.keyboard.press("Escape");
    const grid = page.getByTestId("home-all-prayers-row");
    const cards = grid.locator("article[data-prayer]");
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(cards).toHaveCount(5);
    expect(await grid.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(false);
    await assertPrayerOverview(page);
    for (const card of await cards.all()) {
      expect((await card.boundingBox())!.width).toBeGreaterThanOrEqual(100);
      expect(await card.locator("h3").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => grid.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(false);
    await assertPrayerOverview(page);
  });

  test("all five prayer records stay available without bringing recording controls into Progress", async ({ page }) => {
    await openHome(page);
    await page.goto("/#/progress/day");
    await chooseProgressDetail(page, "prayers");
    // The fixture starts a localized week with no completed days. Select an
    // elapsed month so this read-only breakdown has real dates to summarize.
    await chooseProgressOption(
      page.getByRole("combobox", { name: "نطاق التاريخ", exact: true, includeHidden: true }),
      "month",
    );
    const group = await openPrayerBreakdown(page, "ar");
    await expect(group.locator("input[type=checkbox], textarea")).toHaveCount(0);
    const records = group.locator(":scope > ul > li");
    await expect(records).toHaveCount(5);
    for (const name of ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"])
      await expect(records.filter({ hasText: name })).toHaveCount(1);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(records).toHaveCount(5);
    await expect(group.locator("input[type=checkbox], textarea, table")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

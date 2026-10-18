import { expect, test, type Page } from "@playwright/test";

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
    await openHome(page);
    const actions = page.getByTestId("prayer-actions-card");
    const checkbox = actions.getByTestId("prayer-action-location").getByRole("checkbox");
    await checkbox.check();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await actions.getByTestId("prayer-actions-more-info").click();
    const modal = page.getByTestId("prayer-actions-info-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("prayer-info-points").getByRole("listitem").first()).toBeVisible();
    await modal.getByTestId("modal-close-button").click();
    await checkbox.uncheck();
    await expect(modal).toBeHidden();
    await expect(checkbox).not.toBeChecked();
  });

  test("summary cards scroll on phones and fit the wide canvas without squeezed text", async ({ page }) => {
    await openHome(page);
    const grid = page.getByTestId("home-all-prayers-row");
    const cards = grid.locator("article[data-prayer]");
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(cards).toHaveCount(5);
    expect(await grid.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
    for (const card of await cards.all()) {
      expect((await card.boundingBox())!.width).toBeGreaterThanOrEqual(100);
      expect(await card.locator("h3").evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => grid.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(false);
  });

  test("all five prayer records stay available without bringing recording controls into Progress", async ({ page }) => {
    await openHome(page);
    await page.goto("/#/progress");
    const group = page.getByTestId("progress-prayer-group");
    await expect(group.locator("input, select, button")).toHaveCount(0);
    await group.getByText("تفاصيل الصلوات", { exact: true }).click();
    await expect(group.getByRole("row")).toHaveCount(6);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(group.getByRole("row")).toHaveCount(6);
    await expect(group.getByRole("region")).toBeVisible();
  });
});

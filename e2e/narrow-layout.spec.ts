import { expect, test, type Page } from "@playwright/test";

async function enterEnglishGuestMode(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-en").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation")).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page, screenName: string) {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
        })),
      { message: `${screenName} should fit the 320px viewport without horizontal scrolling` },
    )
    .toEqual({ viewportWidth: 320, documentWidth: 320, bodyWidth: 320 });
}

test("core app screens do not overflow a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await enterEnglishGuestMode(page);
  await expectNoHorizontalOverflow(page, "Home");
  for (const testId of ["hijri-date", "next-prayer"]) {
    const chip = page.getByTestId(testId);
    await expect(chip).toBeVisible();
    expect(
      await chip.evaluate((element) => ({
        fits: element.scrollWidth <= element.clientWidth,
        hasRemovedIcon: /[🌙🕌]/u.test(element.textContent ?? ""),
      })),
    ).toEqual({ fits: true, hasRemovedIcon: false });
  }

  await page.getByRole("button", { name: "Azkar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Azkar Library", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Azkar Library");

  await page.getByTestId("category-card-morning").click();
  await expect(page.locator("h1", { hasText: "Morning Azkar" })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Category");

  await page.getByRole("button", { name: "Start Session", exact: true }).click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  await expectNoHorizontalOverflow(page, "Reader");

  await page.getByRole("button", { name: "Reference", exact: true }).click();
  await expect(page.getByTestId("reference-sheet")).toBeVisible();
  await expectNoHorizontalOverflow(page, "Reference sheet");
  await page.getByTestId("reference-sheet").getByRole("button", { name: "Close reference", exact: true }).click();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "Settings");
});

test("Arabic large text remains readable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await enterEnglishGuestMode(page);

  await page.getByTestId("nav-settings").click();
  await page.getByRole("button", { name: "Accessibility", exact: true }).click();
  await page.getByTestId("text-size-option-large").click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByTestId("settings-language-ar").click();
  await page.getByTestId("nav-home").click();

  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expectNoHorizontalOverflow(page, "Arabic large-text Home");

  const clipped = await page
    .locator('[data-testid="prayer-header-card"] span, [data-testid^="nav-"] span:last-child')
    .evaluateAll((elements) =>
      elements.flatMap((element) =>
        element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
          ? [element.textContent?.trim()]
          : [],
      ),
    );
  expect(clipped).toEqual([]);
});

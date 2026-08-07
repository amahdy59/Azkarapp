import { expect, test, type Page } from "@playwright/test";

async function openArabicSearch(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-ar").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.getByRole("button", { name: "الأذكار", exact: true }).click();
  await page
    .getByRole("button", { name: /بحث|ابحث/ })
    .first()
    .click();
  return page.getByRole("textbox").first();
}

test("Arabic search matches undiacritized typing against vocalized content", async ({ page }) => {
  const input = await openArabicSearch(page);

  // The corpus stores "بِاسْمِكَ اللَّهُمَّ" fully vocalized. Nobody types tashkeel,
  // so a raw substring match found nothing at all for ordinary Arabic input.
  await input.fill("باسمك اللهم");

  const results = page.getByRole("region", { name: /بحث/ });
  await expect(results.getByText(/لم يتم العثور/)).toHaveCount(0);

  // Compare on a normalized key: asserting the exact vocalized string is
  // brittle because diacritics can differ by Unicode byte sequence.
  const matched = await results.evaluate((el) =>
    el.innerText
      .normalize("NFC")
      .replace(/[ً-ْٰـ]/g, "")
      .includes("باسمك اللهم"),
  );
  expect(matched).toBe(true);
});

test("search normalizes the query without altering displayed content", async ({ page }) => {
  const input = await openArabicSearch(page);
  await input.fill("احيانا");

  // Matching folds alef variants, but the rendered zikr must keep its authored
  // spelling and diacritics exactly.
  const results = page.getByRole("region", { name: /بحث/ });
  await expect(results.getByText("أَحْيَانَا", { exact: false }).first()).toBeVisible();
});

test("search announces its result count in a live region", async ({ page }) => {
  const input = await openArabicSearch(page);
  await input.fill("باسمك اللهم");

  const live = page.locator('[aria-live="polite"]').filter({ hasText: /نتيجة|نتائج/ });
  await expect(live.first()).toBeVisible();
});

test("an unmatched query shows the empty state rather than a blank panel", async ({ page }) => {
  const input = await openArabicSearch(page);
  await input.fill("زقزقةغير");

  await expect(page.getByText(/لم يتم العثور/)).toBeVisible();
});

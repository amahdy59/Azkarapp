import { expect, test, type Page } from "@playwright/test";

/** Runs the Arabic onboarding flow and stops on the Azkar Library. */
async function openArabicLibrary(page: Page) {
  await page.goto("/");
  await page.getByTestId("language-option-ar").click();
  await page.getByTestId("confirm-language").click();
  await page.getByTestId("onboarding-get-started").click();
  await page.getByTestId("continue-as-guest").click();
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.getByTestId("nav-azkar").click();
  return page.getByRole("textbox").first();
}

/** Escalates from the Library to the full Search screen and returns its input. */
async function openArabicSearch(page: Page) {
  const libraryInput = await openArabicLibrary(page);
  await libraryInput.fill("سفر");
  await libraryInput.press("Enter");
  await expect(page).toHaveURL(/#\/search/);
  const searchInput = page.getByRole("textbox").first();
  await searchInput.fill("");
  return searchInput;
}

function hasVisibleLabel(input: HTMLInputElement) {
  return Array.from(input.labels ?? []).some((label) => {
    const box = label.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && getComputedStyle(label).visibility !== "hidden";
  });
}

test("typing in the Library filters in place instead of navigating", async ({ page }) => {
  const libraryInput = await openArabicLibrary(page);

  await expect(page).toHaveURL(/#\/azkar/);
  await libraryInput.click();
  await expect(page).toHaveURL(/#\/azkar/);

  expect(await libraryInput.evaluate((input) => getComputedStyle(input).direction)).toBe("rtl");
  expect(await libraryInput.evaluate(hasVisibleLabel)).toBe(true);

  // Typing narrows the collections and must leave the user on the Library.
  await libraryInput.fill("النوم");
  await expect(page).toHaveURL(/#\/azkar/);
  await expect(page.getByRole("button", { name: /أذكار النوم/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /أذكار الصباح/ })).toHaveCount(0);
});

test("submitting the Library query opens Search and preserves it", async ({ page }) => {
  const libraryInput = await openArabicLibrary(page);

  await libraryInput.fill("sleep");
  await expect(page).toHaveURL(/#\/azkar/);

  await libraryInput.press("Enter");
  await expect(page).toHaveURL(/#\/search/);

  const searchInput = page.getByRole("textbox").first();
  await expect(searchInput).toHaveValue("sleep");
  expect(await searchInput.evaluate((input) => getComputedStyle(input).direction)).toBe("ltr");
  expect(await searchInput.evaluate(hasVisibleLabel)).toBe(true);
});

test("Library search and tabs share a desktop row and stack on compact screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // The Collections/Saved tablist lives on the Library, not the Search screen.
  const input = await openArabicLibrary(page);
  const tabs = page.getByRole("tablist");

  const desktopInput = await input.boundingBox();
  const desktopTabs = await tabs.boundingBox();
  expect(desktopInput).not.toBeNull();
  expect(desktopTabs).not.toBeNull();
  expect(
    desktopInput!.x + desktopInput!.width <= desktopTabs!.x || desktopTabs!.x + desktopTabs!.width <= desktopInput!.x,
  ).toBe(true);
  expect(Math.min(desktopInput!.y + desktopInput!.height, desktopTabs!.y + desktopTabs!.height)).toBeGreaterThan(
    Math.max(desktopInput!.y, desktopTabs!.y),
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const compactInput = await input.boundingBox();
  const compactTabs = await tabs.boundingBox();
  expect(compactInput).not.toBeNull();
  expect(compactTabs).not.toBeNull();
  expect(compactTabs!.y).toBeGreaterThanOrEqual(compactInput!.y + compactInput!.height);
});

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

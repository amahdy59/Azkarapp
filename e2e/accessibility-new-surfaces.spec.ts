import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The overlay surfaces added alongside the reader and prayer tracking.
 *
 * The existing accessibility sweep predates all three, so none of them were
 * audited. Overlays are where these problems hide: they trap focus, they sit
 * on their own stacking context, and their contrast comes from a tint over a
 * surface rather than from a token.
 */
async function seed(page: Page, hash: string) {
  await page.clock.setFixedTime(new Date("2026-09-05T22:30:00+03:00"));
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  });
  await page.goto(hash);
}

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page: Page, selector: string) {
  const results = await new AxeBuilder({ page }).include(selector).withTags(WCAG).analyze();
  return results.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }));
}

test("immersive Mushaf mode has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await seed(page, "/#/azkar/friday-kahf/1");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  const mushafBtn = page.getByTestId("reader-mushaf-button");
  await expect(mushafBtn).toBeVisible();
  await mushafBtn.click();
  await expect(page.getByTestId("mushaf-immersive")).toBeVisible();

  expect(await scan(page, '[data-testid="mushaf-immersive"]')).toEqual([]);
});

test("the interactive word-meaning card is named, reachable, and has no automatic WCAG A/AA violations", async ({
  page,
}) => {
  await seed(page, "/#/azkar/morning/4");
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  await page.getByRole("switch", { name: "كلمات غريبة", exact: true }).click();
  await page.getByTestId("quran-word-help").first().click();
  const card = page.getByTestId("quran-word-popover");
  await expect(card).toBeVisible();
  await expect(card).toHaveRole("dialog");
  await expect(card).toHaveAccessibleName(/المعنى/);

  const actionBox = await page.getByTestId("quran-word-popover-all").boundingBox();
  expect(actionBox?.height).toBeGreaterThanOrEqual(44);
  await expect(card).toContainText("الآية");
  await expect(card).not.toContainText("الميسر في غريب القرآن");

  expect(await scan(page, '[data-testid="quran-word-popover"]')).toEqual([]);
});

test("the prayer information dialog has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await seed(page, "/#/home");
  await page.getByTestId("prayer-card-isha").getByRole("button").click();
  const actions = page.getByTestId("prayer-actions-card");
  await expect(actions).toBeVisible();
  await actions.getByTestId("prayer-actions-more-info").click();
  await expect(page.getByTestId("prayer-actions-info-modal")).toBeVisible();
  expect(await scan(page, '[data-testid="prayer-actions-info-modal"]')).toEqual([]);
});

test("the collection share modal has no automatically detectable WCAG A/AA violations", async ({ page }, testInfo) => {
  await seed(page, "/#/azkar");
  await page.getByTestId("category-card-morning").click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();
  const sidebarToggle = page.getByTestId("reader-sidebar-toggle");
  if (await sidebarToggle.isVisible()) await sidebarToggle.click();
  else {
    await page.getByRole("button", { name: /خيارات القارئ|Reader options/ }).click();
    await page.getByRole("menuitem", { name: /عرض القائمة الجانبية|Show sidebar/ }).click();
  }
  const shareBtn = page.getByRole("button", {
    name: /Share collection azkar as story cards for social status|مشاركة أذكار المجموعة/,
  });
  await shareBtn.click();

  const modal = page.getByTestId("collection-share-modal");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("img")).toBeVisible();
  for (const button of await modal.getByRole("button").all()) {
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: testInfo.outputPath("collection-sharing.png") });

  expect(await scan(page, '[data-testid="collection-share-modal"]')).toEqual([]);
});
